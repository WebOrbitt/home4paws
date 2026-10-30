import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { adminList, adminUpdate, getAdminDashboard } from '../services/organizationService.js'
import { listPets, listMyPets, createPet as createPetRequest, updatePet as updatePetRequest, deactivatePet } from '../services/petService.js'
import { closeAssignedRescue, createRescueReport, listAssignedRescues, updateRescueStatus } from '../services/rescueService.js'
import { listMyApplications, listOrganizationApplications, submitAdoptionApplication, updateApplicationStatus } from '../services/adoptionService.js'
import { getMyOrganization, updateMyOrganization } from '../services/organizationService.js'
import { apiAssetUrl } from '../services/api.js'

const AdminDataContext = createContext(null)

function organizationsFromPets(pets) {
  const rows = new Map()
  for (const pet of pets) {
    if (pet.organizationId && !rows.has(pet.organizationId)) rows.set(pet.organizationId, {
      id: pet.organizationId, name: pet.organizationName || pet.organization || 'Organization',
      type: 'NGO', status: 'Approved', verificationStatus: 'Approved',
    })
  }
  return [...rows.values()]
}

const normalizePetAssets = (pet) => ({
  ...pet,
  image: apiAssetUrl(pet.image),
  images: (pet.images || []).map(apiAssetUrl),
  location: pet.location || pet.city || pet.state || pet.address || '',
  goodWithPets: pet.goodWithPets || { dogs: pet.goodWithDogs ?? null, cats: pet.goodWithCats ?? null },
})
const normalizeRescueAssets = (report) => ({ ...report, photo: apiAssetUrl(report.photo) })

export function AdminDataProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth()
  const [organizations, setOrganizations] = useState([])
  const [users, setUsers] = useState([])
  const [pets, setPets] = useState([])
  const [rescueReports, setRescueReports] = useState([])
  const [adoptionRequests, setAdoptionRequests] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataError, setDataError] = useState('')

  const refreshData = useCallback(async () => {
    if (authLoading) return
    setIsLoading(true)
    setDataError('')
    try {
      const publicPets = await listPets({ limit: 60 })
      setPets(publicPets.pets || [])
      setOrganizations(organizationsFromPets(publicPets.pets || []))
      if (user?.role === 'ADMIN') {
        const [dashboardData, orgData, userData, petData, rescueData, applicationData] = await Promise.all([
          getAdminDashboard(),
          adminList('organizations'),
          adminList('users'),
          adminList('pets'),
          adminList('rescue-reports'),
          adminList('adoption-applications'),
        ])
        setDashboard(dashboardData)
        setOrganizations(orgData.organizations || [])
        setUsers(userData.users || [])
        setPets((petData.pets || []).map(normalizePetAssets))
        setRescueReports((rescueData.reports || []).map(normalizeRescueAssets))
        setAdoptionRequests(applicationData.applications || [])
      } else if (['NGO', 'SHELTER'].includes(user?.role)) {
        const [orgData, petData, rescueData, applicationData] = await Promise.all([
          getMyOrganization(), listMyPets(), listAssignedRescues(), listOrganizationApplications(),
        ])
        setOrganizations([orgData.organization])
        setPets(petData.pets || [])
        setRescueReports((rescueData.reports || []).map(normalizeRescueAssets))
        setAdoptionRequests(applicationData.applications || [])
      } else if (user?.role === 'USER') {
        const applications = await listMyApplications()
        setAdoptionRequests(applications.applications || [])
      }
    } catch (error) {
      setDataError(error.message || 'Could not load Home4Paws data.')
    } finally {
      setIsLoading(false)
    }
  }, [authLoading, user?.id, user?.role])

  useEffect(() => { refreshData() }, [refreshData])

  const addRescueReport = useCallback(async (report) => {
    const { photoFile, photo, ...fields } = report
    const result = await createRescueReport(fields, photoFile || (photo instanceof File ? photo : null))
    const next = { ...result.report, ...fields, photo: result.report.photo || (photo instanceof File ? '' : apiAssetUrl(photo)), trackingToken: result.trackingToken, reportedAt: result.report.createdAt }
    setRescueReports((items) => [next, ...items])
    return next
  }, [])

  const updateOrganization = useCallback(async (id, status, rejectionReason = '') => {
    const result = await adminUpdate(`organizations/${encodeURIComponent(id)}/decision`, 'PATCH', { status, rejectionReason })
    setOrganizations((items) => items.map((item) => item.id === id ? { ...item, ...result.organization } : item))
    return result.organization
  }, [])

  const addOrganization = useCallback((organization) => {
    setOrganizations((items) => [organization, ...items.filter((item) => item.id !== organization.id)])
  }, [])

  const addUser = useCallback((profile) => profile, [])

  const updateUserProfile = useCallback((email, changes) => {
    setUsers((items) => items.map((item) => item.email?.toLowerCase() === email?.toLowerCase() ? { ...item, ...changes } : item))
  }, [])

  const updateOrganizationProfile = useCallback(async (_id, changes) => {
    const result = await updateMyOrganization(changes)
    setOrganizations((items) => items.map((item) => item.id === result.organization.id ? { ...item, ...result.organization } : item))
    return result.organization
  }, [])

  const setUserActive = useCallback(async (id, active) => {
    const result = await adminUpdate(`users/${encodeURIComponent(id)}/status`, 'PATCH', { status: active ? 'Active' : 'Inactive' })
    setUsers((items) => items.map((item) => item.id === id ? { ...item, status: result.status } : item))
  }, [])

  const updateRescueReport = useCallback(async (id, status) => {
    if (status === 'Under Review') {
      await adminUpdate(`rescue-reports/${encodeURIComponent(id)}/review`, 'PATCH', { status })
      setRescueReports((items) => items.map((item) => item.id === id ? { ...item, status } : item))
      return true
    }
    if (status === 'Closed') {
      await adminUpdate(`rescue-reports/${encodeURIComponent(id)}/close`, 'PATCH', {})
      setRescueReports((items) => items.map((item) => item.id === id ? { ...item, status: 'Closed' } : item))
      return true
    }
    const result = await updateRescueStatus(id, status)
    setRescueReports((items) => items.map((item) => item.id === id ? { ...item, status: result.report?.status || status } : item))
    return true
  }, [])

  const assignRescueOrganization = useCallback(async (id, organizationId) => {
    const result = await adminUpdate(`rescue-reports/${encodeURIComponent(id)}/assign`, 'PATCH', { organizationId })
    const organization = organizations.find((item) => item.id === organizationId)
    setRescueReports((items) => items.map((item) => item.id === id ? {
      ...item, status: 'NGO Assigned', assignedOrganizationId: organizationId, assignedOrganizationName: organization?.name || '',
    } : item))
    return Boolean(result)
  }, [organizations])

  const linkRescuePet = useCallback(() => true, [])

  const closeRescueReport = useCallback(async (id) => {
    if (['NGO', 'SHELTER'].includes(user?.role)) await closeAssignedRescue(id)
    else await adminUpdate(`rescue-reports/${encodeURIComponent(id)}/close`, 'PATCH', {})
    setRescueReports((items) => items.map((item) => item.id === id ? { ...item, status: 'Closed' } : item))
    return true
  }, [user?.role])

  const addPet = useCallback(async (pet, imageFilesByPreview = {}) => {
    const result = await createPetRequest(pet, imageFilesByPreview)
    setPets((items) => [normalizePetAssets(result.pet), ...items])
    return result.pet
  }, [])

  const updatePet = useCallback(async (id, changes, imageFilesByPreview = {}) => {
    const result = await updatePetRequest(id, changes, imageFilesByPreview)
    setPets((items) => items.map((item) => item.id === id ? normalizePetAssets(result.pet) : item))
    return result.pet
  }, [])

  const removePet = useCallback(async (id) => {
    await deactivatePet(id)
    setPets((items) => items.map((item) => item.id === id ? { ...item, isActive: false } : item))
  }, [])

  const hasActiveAdoptionApplication = useCallback((adopterId, petId) => adoptionRequests.some((item) =>
    item.adopterId === adopterId && item.petId === petId && ['Submitted', 'Pending', 'Under Review', 'Approved'].includes(item.status)), [adoptionRequests])

  const addAdoptionRequest = useCallback(async (application) => {
    try {
      const result = await submitAdoptionApplication(application)
      setAdoptionRequests((items) => [result.application, ...items])
      return { application: result.application }
    } catch (error) {
      if (error.code === 'DUPLICATE_APPLICATION') return { error: 'duplicate' }
      if (error.code === 'PET_UNAVAILABLE' || error.code === 'PET_STATUS_CONFLICT') return { error: 'unavailable' }
      throw error
    }
  }, [])

  const updateAdoptionRequestStatus = useCallback(async (id, status, rejectionReason = '') => {
    const result = await updateApplicationStatus(id, status, rejectionReason)
    setAdoptionRequests((items) => items.map((item) => item.id === id ? result.application : item))
    if (status === 'Approved' || status === 'Completed') {
      setPets((items) => items.map((pet) => pet.id === result.application.petId ? {
        ...pet, adoptionStatus: status === 'Completed' ? 'Adopted' : 'Under Adoption',
        status: status === 'Completed' ? 'adopted' : 'under-adoption',
      } : pet))
    }
    return true
  }, [])

  const value = useMemo(() => ({
    organizations, users, pets, rescueReports, adoptionRequests, dashboard, isLoading, dataError, refreshData,
    updateOrganization, addOrganization, addUser, updateUserProfile, updateOrganizationProfile, setUserActive,
    addRescueReport, updateRescueReport, assignRescueOrganization, linkRescuePet, closeRescueReport,
    addPet, updatePet, removePet, hasActiveAdoptionApplication, addAdoptionRequest, updateAdoptionRequestStatus,
  }), [organizations, users, pets, rescueReports, adoptionRequests, dashboard, isLoading, dataError, refreshData,
    updateOrganization, addOrganization, addUser, updateUserProfile, updateOrganizationProfile, setUserActive,
    addRescueReport, updateRescueReport, assignRescueOrganization, linkRescuePet, closeRescueReport,
    addPet, updatePet, removePet, hasActiveAdoptionApplication, addAdoptionRequest, updateAdoptionRequestStatus])

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>
}

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (!context) throw new Error('useAdminData must be used within AdminDataProvider')
  return context
}
