import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { randomUUID } from 'node:crypto'

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
export const createRefreshToken = () => crypto.randomBytes(48).toString('base64url')

export function createAccessToken(user) {
  if (env.jwtAccessSecret.length < 32) throw new Error('Set JWT_ACCESS_SECRET to a random value of at least 32 characters.')
  return jwt.sign({ role: user.role }, env.jwtAccessSecret, { subject: user.id, expiresIn: env.jwtAccessTtl })
}

export async function createSession(user, res, connection) {
  const refreshToken = createRefreshToken()
  const refreshId = randomUUID()
  const expiresAt = new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000)
  await connection.execute(
    'INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [refreshId, user.id, hashToken(refreshToken), expiresAt],
  )
  res.cookie('h4p_refresh', refreshToken, refreshCookieOptions())
  return createAccessToken(user)
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: env.refreshTokenDays * 24 * 60 * 60 * 1000,
  }
}
