import { useAuth } from '../auth/AuthContext.jsx'
import { useAdminData } from '../admin/AdminDataContext.jsx'
import { withAdoptionRelations } from '../adoption/adoptionUtils.js'

export default function useCurrentOrganization() {
  const { organization: sessionOrganization } = useAuth()
  const { organizations, pets, rescueReports, adoptionRequests } = useAdminData()
  const organization = sessionOrganization
    ? organizations.find((item) => item.id === sessionOrganization.id) || organizations.find((item) => item.name === sessionOrganization.name) || sessionOrganization
    : null
  const belongsToOrganization = (item) => item.organizationId === organization?.id || (!item.organizationId && item.organization === organization?.name)
  const organizationPets = organization ? pets.filter((pet) => pet.isActive !== false && belongsToOrganization(pet)) : []
  const organizationRescueRequests = organization
    ? rescueReports.filter((report) => report.assignedOrganizationId === organization.id)
    : []
  const organizationAdoptionRequests = organization
    ? adoptionRequests
      .filter((request) => request.organizationId === organization.id && pets.some((pet) => pet.id === request.petId && belongsToOrganization(pet)))
      .map((request) => withAdoptionRelations(request, pets, organizations))
    : []

  return { organization, pets: organizationPets, rescueRequests: organizationRescueRequests, adoptionRequests: organizationAdoptionRequests }
}
