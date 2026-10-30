import { ApiError } from '../middleware/errors.js'

export function readBody(schema, body) {
  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.') || 'request'}: ${issue.message}`).join('; ')
    throw new ApiError(422, message, 'VALIDATION_ERROR')
  }
  return result.data
}

export const asBoolean = (value) => value === null || value === undefined || value === ''
  ? null
  : value === true || value === 'Yes' || value === 'true' || value === 1

export const parseJson = (value, fallback = []) => {
  if (Array.isArray(value)) return value
  if (!value) return fallback
  try { return JSON.parse(value) } catch { return fallback }
}
