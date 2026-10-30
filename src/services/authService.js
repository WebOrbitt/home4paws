import { apiRequest, setAccessToken } from './api.js'

export async function login(credentials) {
  const data = await apiRequest('/auth/login', { method: 'POST', body: credentials, skipRefresh: true })
  setAccessToken(data.accessToken)
  return data
}

export async function registerAdopter(values) {
  const data = await apiRequest('/auth/register', { method: 'POST', body: values, skipRefresh: true })
  setAccessToken(data.accessToken)
  return data
}

export async function registerOrganization(values) {
  return apiRequest('/organizations/registrations', { method: 'POST', body: values, skipRefresh: true })
}

export async function currentUser() {
  return apiRequest('/auth/me')
}

export async function logout() {
  try { await apiRequest('/auth/logout', { method: 'POST', retryAuth: false }) } finally { setAccessToken(null) }
}

export async function updateUserProfile(changes) {
  return apiRequest('/auth/me', { method: 'PATCH', body: changes })
}
