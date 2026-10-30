import fs from 'node:fs/promises'
import path from 'node:path'
import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'
import { uploadRoot } from '../middleware/uploads.js'
import { ApiError } from '../middleware/errors.js'

const hasCloudinary = Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret)
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  })
}

export async function persistUpload(file, kind) {
  if (!file) return null
  const isDocument = kind === 'organization-document'
  const handle = await fs.open(file.path, 'r')
  const header = Buffer.alloc(12)
  let bytesRead = 0
  try { ({ bytesRead } = await handle.read(header, 0, header.length, 0)) } finally { await handle.close() }
  const isJpeg = header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff
  const isPng = header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isWebp = header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP'
  const isPdf = header.subarray(0, 5).toString('ascii') === '%PDF-'
  const signatureMatches = file.mimetype === 'image/jpeg' ? isJpeg
    : file.mimetype === 'image/png' ? isPng
      : file.mimetype === 'image/webp' ? isWebp
        : isDocument && file.mimetype === 'application/pdf' ? isPdf : false
  if (!bytesRead || !signatureMatches) {
    await fs.rm(file.path, { force: true })
    throw new ApiError(422, 'The file content does not match its selected file type.', 'INVALID_FILE_TYPE')
  }
  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: isDocument ? 'home4paws/private-documents' : 'home4paws/pet-images',
        resource_type: isDocument ? 'raw' : 'image',
        type: isDocument ? 'authenticated' : 'upload',
        use_filename: false,
        unique_filename: true,
      })
      await fs.rm(file.path, { force: true })
      return { url: result.secure_url, publicId: result.public_id, provider: 'cloudinary', originalName: file.originalname, mimeType: file.mimetype }
    } catch (error) {
      await fs.rm(file.path, { force: true })
      throw error
    }
  }

  const key = path.relative(uploadRoot, file.path).split(path.sep).join('/')
  return {
    url: isDocument ? key : `/uploads/pets/${path.basename(file.path)}`,
    publicId: null,
    provider: 'local',
    originalName: file.originalname,
    mimeType: file.mimetype,
  }
}

export async function getPrivateDocumentLocation(document) {
  if (document.storage_public_id) {
    const extension = path.extname(document.original_name).replace('.', '') || 'pdf'
    return cloudinary.utils.private_download_url(document.storage_public_id, extension, {
      resource_type: 'raw',
      type: 'authenticated',
      expires_at: Math.floor(Date.now() / 1000) + 120,
    })
  }
  return path.resolve(uploadRoot, document.document_url)
}

export async function sendPrivateDocument(res, document, location) {
  if (typeof location === 'string' && location.startsWith('https://')) {
    const response = await fetch(location)
    if (!response.ok) throw new ApiError(502, 'The private document could not be retrieved from cloud storage.', 'DOCUMENT_STORAGE_UNAVAILABLE')
    const content = Buffer.from(await response.arrayBuffer())
    return res.type(document.mime_type).attachment(document.original_name).send(content)
  }
  return res
}

export const cloudinaryConfigured = hasCloudinary
