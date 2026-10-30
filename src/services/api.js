const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const API_ORIGIN = API_URL.replace(/\/api$/, '')
let accessToken = null
let refreshPromise = null

export class ApiError extends Error {
  constructor(message, status = 0, code = 'NETWORK_ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function setAccessToken(token) {
  accessToken = token || null
}

export function apiAssetUrl(value) {
  if (!value || /^(https?:|data:|blob:)/i.test(value)) return value || ''
  return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`
}

export function apiAssetPath(value) {
  if (API_ORIGIN && value.startsWith(`${API_ORIGIN}/uploads/`)) return value.slice(API_ORIGIN.length)
  return value
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}))
        if (!response.ok) throw new ApiError(result.error?.message || 'Please sign in again.', response.status, result.error?.code)
        setAccessToken(result.data?.accessToken)
        return result.data
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, skipRefresh = false, retryAuth = true, ...fetchOptions } = options
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  const requestHeaders = { ...headers }
  if (body !== undefined && !isForm && !requestHeaders['Content-Type']) requestHeaders['Content-Type'] = 'application/json'
  if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`
  let response
  try {
    response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...fetchOptions,
      method,
      credentials: 'include',
      headers: requestHeaders,
      body: body === undefined ? undefined : isForm || typeof body === 'string' ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Could not reach the Home4Paws API. Make sure the backend is running.', 0, 'API_UNREACHABLE')
  }
  const result = await response.json().catch(() => ({}))
  if (response.status === 401 && retryAuth && !skipRefresh && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken()
      return apiRequest(path, { ...options, retryAuth: false })
    } catch { setAccessToken(null) }
  }
  if (!response.ok) throw new ApiError(result.error?.message || 'The request could not be completed.', response.status, result.error?.code)
  return result.data
}

export async function refreshSession() {
  return refreshAccessToken()
}

export async function apiDownload(path, didRefresh = false) {
  let response
  try {
    response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      credentials: 'include',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    })
  } catch {
    throw new ApiError('Could not reach the Home4Paws API.', 0, 'API_UNREACHABLE')
  }
  if (response.status === 401 && !didRefresh) {
    await refreshAccessToken()
    return apiDownload(path, true)
  }
  if (!response.ok) {
    const result = await response.json().catch(() => ({}))
    throw new ApiError(result.error?.message || 'The document could not be downloaded.', response.status, result.error?.code)
  }
  return response.blob()
}

export const apiBaseUrl = API_URL
