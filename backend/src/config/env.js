import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const splitList = (value) => String(value || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  frontendOrigins: splitList(process.env.FRONTEND_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173'),
  dbFile: process.env.DB_FILE || path.join(backendRoot, '.runtime', 'home4paws.sqlite'),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS || 14),
  uploadDirectory: process.env.UPLOAD_DIRECTORY || './uploads',
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB || 10) * 1024 * 1024,
  adminName: process.env.ADMIN_NAME || 'Home4Paws Admin',
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
})

export function assertProductionSecrets() {
  if (env.nodeEnv === 'production' && env.jwtAccessSecret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters in production.')
  }
}
