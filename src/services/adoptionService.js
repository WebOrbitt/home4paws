import { apiAssetUrl, apiRequest } from './api.js'

const normalizeApplication = (application) => application ? { ...application, petImage: apiAssetUrl(application.petImage) } : application

export const submitAdoptionApplication = async (application) => { const data = await apiRequest('/adoption-applications', { method: 'POST', body: application }); return { ...data, application: normalizeApplication(data.application) } }
export const listMyApplications = async () => { const data = await apiRequest('/adoption-applications/mine'); return { ...data, applications: (data.applications || []).map(normalizeApplication) } }
export const listOrganizationApplications = async () => { const data = await apiRequest('/adoption-applications/organization'); return { ...data, applications: (data.applications || []).map(normalizeApplication) } }
export const getApplication = async (id) => { const data = await apiRequest(`/adoption-applications/${encodeURIComponent(id)}`); return { ...data, application: normalizeApplication(data.application) } }
export const updateApplicationStatus = async (id, status, rejectionReason = '') => { const data = await apiRequest(`/adoption-applications/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status, rejectionReason } }); return { ...data, application: normalizeApplication(data.application) } }
