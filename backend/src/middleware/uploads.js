import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'
import { env } from '../config/env.js'
import { ApiError } from './errors.js'

const root = path.resolve(env.uploadDirectory)
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const documentTypes = new Set([...imageTypes, 'application/pdf'])

const storage = multer.diskStorage({
  destination(req, file, done) {
    const kind = file.fieldname === 'document' || file.fieldname.startsWith('document_') ? 'private-documents' : 'pets'
    const directory = path.join(root, kind)
    fs.mkdirSync(directory, { recursive: true })
    done(null, directory)
  },
  filename(req, file, done) {
    const extension = path.extname(file.originalname).toLowerCase().slice(0, 10)
    done(null, `${crypto.randomUUID()}${extension}`)
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: env.maxUploadBytes, files: 8 },
  fileFilter(req, file, done) {
    const isDocument = file.fieldname === 'document' || file.fieldname.startsWith('document_')
    const allowed = isDocument ? documentTypes : imageTypes
    if (!allowed.has(file.mimetype)) return done(new ApiError(422, isDocument ? 'Upload a JPG, PNG, WebP, or PDF file.' : 'Upload a JPG, PNG, or WebP image.', 'INVALID_FILE_TYPE'))
    done(null, true)
  },
})

export const uploadRoot = root
