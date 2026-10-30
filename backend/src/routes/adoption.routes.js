import { Router } from 'express'
import { randomBytes, randomUUID } from 'node:crypto'
import { z } from 'zod'
import pool from '../config/database.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiError } from '../middleware/errors.js'
import { requireApprovedOrganization, requireAuth, requireRole } from '../middleware/auth.js'
import { readBody } from '../utils/validation.js'
import { writeAudit } from '../utils/audit.js'

const router = Router()
const applicationSchema = z.object({
  petId: z.string().min(1).max(64),
  address: z.string().trim().min(4).max(300),
  city: z.string().trim().min(2).max(120),
  pincode: z.string().trim().regex(/^\d{6}$/),
  reason: z.string().trim().min(10).max(10000),
  housingType: z.string().trim().min(2).max(80),
  petExperience: z.string().trim().min(1).max(30),
  hasOtherPets: z.union([z.boolean(), z.enum(['Yes', 'No'])]),
  otherPetsDetails: z.string().trim().max(5000).optional().default(''),
  primaryCaregiver: z.string().trim().min(2).max(120),
  additionalInformation: z.string().trim().max(5000).optional().default(''),
})
const activeStatuses = ['Submitted', 'Under Review', 'Approved']

function mapApplication(row) {
  return {
    id: row.id,
    applicationNumber: row.application_number,
    petId: row.pet_id,
    petName: row.pet_name,
    pet: row.pet_name,
    petImage: row.pet_image,
    adopterId: row.adopter_id,
    organizationId: row.organization_id,
    organizationName: row.organization_name,
    organization: row.organization_name,
    applicant: row.applicant_name,
    applicantName: row.applicant_name,
    email: row.email,
    mobile: row.mobile,
    address: row.address,
    city: row.city,
    pincode: row.pincode,
    reason: row.reason,
    housingType: row.housing_type,
    petExperience: row.pet_experience,
    hasOtherPets: Boolean(row.has_other_pets),
    otherPetsDetails: row.other_pets_details,
    primaryCaregiver: row.primary_caregiver,
    additionalInformation: row.additional_information,
    status: row.status,
    rejectionReason: row.rejection_reason || '',
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || '',
  }
}

const applicationJoin = `SELECT a.*, p.name AS pet_name, pi.image_url AS pet_image, o.organization_name
  FROM adoption_applications a JOIN pets p ON p.id = a.pet_id
  LEFT JOIN pet_images pi ON pi.pet_id = p.id AND pi.is_primary = TRUE
  JOIN organizations o ON o.id = a.organization_id`

router.post('/', requireAuth, requireRole('USER'), asyncHandler(async (req, res) => {
  const input = readBody(applicationSchema, req.body)
  const connection = await pool.getConnection()
  const applicationNumber = `AD-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
  const id = applicationNumber
  try {
    await connection.beginTransaction()
    const [pets] = await connection.execute('SELECT id, organization_id, adoption_status, is_active FROM pets WHERE id = ? FOR UPDATE', [input.petId])
    const pet = pets[0]
    if (!pet || !pet.is_active || pet.adoption_status !== 'Available') throw new ApiError(409, 'This pet is not available for a new application.', 'PET_UNAVAILABLE')
    const [existing] = await connection.execute(
      `SELECT id FROM adoption_applications WHERE adopter_id = ? AND pet_id = ? AND status IN (${activeStatuses.map(() => '?').join(',')}) LIMIT 1`,
      [req.user.id, pet.id, ...activeStatuses],
    )
    if (existing[0]) throw new ApiError(409, 'You already have an active application for this pet.', 'DUPLICATE_APPLICATION')
    const hasOtherPets = input.hasOtherPets === true || input.hasOtherPets === 'Yes'
    await connection.execute(
      `INSERT INTO adoption_applications (id, application_number, pet_id, adopter_id, organization_id, applicant_name, email, mobile,
       address, city, pincode, reason, housing_type, pet_experience, has_other_pets, other_pets_details, primary_caregiver,
       additional_information, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
      [id, applicationNumber, pet.id, req.user.id, pet.organization_id, req.user.full_name, req.user.email, req.user.mobile,
        input.address, input.city, input.pincode, input.reason, input.housingType, input.petExperience, hasOtherPets,
        input.otherPetsDetails, input.primaryCaregiver, input.additionalInformation],
    )
    await writeAudit(connection, req.user.id, 'adoption.submitted', 'adoption_application', id)
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  const [rows] = await pool.execute(`${applicationJoin} WHERE a.id = ?`, [id])
  res.status(201).json({ data: { application: mapApplication(rows[0]) } })
}))

router.get('/mine', requireAuth, requireRole('USER'), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`${applicationJoin} WHERE a.adopter_id = ? ORDER BY a.submitted_at DESC`, [req.user.id])
  res.json({ data: { applications: rows.map(mapApplication) } })
}))

router.get('/organization', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`${applicationJoin} WHERE a.organization_id = ? ORDER BY a.submitted_at DESC`, [req.organization.id])
  res.json({ data: { applications: rows.map(mapApplication) } })
}))

router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`${applicationJoin} WHERE a.id = ? LIMIT 1`, [req.params.id])
  const application = rows[0]
  if (!application) throw new ApiError(404, 'Adoption application was not found.', 'APPLICATION_NOT_FOUND')
  const canRead = req.user.role === 'ADMIN' || (req.user.role === 'USER' && application.adopter_id === req.user.id)
  let organizationCanRead = false
  if (['NGO', 'SHELTER'].includes(req.user.role)) {
    const [orgs] = await pool.execute('SELECT id FROM organizations WHERE owner_user_id = ? AND verification_status = ? LIMIT 1', [req.user.id, 'Approved'])
    organizationCanRead = orgs[0]?.id === application.organization_id
  }
  if (!canRead && !organizationCanRead) throw new ApiError(403, 'You cannot view this application.', 'FORBIDDEN')
  res.json({ data: { application: mapApplication(application) } })
}))

router.patch('/:id/status', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const input = readBody(z.object({ status: z.enum(['Under Review', 'Approved', 'Rejected', 'Completed']), rejectionReason: z.string().trim().max(2000).optional().default('') }), req.body)
  if (input.status === 'Rejected' && !input.rejectionReason) throw new ApiError(422, 'Add a reason when rejecting an application.', 'REJECTION_REASON_REQUIRED')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute(
      'SELECT id, pet_id, status FROM adoption_applications WHERE id = ? AND organization_id = ? FOR UPDATE',
      [req.params.id, req.organization.id],
    )
    const application = rows[0]
    if (!application) throw new ApiError(404, 'Application was not found for your organization.', 'APPLICATION_NOT_FOUND')
    const pending = ['Submitted', 'Under Review'].includes(application.status)
    const allowed = input.status === 'Under Review' ? application.status === 'Submitted'
      : ['Approved', 'Rejected'].includes(input.status) ? pending
        : input.status === 'Completed' && application.status === 'Approved'
    if (!allowed) throw new ApiError(409, 'That adoption status transition is not allowed.', 'INVALID_STATUS_TRANSITION')
    if (input.status === 'Approved' || input.status === 'Completed') {
      const [pets] = await connection.execute('SELECT adoption_status, is_active FROM pets WHERE id = ? FOR UPDATE', [application.pet_id])
      const pet = pets[0]
      if (!pet || !pet.is_active || (input.status === 'Approved' && pet.adoption_status !== 'Available') || (input.status === 'Completed' && pet.adoption_status !== 'Under Adoption')) {
        throw new ApiError(409, 'The pet status no longer allows this application transition.', 'PET_STATUS_CONFLICT')
      }
      const [otherApproved] = await connection.execute(
        "SELECT id FROM adoption_applications WHERE pet_id = ? AND status = 'Approved' AND id <> ? LIMIT 1",
        [application.pet_id, application.id],
      )
      if (input.status === 'Approved' && otherApproved.length) throw new ApiError(409, 'Another application already reserved this pet.', 'PET_ALREADY_RESERVED')
      const nextPetStatus = input.status === 'Completed' ? 'Adopted' : 'Under Adoption'
      await connection.execute('UPDATE pets SET adoption_status = ? WHERE id = ?', [nextPetStatus, application.pet_id])
    }
    await connection.execute(
      `UPDATE adoption_applications SET status = ?, rejection_reason = ?, completed_at = ? WHERE id = ?`,
      [input.status, input.status === 'Rejected' ? input.rejectionReason : null,
        input.status === 'Completed' ? new Date() : null, application.id],
    )
    await writeAudit(connection, req.user.id, 'adoption.status_changed', 'adoption_application', application.id, { from: application.status, to: input.status })
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  const [updated] = await pool.execute(`${applicationJoin} WHERE a.id = ?`, [req.params.id])
  res.json({ data: { application: mapApplication(updated[0]) } })
}))

export default router
