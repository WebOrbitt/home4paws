import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import path from 'node:path'
import { env } from './config/env.js'
import { uploadRoot } from './middleware/uploads.js'
import { errorHandler, notFoundHandler } from './middleware/errors.js'
import authRoutes from './routes/auth.routes.js'
import organizationRoutes from './routes/organization.routes.js'
import petRoutes from './routes/pet.routes.js'
import rescueRoutes from './routes/rescue.routes.js'
import adoptionRoutes from './routes/adoption.routes.js'
import adminRoutes from './routes/admin.routes.js'
import pool from './config/database.js'

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.frontendOrigins.includes(origin)) return callback(null, true)
    callback(new Error('This website origin is not allowed by the API.'))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '1mb' }))
app.use(cookieParser())
app.use('/uploads/pets', express.static(path.join(uploadRoot, 'pets'), { index: false, maxAge: '1d' }))

app.get('/api/health', (req, res) => res.json({ data: { status: 'ok', service: 'home4paws-api' } }))
app.get('/api/health/ready', async (req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ data: { status: 'ready', database: 'connected' } })
  } catch (error) {
    next(error)
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/rescue-reports', rescueRoutes)
app.use('/api/adoption-applications', adoptionRoutes)
app.use('/api/admin', adminRoutes)
app.use(notFoundHandler)
app.use(errorHandler)

export default app
