import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import pool from '../config/database.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiError } from '../middleware/errors.js'
import { requireApprovedOrganization, requireAuth, requireRole } from '../middleware/auth.js'
import { upload, uploadRoot } from '../middleware/uploads.js'
import { readBody } from '../utils/validation.js'
import { persistUpload, getPrivateDocumentLocation, sendPrivateDocument } from '../utils/storage.js'
import { writeAudit } from '../utils/audit.js'
import { createSession } from '../utils/sessions.js'

const router = Router()
const orgDocuments = upload.fields([
  { name: 'document_registrationCertificate', maxCount: 1 },
  { name: 'document_authorizedPersonId', maxCount: 1 },
  { name: 'document_addressProof', maxCount: 1 },
])
const registrationSchema = z.object({
  organizationName: z.string().trim().min(2).max(180),
  organizationType: z.enum(['NGO', 'SHELTER']),
  registrationNumber: z.string().trim().min(2).max(100),
  yearEstablished: z.coerce.number().int().min(1800).max(new Date().getFullYear()),
  organizationDescription: z.string().trim().min(10).max(5000),
  contactPersonName: z.string().trim().min(2).max(160),
  designation: z.string().trim().max(120).default(''),
  officialEmail: z.string().trim().email().max(254),
  mobile: z.string().trim().min(10).max(32),
  fullAddress: z.string().trim().min(4).max(300),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  pincode: z.string().trim().regex(/^\d{6}$/),
  password: z.string().min(8).max(72),
})
const profileSchema = z.object({
  description: z.string().trim().min(10).max(5000).optional(),
  contactPerson: z.string().trim().min(2).max(160).optional(),
  designation: z.string().trim().max(120).optional(),
  mobile: z.string().trim().min(10).max(32).optional(),
  address: z.string().trim().min(4).max(300).optional(),
  city: z.string().trim().min(2).max(120).optional(),
  state: z.string().trim().min(2).max(120).optional(),
  pincode: z.string().trim().regex(/^\d{6}$/).optional(),
}).refine((value) => Object.keys(value).length > 0, 'Provide at least one field to update.')
const requiredDocumentFields = ['registrationCertificate', 'authorizedPersonId', 'addressProof']

router.post('/registrations', orgDocuments, asyncHandler(async (req, res) => {
  const files = req.files || {}
  const missing = requiredDocumentFields.filter((field) => !files[`document_${field}`]?.[0])
  if (missing.length) {
    for (const group of Object.values(files)) for (const file of group) fs.rmSync(file.path, { force: true })
    throw new ApiError(422, 'Upload the registration certificate, authorized person ID, and address proof.', 'DOCUMENTS_REQUIRED')
  }
  let input
  try {
    input = readBody(registrationSchema, req.body)
  } catch (error) {
    for (const group of Object.values(files)) for (const file of group) fs.rmSync(file.path, { force: true })
    throw error
  }

  const connection = await pool.getConnection()
  const userId = randomUUID()
  const organizationId = randomUUID()
  const normalizedEmail = input.officialEmail.toLowerCase()
  try {
    await connection.beginTransaction()
    const [existing] = await connection.execute('SELECT id FROM users WHERE email_normalized = ? LIMIT 1', [normalizedEmail])
    if (existing.length) throw new ApiError(409, 'An account already uses this official email.', 'EMAIL_IN_USE')
    const passwordHash = await bcrypt.hash(input.password, 12)
    await connection.execute(
      'INSERT INTO users (id, full_name, email, email_normalized, mobile, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, input.contactPersonName, input.officialEmail, normalizedEmail, input.mobile, passwordHash, input.organizationType],
    )
    await connection.execute(
      `INSERT INTO organizations (id, owner_user_id, organization_name, organization_type, registration_number, year_established,
       description, contact_person, designation, official_email, mobile, address, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [organizationId, userId, input.organizationName, input.organizationType, input.registrationNumber, input.yearEstablished,
        input.organizationDescription, input.contactPersonName, input.designation, input.officialEmail, input.mobile,
        input.fullAddress, input.city, input.state, input.pincode],
    )
    for (const documentType of requiredDocumentFields) {
      const file = files[`document_${documentType}`][0]
      const saved = await persistUpload(file, 'organization-document')
      await connection.execute(
        'INSERT INTO organization_documents (id, organization_id, document_type, document_url, storage_public_id, original_name, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [randomUUID(), organizationId, documentType, saved.url, saved.publicId, saved.originalName, saved.mimeType],
      )
    }
    await writeAudit(connection, userId, 'organization.registered', 'organization', organizationId)
    const pendingUser = { id: userId, full_name: input.contactPersonName, email: input.officialEmail, mobile: input.mobile, role: input.organizationType }
    const accessToken = await createSession(pendingUser, res, connection)
    await connection.commit()
    res.status(201).json({ data: { organization: {
      id: organizationId,
      name: input.organizationName,
      type: input.organizationType,
      email: input.officialEmail,
      contactPerson: input.contactPersonName,
      status: 'Pending',
      verificationStatus: 'Pending',
    }, user: { id: userId, name: input.contactPersonName, email: input.officialEmail, mobile: input.mobile, role: input.organizationType }, accessToken } })
  } catch (error) {
    await connection.rollback()
    for (const group of Object.values(files)) for (const file of group) fs.rmSync(file.path, { force: true })
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/me', requireAuth, requireRole('NGO', 'SHELTER'), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT id, organization_name AS name, organization_type AS type, registration_number AS registrationNumber,
      year_established AS yearEstablished, description, contact_person AS contactPerson, designation, official_email AS email,
      mobile, address, city, state, pincode, verification_status AS status, verification_status AS verificationStatus,
      verification_date AS verificationDate, rejection_reason AS rejectionReason, created_at AS createdAt
     FROM organizations WHERE owner_user_id = ? LIMIT 1`,
    [req.user.id],
  )
  if (!rows[0]) throw new ApiError(404, 'Organization profile was not found.', 'ORGANIZATION_NOT_FOUND')
  res.json({ data: { organization: rows[0] } })
}))

router.patch('/me', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const input = readBody(profileSchema, req.body)
  const fields = {
    description: 'description', contactPerson: 'contact_person', designation: 'designation', mobile: 'mobile',
    address: 'address', city: 'city', state: 'state', pincode: 'pincode',
  }
  const sets = Object.keys(input).map((key) => `${fields[key]} = ?`)
  await pool.execute(`UPDATE organizations SET ${sets.join(', ')} WHERE id = ?`, [...Object.values(input), req.organization.id])
  const [rows] = await pool.execute('SELECT id, organization_name AS name, organization_type AS type, description, contact_person AS contactPerson, designation, official_email AS email, mobile, address, city, state, pincode, verification_status AS status FROM organizations WHERE id = ?', [req.organization.id])
  res.json({ data: { organization: rows[0] } })
}))

router.get('/me/documents/:documentId', requireAuth, requireRole('NGO', 'SHELTER'), asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT d.* FROM organization_documents d JOIN organizations o ON o.id = d.organization_id WHERE d.id = ? AND o.owner_user_id = ? LIMIT 1',
    [req.params.documentId, req.user.id],
  )
  if (!rows[0]) throw new ApiError(404, 'Document was not found.', 'DOCUMENT_NOT_FOUND')
  const location = await getPrivateDocumentLocation(rows[0])
  if (typeof location === 'string' && location.startsWith('https://')) return sendPrivateDocument(res, rows[0], location)
  const relative = path.relative(path.resolve(uploadRoot, 'private-documents'), path.resolve(location))
  if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(location)) throw new ApiError(404, 'Document file was not found.', 'DOCUMENT_NOT_FOUND')
  res.download(location, path.basename(rows[0].original_name))
}))

export default router
