import { Router } from 'express'
import path from 'node:path'
import fs from 'node:fs'
import { z } from 'zod'
import pool from '../config/database.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiError } from '../middleware/errors.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadRoot } from '../middleware/uploads.js'
import { readBody } from '../utils/validation.js'
import { getPrivateDocumentLocation, sendPrivateDocument } from '../utils/storage.js'
import { writeAudit } from '../utils/audit.js'

const router = Router()
router.use(requireAuth, requireRole('ADMIN'))

router.get('/dashboard', asyncHandler(async (req, res) => {
  const [[orgs], [users], [pets], [rescues], [applications]] = await Promise.all([
    pool.execute("SELECT COUNT(*) AS total, SUM(verification_status = 'Pending') AS pending FROM organizations"),
    pool.execute('SELECT COUNT(*) AS total FROM users'),
    pool.execute('SELECT COUNT(*) AS total FROM pets WHERE is_active = TRUE'),
    pool.execute("SELECT COUNT(*) AS total, SUM(status NOT IN ('Closed','Pet Profile Created')) AS open FROM rescue_reports"),
    pool.execute("SELECT COUNT(*) AS total, SUM(status IN ('Submitted','Under Review')) AS pending FROM adoption_applications"),
  ])
  res.json({ data: { organizations: orgs[0], users: users[0], pets: pets[0], rescueReports: rescues[0], adoptionApplications: applications[0] } })
}))

router.get('/organizations', asyncHandler(async (req, res) => {
  const status = String(req.query.status || '').trim()
  const allowed = ['Pending', 'Approved', 'Rejected']
  const params = allowed.includes(status) ? [status] : []
  const where = params.length ? 'WHERE o.verification_status = ?' : ''
  const [rows] = await pool.execute(
    `SELECT o.id, o.organization_name AS name, o.organization_type AS type, o.registration_number AS registrationNumber,
      o.year_established AS yearEstablished, o.description, o.contact_person AS contactPerson, o.designation,
      o.official_email AS email, o.mobile, o.address, o.city, o.state, o.pincode,
      o.verification_status AS status, o.verification_date AS verificationDate, o.rejection_reason AS rejectionReason,
      o.created_at AS createdAt, u.account_status AS userStatus
     FROM organizations o JOIN users u ON u.id = o.owner_user_id ${where} ORDER BY o.created_at DESC`, params,
  )
  res.json({ data: { organizations: rows } })
}))

router.get('/organizations/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT o.*, u.id AS owner_user_id, u.account_status AS user_status FROM organizations o
     JOIN users u ON u.id = o.owner_user_id WHERE o.id = ? LIMIT 1`, [req.params.id],
  )
  const organization = rows[0]
  if (!organization) throw new ApiError(404, 'Organization was not found.', 'ORGANIZATION_NOT_FOUND')
  const [documents] = await pool.execute('SELECT id, document_type AS type, original_name AS name, mime_type AS mimeType, uploaded_at AS uploadedAt FROM organization_documents WHERE organization_id = ? ORDER BY uploaded_at', [organization.id])
  res.json({ data: { organization: {
    id: organization.id, ownerUserId: organization.owner_user_id, name: organization.organization_name,
    type: organization.organization_type, registrationNumber: organization.registration_number,
    yearEstablished: organization.year_established, description: organization.description,
    contactPerson: organization.contact_person, designation: organization.designation, email: organization.official_email,
    mobile: organization.mobile, address: organization.address, city: organization.city, state: organization.state,
    pincode: organization.pincode, status: organization.verification_status,
    verificationDate: organization.verification_date, rejectionReason: organization.rejection_reason,
    createdAt: organization.created_at,
    documents: Object.fromEntries(documents.map((document) => [document.type, {
      id: document.id, name: document.name, mimeType: document.mimeType, uploadedAt: document.uploadedAt,
      downloadUrl: `/api/admin/organizations/${organization.id}/documents/${document.id}`,
    }])),
  } } })
}))

router.get('/organizations/:id/documents/:documentId', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM organization_documents WHERE id = ? AND organization_id = ? LIMIT 1', [req.params.documentId, req.params.id])
  const document = rows[0]
  if (!document) throw new ApiError(404, 'Document was not found.', 'DOCUMENT_NOT_FOUND')
  const location = await getPrivateDocumentLocation(document)
  if (typeof location === 'string' && location.startsWith('https://')) return sendPrivateDocument(res, document, location)
  const resolved = path.resolve(location)
  const relative = path.relative(path.resolve(uploadRoot, 'private-documents'), resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(resolved)) throw new ApiError(404, 'Document file was not found.', 'DOCUMENT_NOT_FOUND')
  res.download(resolved, path.basename(document.original_name))
}))

router.patch('/organizations/:id/decision', asyncHandler(async (req, res) => {
  const input = readBody(z.object({ status: z.enum(['Approved', 'Rejected']), rejectionReason: z.string().trim().max(2000).optional().default('') }), req.body)
  if (input.status === 'Rejected' && !input.rejectionReason) throw new ApiError(422, 'Add a reason when rejecting an organization.', 'REJECTION_REASON_REQUIRED')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT verification_status FROM organizations WHERE id = ? FOR UPDATE', [req.params.id])
    if (!rows[0]) throw new ApiError(404, 'Organization was not found.', 'ORGANIZATION_NOT_FOUND')
    if (rows[0].verification_status !== 'Pending') throw new ApiError(409, 'Only pending organizations can be reviewed.', 'INVALID_STATUS_TRANSITION')
    await connection.execute(
      'UPDATE organizations SET verification_status = ?, verification_date = ?, rejection_reason = ? WHERE id = ?',
      [input.status, input.status === 'Approved' ? new Date() : null, input.status === 'Rejected' ? input.rejectionReason : null, req.params.id],
    )
    await writeAudit(connection, req.user.id, `organization.${input.status.toLowerCase()}`, 'organization', req.params.id, { rejectionReason: input.status === 'Rejected' ? input.rejectionReason : undefined })
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  const [updated] = await pool.execute('SELECT id, organization_name AS name, organization_type AS type, verification_status AS status, verification_date AS verificationDate, rejection_reason AS rejectionReason FROM organizations WHERE id = ?', [req.params.id])
  res.json({ data: { organization: updated[0] } })
}))

router.get('/users', asyncHandler(async (req, res) => {
  const role = String(req.query.role || '').trim()
  const status = String(req.query.status || '').trim()
  const conditions = []
  const params = []
  if (['ADMIN', 'USER', 'NGO', 'SHELTER'].includes(role)) { conditions.push('u.role = ?'); params.push(role) }
  if (['Active', 'Inactive'].includes(status)) { conditions.push('u.account_status = ?'); params.push(status) }
  const [rows] = await pool.execute(
    `SELECT u.id, u.full_name AS name, u.email, u.mobile, u.role, u.account_status AS status, u.created_at AS createdAt,
      o.organization_name AS organizationName FROM users u LEFT JOIN organizations o ON o.owner_user_id = u.id
     ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''} ORDER BY u.created_at DESC`, params,
  )
  res.json({ data: { users: rows.map((row) => ({ ...row, accountType: row.role === 'USER' ? 'Adopter' : row.role === 'ADMIN' ? 'Admin' : 'NGO/Shelter', registeredAt: row.createdAt })) } })
}))

router.get('/users/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, full_name AS name, email, mobile, role, account_status AS status, created_at AS createdAt FROM users WHERE id = ? LIMIT 1', [req.params.id])
  if (!rows[0]) throw new ApiError(404, 'User was not found.', 'USER_NOT_FOUND')
  res.json({ data: { user: rows[0] } })
}))

router.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const { status } = readBody(z.object({ status: z.enum(['Active', 'Inactive']) }), req.body)
  if (req.params.id === req.user.id && status === 'Inactive') throw new ApiError(409, 'You cannot deactivate your own admin account.', 'SELF_DEACTIVATION_NOT_ALLOWED')
  const [result] = await pool.execute('UPDATE users SET account_status = ? WHERE id = ? AND role <> ?', [status, req.params.id, 'ADMIN'])
  if (!result.affectedRows) throw new ApiError(404, 'Non-admin user was not found.', 'USER_NOT_FOUND')
  await pool.execute('INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)', [req.user.id, `user.${status.toLowerCase()}`, 'user', req.params.id])
  res.json({ data: { id: req.params.id, status } })
}))

router.get('/pets', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.species, p.breed, p.age, p.age_value AS ageValue, p.age_unit AS ageUnit, p.age_approximate AS ageApproximate,
      p.gender, p.size, p.description, p.rescue_story AS rescueStory, p.personality, p.activity_level AS activityLevel,
      p.good_with_children AS goodWithChildren, p.good_with_dogs AS goodWithDogs, p.good_with_cats AS goodWithCats,
      p.good_with_strangers AS goodWithStrangers, p.vaccinated, p.sterilized, p.medical_condition AS medicalCondition,
      p.special_needs AS specialNeeds, p.address, p.city, p.state, p.pincode, p.adoption_status AS adoptionStatus,
      p.rescue_report_id AS rescueReportId, p.is_active AS isActive, p.created_at AS createdAt,
      o.id AS organizationId, o.organization_name AS organizationName,
      (SELECT image_url FROM pet_images WHERE pet_id = p.id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) AS image
     FROM pets p JOIN organizations o ON o.id = p.organization_id ORDER BY p.created_at DESC`,
  )
  res.json({ data: { pets: rows.map((pet) => {
    const personality = typeof pet.personality === 'string' ? JSON.parse(pet.personality) : pet.personality || []
    return {
      ...pet, personality, organization: pet.organizationName,
      location: pet.city || pet.state || pet.address || '',
      goodWithPets: { dogs: pet.goodWithDogs, cats: pet.goodWithCats },
      status: pet.adoptionStatus === 'Adopted' ? 'adopted' : pet.adoptionStatus === 'Under Adoption' ? 'under-adoption' : 'available',
    }
  }) } })
}))

router.get('/pets/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT p.*, o.organization_name AS organizationName FROM pets p JOIN organizations o ON o.id = p.organization_id WHERE p.id = ? LIMIT 1', [req.params.id])
  if (!rows[0]) throw new ApiError(404, 'Pet was not found.', 'PET_NOT_FOUND')
  const [images] = await pool.execute('SELECT id, image_url AS url, is_primary AS isPrimary, sort_order AS sortOrder FROM pet_images WHERE pet_id = ? ORDER BY is_primary DESC, sort_order', [req.params.id])
  res.json({ data: { pet: { ...rows[0], images: images.map((image) => image.url), image: images[0]?.url || '' } } })
}))

router.get('/rescue-reports', asyncHandler(async (req, res) => {
  const status = String(req.query.status || '').trim()
  const statuses = ['Pending Review', 'Under Review', 'NGO Assigned', 'Rescue Accepted', 'Rescue In Progress', 'Animal Rescued', 'Pet Profile Created', 'Closed']
  const params = statuses.includes(status) ? [status] : []
  const [rows] = await pool.execute(
    `SELECT r.*, o.organization_name AS assigned_organization_name, p.id AS pet_id, p.name AS pet_name
     FROM rescue_reports r LEFT JOIN organizations o ON o.id = r.assigned_organization_id
     LEFT JOIN pets p ON p.rescue_report_id = r.id
     ${params.length ? 'WHERE r.status = ?' : ''} ORDER BY r.created_at DESC`, params,
  )
  res.json({ data: { reports: rows.map((row) => ({
    id: row.id, reportNumber: row.report_number, animalType: row.animal_type, breed: row.breed, age: row.age, gender: row.gender,
    condition: row.condition, description: row.description, photo: row.image_url, address: row.address, city: row.city,
    state: row.state, pincode: row.pincode, dateFound: row.date_found, reporterName: row.reporter_name,
    reporterMobile: row.reporter_mobile, reporterEmail: row.reporter_email || '', additionalInformation: row.additional_information || '',
    status: row.status, assignedOrganizationId: row.assigned_organization_id || '', assignedOrganizationName: row.assigned_organization_name || '',
    petId: row.pet_id || '', petName: row.pet_name || '', createdAt: row.created_at, updatedAt: row.updated_at,
  })) } })
}))

router.get('/rescue-reports/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT r.*, o.organization_name AS assigned_organization_name, p.id AS pet_id, p.name AS pet_name
     FROM rescue_reports r LEFT JOIN organizations o ON o.id = r.assigned_organization_id
     LEFT JOIN pets p ON p.rescue_report_id = r.id WHERE r.id = ? LIMIT 1`, [req.params.id],
  )
  const row = rows[0]
  if (!row) throw new ApiError(404, 'Rescue report was not found.', 'REPORT_NOT_FOUND')
  res.json({ data: { report: {
    id: row.id, reportNumber: row.report_number, animalType: row.animal_type, breed: row.breed, age: row.age, gender: row.gender,
    condition: row.condition, description: row.description, photo: row.image_url, address: row.address, city: row.city,
    state: row.state, pincode: row.pincode, dateFound: row.date_found, reporterName: row.reporter_name,
    reporterMobile: row.reporter_mobile, reporterEmail: row.reporter_email || '', additionalInformation: row.additional_information || '',
    status: row.status, assignedOrganizationId: row.assigned_organization_id || '', assignedOrganizationName: row.assigned_organization_name || '',
    petId: row.pet_id || '', petName: row.pet_name || '', createdAt: row.created_at, updatedAt: row.updated_at,
  } } })
}))

router.patch('/rescue-reports/:id/review', asyncHandler(async (req, res) => {
  const { status } = readBody(z.object({ status: z.literal('Under Review') }), req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT status FROM rescue_reports WHERE id = ? FOR UPDATE', [req.params.id])
    if (!rows[0]) throw new ApiError(404, 'Rescue report was not found.', 'REPORT_NOT_FOUND')
    if (rows[0].status !== 'Pending Review') throw new ApiError(409, 'Only pending reports can enter review.', 'INVALID_STATUS_TRANSITION')
    await connection.execute('UPDATE rescue_reports SET status = ? WHERE id = ?', [status, req.params.id])
    await writeAudit(connection, req.user.id, 'rescue.review_started', 'rescue_report', req.params.id)
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  res.json({ data: { id: req.params.id, status } })
}))

router.patch('/rescue-reports/:id/assign', asyncHandler(async (req, res) => {
  const { organizationId } = readBody(z.object({ organizationId: z.string().min(1).max(64) }), req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [reports] = await connection.execute('SELECT status FROM rescue_reports WHERE id = ? FOR UPDATE', [req.params.id])
    const [organizations] = await connection.execute("SELECT id FROM organizations WHERE id = ? AND verification_status = 'Approved' LIMIT 1", [organizationId])
    if (!reports[0]) throw new ApiError(404, 'Rescue report was not found.', 'REPORT_NOT_FOUND')
    if (reports[0].status !== 'Under Review') throw new ApiError(409, 'Only reviewed reports can be assigned.', 'INVALID_STATUS_TRANSITION')
    if (!organizations[0]) throw new ApiError(422, 'Choose an approved NGO or shelter.', 'ORGANIZATION_NOT_APPROVED')
    await connection.execute("UPDATE rescue_reports SET assigned_organization_id = ?, status = 'NGO Assigned' WHERE id = ?", [organizationId, req.params.id])
    await writeAudit(connection, req.user.id, 'rescue.organization_assigned', 'rescue_report', req.params.id, { organizationId })
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  res.json({ data: { id: req.params.id, status: 'NGO Assigned', assignedOrganizationId: organizationId } })
}))

router.patch('/rescue-reports/:id/close', asyncHandler(async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT status FROM rescue_reports WHERE id = ? FOR UPDATE', [req.params.id])
    if (!rows[0]) throw new ApiError(404, 'Rescue report was not found.', 'REPORT_NOT_FOUND')
    if (rows[0].status !== 'Pet Profile Created') throw new ApiError(409, 'A report can close after its pet profile has been created.', 'INVALID_STATUS_TRANSITION')
    await connection.execute("UPDATE rescue_reports SET status = 'Closed' WHERE id = ?", [req.params.id])
    await writeAudit(connection, req.user.id, 'rescue.closed', 'rescue_report', req.params.id)
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  res.json({ data: { id: req.params.id, status: 'Closed' } })
}))

router.get('/adoption-applications', asyncHandler(async (req, res) => {
  const status = String(req.query.status || '').trim()
  const allowed = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed']
  const params = allowed.includes(status) ? [status] : []
  const [rows] = await pool.execute(
    `SELECT a.*, p.name AS pet_name, o.organization_name, u.full_name AS adopter_name
     FROM adoption_applications a JOIN pets p ON p.id = a.pet_id JOIN organizations o ON o.id = a.organization_id
     JOIN users u ON u.id = a.adopter_id ${params.length ? 'WHERE a.status = ?' : ''} ORDER BY a.submitted_at DESC`, params,
  )
  res.json({ data: { applications: rows.map((row) => ({
    id: row.id, applicationNumber: row.application_number, petId: row.pet_id, petName: row.pet_name,
    organizationId: row.organization_id, organizationName: row.organization_name, adopterId: row.adopter_id,
    applicantName: row.applicant_name, email: row.email, mobile: row.mobile, address: row.address, city: row.city,
    pincode: row.pincode, reason: row.reason, housingType: row.housing_type, petExperience: row.pet_experience,
    hasOtherPets: Boolean(row.has_other_pets), otherPetsDetails: row.other_pets_details,
    primaryCaregiver: row.primary_caregiver, additionalInformation: row.additional_information,
    status: row.status, rejectionReason: row.rejection_reason || '', submittedAt: row.submitted_at,
    updatedAt: row.updated_at, completedAt: row.completed_at || '',
  })) } })
}))

router.get('/adoption-applications/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT a.*, p.name AS pet_name, o.organization_name, u.full_name AS adopter_name FROM adoption_applications a
     JOIN pets p ON p.id = a.pet_id JOIN organizations o ON o.id = a.organization_id JOIN users u ON u.id = a.adopter_id WHERE a.id = ? LIMIT 1`,
    [req.params.id],
  )
  if (!rows[0]) throw new ApiError(404, 'Adoption application was not found.', 'APPLICATION_NOT_FOUND')
  const row = rows[0]
  res.json({ data: { application: {
    id: row.id, applicationNumber: row.application_number, petId: row.pet_id, petName: row.pet_name,
    organizationId: row.organization_id, organizationName: row.organization_name, adopterId: row.adopter_id,
    applicantName: row.applicant_name, email: row.email, mobile: row.mobile, address: row.address, city: row.city,
    pincode: row.pincode, reason: row.reason, housingType: row.housing_type, petExperience: row.pet_experience,
    hasOtherPets: Boolean(row.has_other_pets), otherPetsDetails: row.other_pets_details,
    primaryCaregiver: row.primary_caregiver, additionalInformation: row.additional_information,
    status: row.status, rejectionReason: row.rejection_reason || '', submittedAt: row.submitted_at,
    updatedAt: row.updated_at, completedAt: row.completed_at || '',
  } } })
}))

export default router
