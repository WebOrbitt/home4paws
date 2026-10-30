export class ApiError extends Error {
  constructor(status, message, code = 'REQUEST_FAILED') {
    super(message)
    this.status = status
    this.code = code
  }
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'The requested API route was not found.' } })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)
  if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(422).json({ error: { code: 'INVALID_UPLOAD', message: 'Check the file count and size, then try again.' } })
  }
  const status = Number(error.status || error.statusCode || 500)
  const safeStatus = status >= 400 && status < 600 ? status : 500
  const duplicate = error.code === 'ER_DUP_ENTRY'
    || error.code === 'SQLITE_CONSTRAINT_UNIQUE'
    || error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY'
  const message = duplicate
    ? 'A record with those details already exists.'
    : safeStatus >= 500 ? 'The server could not complete the request.' : error.message
  if (safeStatus >= 500) console.error(error)
  res.status(duplicate ? 409 : safeStatus).json({
    error: {
      code: duplicate ? 'DUPLICATE_RECORD' : error.code || 'SERVER_ERROR',
      message,
    },
  })
}
