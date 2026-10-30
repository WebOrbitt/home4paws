import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import pool from '../config/database.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ApiError } from '../middleware/errors.js'
import { requireAuth } from '../middleware/auth.js'
import { readBody } from '../utils/validation.js'
import { createSession, hashToken, refreshCookieOptions } from '../utils/sessions.js'

const router = Router()
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: 'draft-7', legacyHeaders: false })
const registrationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  mobile: z.string().trim().min(10).max(32),
  password: z.string().min(8).max(72),
  confirmPassword: z.string().min(1),
}).refine((value) => value.password === value.confirmPassword, {
  path: ['confirmPassword'], message: 'Passwords do not match.',
})
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(72) })

const publicUser = (user) => ({
  id: user.id,
  name: user.full_name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  accountType: user.role === 'USER' ? 'Adopter' : user.role === 'ADMIN' ? 'Admin' : user.role === 'SHELTER' ? 'Shelter' : 'NGO',
})

router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const input = readBody(registrationSchema, req.body)
  const id = randomUUID()
  const normalizedEmail = input.email.toLowerCase()
  const passwordHash = await bcrypt.hash(input.password, 12)
  await pool.execute(
    "INSERT INTO users (id, full_name, email, email_normalized, mobile, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, 'USER')",
    [id, input.name, input.email, normalizedEmail, input.mobile, passwordHash],
  )
  const user = { id, full_name: input.name, email: input.email, mobile: input.mobile, role: 'USER' }
  const accessToken = await createSession(user, res, pool)
  res.status(201).json({ data: { user: publicUser(user), accessToken } })
}))

router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const input = readBody(loginSchema, req.body)
  const [rows] = await pool.execute(
    'SELECT id, full_name, email, mobile, password_hash, role, account_status FROM users WHERE email_normalized = ? LIMIT 1',
    [input.email.toLowerCase()],
  )
  const user = rows[0]
  if (!user || user.account_status !== 'Active' || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new ApiError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS')
  }
  const accessToken = await createSession(user, res, pool)
  res.json({ data: { user: publicUser(user), accessToken } })
}))

router.post('/refresh', asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.h4p_refresh
  if (!rawToken) throw new ApiError(401, 'Sign in to continue.', 'AUTH_REQUIRED')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [tokens] = await connection.execute(
      'SELECT id, user_id FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP() FOR UPDATE',
      [hashToken(rawToken)],
    )
    const oldToken = tokens[0]
    if (!oldToken) throw new ApiError(401, 'Your session has expired. Sign in again.', 'INVALID_SESSION')
    const [users] = await connection.execute(
      'SELECT id, full_name, email, mobile, role, account_status FROM users WHERE id = ? LIMIT 1',
      [oldToken.user_id],
    )
    const user = users[0]
    if (!user || user.account_status !== 'Active') throw new ApiError(401, 'This account is unavailable.', 'ACCOUNT_UNAVAILABLE')
    await connection.execute('UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE id = ?', [oldToken.id])
    const accessToken = await createSession(user, res, connection)
    await connection.commit()
    res.json({ data: { user: publicUser(user), accessToken } })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.post('/logout', asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.h4p_refresh
  if (rawToken) await pool.execute('UPDATE refresh_tokens SET revoked_at = UTC_TIMESTAMP() WHERE token_hash = ? AND revoked_at IS NULL', [hashToken(rawToken)])
  const { maxAge, ...cookieOptions } = refreshCookieOptions()
  res.clearCookie('h4p_refresh', cookieOptions)
  res.json({ data: { loggedOut: true } })
}))

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  let organization = null
  if (['NGO', 'SHELTER'].includes(req.user.role)) {
    const [rows] = await pool.execute('SELECT id, organization_name AS name, organization_type AS type, verification_status AS status, rejection_reason AS rejectionReason FROM organizations WHERE owner_user_id = ? LIMIT 1', [req.user.id])
    organization = rows[0] || null
  }
  res.json({ data: { user: publicUser(req.user), organization } })
}))

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const input = readBody(z.object({ name: z.string().trim().min(2).max(160).optional(), mobile: z.string().trim().max(32).optional() }).refine((value) => Object.keys(value).length > 0), req.body)
  await pool.execute('UPDATE users SET full_name = COALESCE(?, full_name), mobile = COALESCE(?, mobile) WHERE id = ?', [input.name ?? null, input.mobile ?? null, req.user.id])
  const [rows] = await pool.execute('SELECT id, full_name, email, mobile, role FROM users WHERE id = ?', [req.user.id])
  res.json({ data: { user: publicUser(rows[0]) } })
}))

export default router
