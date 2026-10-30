import jwt from 'jsonwebtoken'
import pool from '../config/database.js'
import { env } from '../config/env.js'
import { ApiError } from './errors.js'

export async function requireAuth(req, res, next) {
  try {
    if (!env.jwtAccessSecret) throw new ApiError(503, 'Authentication is not configured yet.', 'AUTH_NOT_CONFIGURED')
    const value = req.get('authorization') || ''
    const token = value.startsWith('Bearer ') ? value.slice(7) : ''
    if (!token) throw new ApiError(401, 'Sign in to continue.', 'AUTH_REQUIRED')
    const claims = jwt.verify(token, env.jwtAccessSecret)
    const [rows] = await pool.execute(
      'SELECT id, full_name, email, mobile, role, account_status FROM users WHERE id = ? LIMIT 1',
      [claims.sub],
    )
    const user = rows[0]
    if (!user || user.account_status !== 'Active') throw new ApiError(401, 'This account is unavailable.', 'ACCOUNT_UNAVAILABLE')
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your session has expired. Sign in again.', 'INVALID_SESSION'))
    }
    next(error)
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to do that.', 'FORBIDDEN'))
  next()
}

export async function requireApprovedOrganization(req, res, next) {
  try {
    if (!['NGO', 'SHELTER'].includes(req.user?.role)) throw new ApiError(403, 'An organization account is required.', 'FORBIDDEN')
    const [rows] = await pool.execute(
      "SELECT id, organization_name AS name, organization_type AS type, verification_status FROM organizations WHERE owner_user_id = ? LIMIT 1",
      [req.user.id],
    )
    const organization = rows[0]
    if (!organization || organization.verification_status !== 'Approved') {
      throw new ApiError(403, 'Your organization must be approved before using this feature.', 'ORGANIZATION_NOT_APPROVED')
    }
    req.organization = organization
    next()
  } catch (error) {
    next(error)
  }
}
