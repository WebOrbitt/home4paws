import { apiAssetUrl, apiRequest } from './api.js'

const normalizeReport = (report) => report ? { ...report, photo: apiAssetUrl(report.photo) } : report

export function createRescueReport(values, imageFile) {
  if (!imageFile) return apiRequest('/rescue-reports', { method: 'POST', body: values, skipRefresh: true }).then((data) => ({ ...data, report: normalizeReport(data.report) }))
  const body = new FormData()
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== null) body.append(key, String(value))
  body.append('image', imageFile)
  return apiRequest('/rescue-reports', { method: 'POST', body, skipRefresh: true }).then((data) => ({ ...data, report: normalizeReport(data.report) }))
}

export const trackRescueReport = async (id, token) => { const data = await apiRequest(`/rescue-reports/track/${encodeURIComponent(id)}?token=${encodeURIComponent(token)}`, { skipRefresh: true }); return { ...data, report: normalizeReport(data.report) } }
export const listAssignedRescues = async () => { const data = await apiRequest('/rescue-reports/assigned'); return { ...data, reports: (data.reports || []).map(normalizeReport) } }
export const updateRescueStatus = (id, status) => apiRequest(`/rescue-reports/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } })
export const closeAssignedRescue = (id) => apiRequest(`/rescue-reports/${encodeURIComponent(id)}/close`, { method: 'PATCH', body: {} })
