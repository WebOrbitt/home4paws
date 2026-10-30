import { apiRequest } from './api.js'

export const getMyOrganization = () => apiRequest('/organizations/me')
export const updateMyOrganization = (changes) => apiRequest('/organizations/me', { method: 'PATCH', body: changes })
export const registerOrganization = (formData) => apiRequest('/organizations/registrations', { method: 'POST', body: formData, skipRefresh: true })
export const getAdminDashboard = () => apiRequest('/admin/dashboard')
export const adminList = (path, params = {}) => {
  const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
  return apiRequest(`/admin/${path}${query.size ? `?${query}` : ''}`)
}
export const adminUpdate = (path, method, body) => apiRequest(`/admin/${path}`, { method, body })
