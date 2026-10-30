import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import { z } from 'zod'
import pool from '../config/database.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiError } from '../middleware/errors.js'
import { requireApprovedOrganization, requireAuth, requireRole } from '../middleware/auth.js'
import { upload } from '../middleware/uploads.js'
import { asBoolean, parseJson, readBody } from '../utils/validation.js'
import { persistUpload } from '../utils/storage.js'
import { writeAudit } from '../utils/audit.js'

const router = Router()
const imageValue = z.string().trim().min(1).max(2048).refine((value) => value.startsWith('/uploads/pets/') || /^https?:\/\//i.test(value), 'Use an HTTP image URL or an uploaded pet image.')
const petSchema = z.object({
  name: z.string().trim().min(1).max(120),
  species: z.string().trim().min(1).max(60),
  breed: z.string().trim().max(120).optional().default(''),
  age: z.string().trim().max(60).optional().default('Unknown'),
  ageValue: z.string().trim().max(12).optional().default(''),
  ageUnit: z.enum(['months', 'years']).optional().default('years'),
  ageApproximate: z.string().trim().max(40).optional().default(''),
  gender: z.string().trim().max(40).optional().default('Unknown'),
  size: z.string().trim().max(40).optional().default(''),
  description: z.string().trim().max(10000).optional().default(''),
  rescueStory: z.string().trim().max(10000).optional().default(''),
  personality: z.array(z.string().trim().max(60)).max(20).optional().default([]),
  activityLevel: z.string().trim().max(40).optional().default(''),
  goodWithChildren: z.union([z.boolean(), z.string()]).nullable().optional(),
  goodWithDogs: z.union([z.boolean(), z.string()]).nullable().optional(),
  goodWithCats: z.union([z.boolean(), z.string()]).nullable().optional(),
  goodWithStrangers: z.union([z.boolean(), z.string()]).nullable().optional(),
  vaccinated: z.union([z.boolean(), z.string()]).nullable().optional(),
  sterilized: z.union([z.boolean(), z.string()]).nullable().optional(),
  medicalCondition: z.string().trim().max(5000).optional().default(''),
  specialNeeds: z.string().trim().max(5000).optional().default(''),
  address: z.string().trim().max(300).optional().default(''),
  city: z.string().trim().max(120).optional().default(''),
  state: z.string().trim().max(120).optional().default(''),
  pincode: z.string().trim().max(12).optional().default(''),
  adoptionStatus: z.enum(['Available', 'Under Adoption', 'Adopted']).optional().default('Available'),
  images: z.array(imageValue).max(8).optional(),
  rescueReportId: z.string().trim().max(64).optional().default(''),
})
const selectPetSql = `SELECT p.*, o.organization_name AS organization_name, o.organization_type AS organization_type,
  pi.id AS image_id, pi.image_url, pi.storage_public_id AS image_public_id, pi.is_primary AS image_is_primary, pi.sort_order
  FROM pets p JOIN organizations o ON o.id = p.organization_id LEFT JOIN pet_images pi ON pi.pet_id = p.id`

function mapPetRows(rows) {
  const pets = new Map()
  for (const row of rows) {
    if (!pets.has(row.id)) {
      pets.set(row.id, {
        id: row.id,
        organizationId: row.organization_id,
        organizationName: row.organization_name,
        organization: row.organization_name,
        species: row.species,
        name: row.name,
        breed: row.breed,
        age: row.age,
        ageValue: row.age_value,
        ageUnit: row.age_unit,
        ageApproximate: row.age_approximate,
        gender: row.gender,
        size: row.size,
        description: row.description,
        rescueStory: row.rescue_story,
        personality: parseJson(row.personality),
        activityLevel: row.activity_level,
        goodWithChildren: row.good_with_children,
        goodWithDogs: row.good_with_dogs,
        goodWithCats: row.good_with_cats,
        goodWithStrangers: row.good_with_strangers,
        goodWithPets: { dogs: row.good_with_dogs, cats: row.good_with_cats },
        vaccinated: row.vaccinated,
        sterilized: row.sterilized,
        medicalCondition: row.medical_condition,
        specialNeeds: row.special_needs,
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        location: row.city || row.state || row.address,
        adoptionStatus: row.adoption_status,
        status: row.adoption_status === 'Adopted' ? 'adopted' : row.adoption_status === 'Under Adoption' ? 'under-adoption' : 'available',
        rescueReportId: row.rescue_report_id || '',
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        images: [],
      })
    }
    const pet = pets.get(row.id)
    if (row.image_id) pet.images.push({ id: row.image_id, url: row.image_url, publicId: row.image_public_id, isPrimary: Boolean(row.image_is_primary), sortOrder: row.sort_order })
  }
  return [...pets.values()].map((pet) => {
    pet.images.sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
    const imageUrls = pet.images.map((image) => image.url)
    pet.images = imageUrls
    pet.image = imageUrls[0] || ''
    return pet
  })
}

async function findPet(id, activeOnly = false) {
  const clauses = ['p.id = ?']
  if (activeOnly) clauses.push('p.is_active = TRUE')
  const [rows] = await pool.execute(`${selectPetSql} WHERE ${clauses.join(' AND ')} ORDER BY pi.is_primary DESC, pi.sort_order ASC`, [id])
  return mapPetRows(rows)[0] || null
}

async function insertImages(connection, petId, urls) {
  for (let index = 0; index < urls.length; index += 1) {
    const image = typeof urls[index] === 'string' ? { url: urls[index], publicId: null } : urls[index]
    await connection.execute(
      'INSERT INTO pet_images (id, pet_id, image_url, storage_public_id, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [randomUUID(), petId, image.url, image.publicId || null, index === 0, index],
    )
  }
}

async function readPetPayload(req, partial = false) {
  let body = req.body
  let order = []
  let input
  try {
    if (typeof req.body.pet === 'string') {
      body = JSON.parse(req.body.pet)
      order = JSON.parse(req.body.imageOrder || '[]')
      if (!Array.isArray(order) || order.length > 8) throw new ApiError(422, 'Upload no more than eight pet images.', 'INVALID_IMAGE_ORDER')
    }
    input = readBody(partial ? petSchema.partial() : petSchema, body)
  } catch (error) {
    for (const file of req.files || []) await fs.rm(file.path, { force: true })
    if (error instanceof ApiError) throw error
    if (error instanceof SyntaxError) throw new ApiError(422, 'Pet details or image order were not valid JSON.', 'VALIDATION_ERROR')
    throw error
  }
  const uploaded = []
  try {
    for (const file of req.files || []) uploaded.push(await persistUpload(file, 'pet-image'))
  } catch (error) {
    for (const file of req.files || []) await fs.rm(file.path, { force: true })
    throw error
  }
  try {
    if (order.length) {
    input.imageRecords = order.map((entry) => {
      if (typeof entry !== 'string') throw new ApiError(422, 'Pet image order contains an invalid item.', 'VALIDATION_ERROR')
      if (entry.startsWith('upload:')) {
        const index = Number(entry.slice(7))
        if (!Number.isInteger(index) || !uploaded[index]) throw new ApiError(422, 'Pet image upload order was invalid.', 'VALIDATION_ERROR')
        return { url: uploaded[index].url, publicId: uploaded[index].publicId }
      }
      if (entry.startsWith('url:')) return { url: imageValue.parse(entry.slice(4)), publicId: null }
      throw new ApiError(422, 'Pet image order contains an invalid item.', 'VALIDATION_ERROR')
    })
    input.images = input.imageRecords.map((image) => image.url)
    } else if (uploaded.length) {
      input.imageRecords = [...(input.images || []).map((url) => ({ url, publicId: null })), ...uploaded.map((image) => ({ url: image.url, publicId: image.publicId }))]
      input.images = input.imageRecords.map((image) => image.url)
    }
  } catch (error) {
    for (const file of req.files || []) await fs.rm(file.path, { force: true })
    throw error
  }
  return input
}

async function insertPet(connection, organizationId, input) {
  let rescueReportId = null
  if (input.rescueReportId) {
    const [reports] = await connection.execute(
      'SELECT id, status, assigned_organization_id, image_url, image_public_id FROM rescue_reports WHERE id = ? OR report_number = ? LIMIT 1 FOR UPDATE',
      [input.rescueReportId, input.rescueReportId],
    )
    const report = reports[0]
    if (!report || report.status !== 'Animal Rescued' || report.assigned_organization_id !== organizationId) {
      throw new ApiError(409, 'This rescue report is not ready to create a pet profile for your organization.', 'RESCUE_NOT_READY')
    }
    rescueReportId = report.id
    if (report.image_url && report.image_public_id) {
      for (const image of input.imageRecords || []) {
        if (image.url === report.image_url && !image.publicId) image.publicId = report.image_public_id
      }
    }
  }
  const id = randomUUID()
  await connection.execute(
    `INSERT INTO pets (id, organization_id, rescue_report_id, name, species, breed, age, age_value, age_unit, age_approximate,
      gender, size, description, rescue_story, personality, activity_level, good_with_children, good_with_dogs, good_with_cats,
      good_with_strangers, vaccinated, sterilized, medical_condition, special_needs, address, city, state, pincode, adoption_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, organizationId, rescueReportId, input.name, input.species, input.breed, input.age, input.ageValue, input.ageUnit,
      input.ageApproximate, input.gender, input.size, input.description, input.rescueStory, JSON.stringify(input.personality),
      input.activityLevel, asBoolean(input.goodWithChildren), asBoolean(input.goodWithDogs), asBoolean(input.goodWithCats),
      asBoolean(input.goodWithStrangers), asBoolean(input.vaccinated), asBoolean(input.sterilized), input.medicalCondition,
      input.specialNeeds, input.address, input.city, input.state, input.pincode, input.adoptionStatus],
  )
  if (input.images?.length) await insertImages(connection, id, input.imageRecords || input.images)
  if (rescueReportId) {
    await connection.execute("UPDATE rescue_reports SET status = 'Pet Profile Created' WHERE id = ? AND status = 'Animal Rescued'", [rescueReportId])
  }
  return id
}

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
  const limit = Math.min(60, Math.max(1, Number.parseInt(req.query.limit, 10) || 24))
  const conditions = ['p.is_active = TRUE']
  const values = []
  const search = String(req.query.search || req.query.q || '').trim().slice(0, 100)
  if (search) {
    conditions.push('(p.name LIKE ? OR p.breed LIKE ? OR p.species LIKE ?)')
    values.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  for (const [queryName, column] of [['species', 'p.species'], ['city', 'p.city'], ['size', 'p.size'], ['gender', 'p.gender'], ['status', 'p.adoption_status']]) {
    const value = String(req.query[queryName] || '').trim()
    if (value) { conditions.push(`${column} = ?`); values.push(value) }
  }
  const where = conditions.join(' AND ')
  const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM pets p WHERE ${where}`, values)
  const [rows] = await pool.execute(`${selectPetSql} WHERE ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`, [...values, limit, (page - 1) * limit])
  res.json({ data: { pets: mapPetRows(rows), page, limit, total: countRows[0].total } })
}))

router.get('/mine', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`${selectPetSql} WHERE p.organization_id = ? ORDER BY p.created_at DESC`, [req.organization.id])
  res.json({ data: { pets: mapPetRows(rows) } })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const pet = await findPet(req.params.id, true)
  if (!pet) throw new ApiError(404, 'Pet was not found.', 'PET_NOT_FOUND')
  res.json({ data: { pet } })
}))

router.post('/', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, upload.array('images', 8), asyncHandler(async (req, res) => {
  const input = await readPetPayload(req)
  if (!input.images?.length) throw new ApiError(422, 'Add at least one pet photo.', 'IMAGES_REQUIRED')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const id = await insertPet(connection, req.organization.id, input)
    await writeAudit(connection, req.user.id, 'pet.created', 'pet', id)
    await connection.commit()
    res.status(201).json({ data: { pet: await findPet(id) } })
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}))

router.put('/:id', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, upload.array('images', 8), asyncHandler(async (req, res) => {
  const input = await readPetPayload(req, true)
  if (!Object.keys(input).length) throw new ApiError(422, 'Provide at least one pet field to update.', 'VALIDATION_ERROR')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT * FROM pets WHERE id = ? AND organization_id = ? FOR UPDATE', [req.params.id, req.organization.id])
    const current = rows[0]
    if (!current) throw new ApiError(404, 'Pet was not found in your organization.', 'PET_NOT_FOUND')
    const protectedApplicationStatuses = ['Approved', 'Completed']
    const [applications] = await connection.execute('SELECT status FROM adoption_applications WHERE pet_id = ? AND status IN (?, ?) LIMIT 1', [current.id, ...protectedApplicationStatuses])
    const controlledStatus = applications.some((application) => application.status === 'Completed') ? 'Adopted' : applications.length ? 'Under Adoption' : current.adoption_status
    if (input.adoptionStatus && input.adoptionStatus !== controlledStatus && applications.length) {
      throw new ApiError(409, 'Pet adoption status is controlled by its application workflow.', 'STATUS_CONTROLLED')
    }
    if (input.adoptionStatus === 'Adopted' && current.adoption_status !== 'Adopted') {
      throw new ApiError(409, 'Complete an approved adoption application to mark a pet adopted.', 'STATUS_CONTROLLED')
    }
    if (input.adoptionStatus === 'Under Adoption' && current.adoption_status !== 'Under Adoption') {
      throw new ApiError(409, 'Approve an adoption application to reserve a pet.', 'STATUS_CONTROLLED')
    }
    const normalized = { ...input }
    const dbFields = {
      name: 'name', species: 'species', breed: 'breed', age: 'age', ageValue: 'age_value', ageUnit: 'age_unit',
      ageApproximate: 'age_approximate', gender: 'gender', size: 'size', description: 'description', rescueStory: 'rescue_story',
      activityLevel: 'activity_level', goodWithChildren: 'good_with_children', goodWithDogs: 'good_with_dogs', goodWithCats: 'good_with_cats',
      goodWithStrangers: 'good_with_strangers', vaccinated: 'vaccinated', sterilized: 'sterilized', medicalCondition: 'medical_condition',
      specialNeeds: 'special_needs', address: 'address', city: 'city', state: 'state', pincode: 'pincode', adoptionStatus: 'adoption_status',
    }
    const assignments = []
    const params = []
    for (const [key, value] of Object.entries(normalized)) {
      if (key === 'images' || key === 'personality' || key === 'rescueReportId') continue
      const column = dbFields[key]
      if (!column) continue
      assignments.push(`${column} = ?`)
      params.push(['goodWithChildren', 'goodWithDogs', 'goodWithCats', 'goodWithStrangers', 'vaccinated', 'sterilized'].includes(key) ? asBoolean(value) : value)
    }
    if (input.personality) { assignments.push('personality = ?'); params.push(JSON.stringify(input.personality)) }
    if (input.images) {
      const [previousImages] = await connection.execute('SELECT image_url AS url, storage_public_id AS publicId FROM pet_images WHERE pet_id = ?', [current.id])
      const previousByUrl = new Map(previousImages.map((image) => [image.url, image.publicId]))
      await connection.execute('DELETE FROM pet_images WHERE pet_id = ?', [current.id])
      const imageRecords = (input.imageRecords || input.images).map((image) => typeof image === 'string'
        ? { url: image, publicId: previousByUrl.get(image) || null }
        : { ...image, publicId: image.publicId || previousByUrl.get(image.url) || null })
      await insertImages(connection, current.id, imageRecords)
    }
    if (assignments.length) await connection.execute(`UPDATE pets SET ${assignments.join(', ')} WHERE id = ?`, [...params, current.id])
    await writeAudit(connection, req.user.id, 'pet.updated', 'pet', current.id, { fields: Object.keys(input).filter((key) => key !== 'images') })
    await connection.commit()
    res.json({ data: { pet: await findPet(current.id) } })
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}))

router.patch('/:id/status', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const { adoptionStatus } = readBody(z.object({ adoptionStatus: z.enum(['Available', 'Under Adoption', 'Adopted']) }), req.body)
  const [rows] = await pool.execute('SELECT adoption_status FROM pets WHERE id = ? AND organization_id = ?', [req.params.id, req.organization.id])
  if (!rows[0]) throw new ApiError(404, 'Pet was not found.', 'PET_NOT_FOUND')
  if (adoptionStatus !== rows[0].adoption_status && adoptionStatus !== 'Available') {
    throw new ApiError(409, 'Use the adoption application workflow to reserve or adopt a pet.', 'STATUS_CONTROLLED')
  }
  if (adoptionStatus === 'Available') {
    const [active] = await pool.execute("SELECT id FROM adoption_applications WHERE pet_id = ? AND status IN ('Approved','Completed') LIMIT 1", [req.params.id])
    if (active.length) throw new ApiError(409, 'A reserved or adopted pet cannot be marked available.', 'STATUS_CONTROLLED')
  }
  await pool.execute('UPDATE pets SET adoption_status = ? WHERE id = ? AND organization_id = ?', [adoptionStatus, req.params.id, req.organization.id])
  res.json({ data: { pet: await findPet(req.params.id) } })
}))

router.post('/:id/images', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, upload.array('images', 8), asyncHandler(async (req, res) => {
  const [pets] = await pool.execute('SELECT id FROM pets WHERE id = ? AND organization_id = ? AND is_active = TRUE', [req.params.id, req.organization.id])
  if (!pets[0]) throw new ApiError(404, 'Pet was not found.', 'PET_NOT_FOUND')
  if (!req.files?.length) throw new ApiError(422, 'Choose at least one pet image to upload.', 'IMAGES_REQUIRED')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [existing] = await connection.execute('SELECT COUNT(*) AS total FROM pet_images WHERE pet_id = ?', [req.params.id])
    let order = Number(existing[0].total)
    for (const file of req.files) {
      const saved = await persistUpload(file, 'pet-image')
      await connection.execute(
        'INSERT INTO pet_images (id, pet_id, image_url, storage_public_id, is_primary, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [randomUUID(), req.params.id, saved.url, saved.publicId, order === 0, order++],
      )
    }
    await connection.commit()
    res.status(201).json({ data: { pet: await findPet(req.params.id) } })
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
}))

router.patch('/:id/images/:imageId/primary', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const [image] = await pool.execute('SELECT i.id FROM pet_images i JOIN pets p ON p.id = i.pet_id WHERE i.id = ? AND p.id = ? AND p.organization_id = ?', [req.params.imageId, req.params.id, req.organization.id])
  if (!image[0]) throw new ApiError(404, 'Image was not found for this pet.', 'IMAGE_NOT_FOUND')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('UPDATE pet_images SET is_primary = FALSE WHERE pet_id = ?', [req.params.id])
    await connection.execute('UPDATE pet_images SET is_primary = TRUE WHERE id = ?', [req.params.imageId])
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  res.json({ data: { pet: await findPet(req.params.id) } })
}))

router.delete('/:id/images/:imageId', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const [images] = await pool.execute('SELECT i.id, i.is_primary FROM pet_images i JOIN pets p ON p.id = i.pet_id WHERE i.id = ? AND p.id = ? AND p.organization_id = ?', [req.params.imageId, req.params.id, req.organization.id])
  if (!images[0]) throw new ApiError(404, 'Image was not found for this pet.', 'IMAGE_NOT_FOUND')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('DELETE FROM pet_images WHERE id = ?', [req.params.imageId])
    if (images[0].is_primary) {
      await connection.execute(
        'UPDATE pet_images SET is_primary = TRUE WHERE id = (SELECT id FROM pet_images WHERE pet_id = ? ORDER BY sort_order ASC LIMIT 1)',
        [req.params.id],
      )
    }
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  res.json({ data: { pet: await findPet(req.params.id) } })
}))

router.delete('/:id', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const [result] = await pool.execute('UPDATE pets SET is_active = FALSE WHERE id = ? AND organization_id = ? AND is_active = TRUE', [req.params.id, req.organization.id])
  if (!result.affectedRows) throw new ApiError(404, 'Pet was not found.', 'PET_NOT_FOUND')
  res.json({ data: { deactivated: true } })
}))

export default router
