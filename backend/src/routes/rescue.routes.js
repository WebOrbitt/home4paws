import { Router } from 'express'
import { randomBytes, createHash } from 'node:crypto'
import { z } from 'zod'
import fs from 'node:fs/promises'
import pool from '../config/database.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiError } from '../middleware/errors.js'
import { requireApprovedOrganization, requireAuth, requireRole } from '../middleware/auth.js'
import { upload } from '../middleware/uploads.js'
import { readBody } from '../utils/validation.js'
import { persistUpload } from '../utils/storage.js'
import { writeAudit } from '../utils/audit.js'
import rateLimit from 'express-rate-limit'

const router = Router()
const publicReportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, standardHeaders: 'draft-7', legacyHeaders: false })
const reportSchema = z.object({
  animalType: z.string().trim().min(1).max(60),
  breed: z.string().trim().max(120).optional().default(''),
  age: z.string().trim().max(60).optional().default(''),
  gender: z.string().trim().max(40).optional().default('Unknown'),
  condition: z.string().trim().min(1).max(80),
  description: z.string().trim().max(10000).optional().default(''),
  photo: z.string().trim().max(2048).optional(),
  address: z.string().trim().min(4).max(300),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().min(2).max(120),
  pincode: z.string().trim().regex(/^\d{6}$/),
  dateFound: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reporterName: z.string().trim().min(2).max(160),
  mobile: z.string().trim().min(10).max(32),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  additionalInformation: z.string().trim().max(5000).optional().default(''),
})
const reportSelect = `SELECT r.*, o.organization_name AS assigned_organization_name, p.id AS pet_id, p.name AS pet_name
  FROM rescue_reports r LEFT JOIN organizations o ON o.id = r.assigned_organization_id
  LEFT JOIN pets p ON p.rescue_report_id = r.id`
const hashTrackingToken = (token) => createHash('sha256').update(token).digest('hex')

router.post('/', publicReportLimiter, upload.single('image'), asyncHandler(async (req, res) => {
  let input
  try { input = readBody(reportSchema, req.body) } catch (error) { if (req.file) await fs.rm(req.file.path, { force: true }); throw error }
  if (input.dateFound > new Date().toISOString().slice(0, 10)) {
    if (req.file) await fs.rm(req.file.path, { force: true })
    throw new ApiError(422, 'Date found cannot be in the future.', 'VALIDATION_ERROR')
  }
  let photoUrl = input.photo || null
  let photoPublicId = null
  if (req.file) {
    const saved = await persistUpload(req.file, 'pet-image')
    photoUrl = saved.url
    photoPublicId = saved.publicId
  }
  const reportNumber = `RR-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
  const id = reportNumber
  const trackingToken = randomBytes(32).toString('base64url')
  await pool.execute(
    `INSERT INTO rescue_reports (id, report_number, tracking_token_hash, reporter_name, reporter_mobile, reporter_email,
     animal_type, breed, age, gender, condition, description, image_url, image_public_id, address, city, state, pincode,
     date_found, additional_information) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, reportNumber, hashTrackingToken(trackingToken), input.reporterName, input.mobile, input.email || null,
      input.animalType, input.breed, input.age, input.gender, input.condition, input.description, photoUrl, photoPublicId,
      input.address, input.city, input.state, input.pincode, input.dateFound, input.additionalInformation],
  )
  res.status(201).json({ data: { report: { id, reportNumber, status: 'Pending Review', photo: photoUrl, createdAt: new Date().toISOString() }, trackingToken } })
}))

router.get('/track/:id', asyncHandler(async (req, res) => {
  const token = String(req.query.token || '')
  if (token.length < 30) throw new ApiError(404, 'Rescue report was not found.', 'REPORT_NOT_FOUND')
  const [rows] = await pool.execute(
    `SELECT r.id, r.report_number AS reportNumber, r.status, r.updated_at AS updatedAt,
      o.organization_name AS assignedOrganizationName, p.id AS petId, p.name AS petName
     FROM rescue_reports r LEFT JOIN organizations o ON o.id = r.assigned_organization_id
     LEFT JOIN pets p ON p.rescue_report_id = r.id
     WHERE r.id = ? AND r.tracking_token_hash = ? LIMIT 1`,
    [req.params.id, hashTrackingToken(token)],
  )
  if (!rows[0]) throw new ApiError(404, 'Rescue report was not found.', 'REPORT_NOT_FOUND')
  res.json({ data: { report: rows[0] } })
}))

router.get('/assigned', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`${reportSelect} WHERE r.assigned_organization_id = ? ORDER BY r.updated_at DESC`, [req.organization.id])
  res.json({ data: { reports: rows.map((row) => ({
    id: row.id, reportNumber: row.report_number, animalType: row.animal_type, breed: row.breed, age: row.age, gender: row.gender,
    condition: row.condition, description: row.description, photo: row.image_url, address: row.address, city: row.city, state: row.state,
    pincode: row.pincode, dateFound: row.date_found, reporterName: row.reporter_name, reporterMobile: row.reporter_mobile,
    reporterEmail: row.reporter_email || '', additionalInformation: row.additional_information || '', status: row.status,
    assignedOrganizationId: row.assigned_organization_id, assignedOrganizationName: row.assigned_organization_name || '',
    petId: row.pet_id || '', petName: row.pet_name || '', createdAt: row.created_at, updatedAt: row.updated_at,
  })) } })
}))

router.patch('/:id/status', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const { status } = readBody(z.object({ status: z.enum(['Rescue Accepted', 'Rescue In Progress', 'Animal Rescued']) }), req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute('SELECT status FROM rescue_reports WHERE id = ? AND assigned_organization_id = ? FOR UPDATE', [req.params.id, req.organization.id])
    const current = rows[0]?.status
    const allowed = {
      'NGO Assigned': 'Rescue Accepted',
      'Rescue Accepted': 'Rescue In Progress',
      'Rescue In Progress': 'Animal Rescued',
    }
    if (!current) throw new ApiError(404, 'Assigned rescue report was not found.', 'REPORT_NOT_FOUND')
    if (allowed[current] !== status) throw new ApiError(409, 'That rescue status transition is not allowed.', 'INVALID_STATUS_TRANSITION')
    await connection.execute('UPDATE rescue_reports SET status = ? WHERE id = ?', [status, req.params.id])
    await writeAudit(connection, req.user.id, 'rescue.status_changed', 'rescue_report', req.params.id, { from: current, to: status })
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  const [rows] = await pool.execute(`${reportSelect} WHERE r.id = ?`, [req.params.id])
  res.json({ data: { report: rows[0] } })
}))

router.patch('/:id/close', requireAuth, requireRole('NGO', 'SHELTER'), requireApprovedOrganization, asyncHandler(async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.execute(
      'SELECT status FROM rescue_reports WHERE id = ? AND assigned_organization_id = ? FOR UPDATE',
      [req.params.id, req.organization.id],
    )
    if (!rows[0]) throw new ApiError(404, 'Assigned rescue report was not found.', 'REPORT_NOT_FOUND')
    if (rows[0].status !== 'Pet Profile Created') throw new ApiError(409, 'A report can close after its pet profile has been created.', 'INVALID_STATUS_TRANSITION')
    await connection.execute("UPDATE rescue_reports SET status = 'Closed' WHERE id = ?", [req.params.id])
    await writeAudit(connection, req.user.id, 'rescue.closed', 'rescue_report', req.params.id)
    await connection.commit()
  } catch (error) { await connection.rollback(); throw error } finally { connection.release() }
  res.json({ data: { id: req.params.id, status: 'Closed' } })
}))

export default router
