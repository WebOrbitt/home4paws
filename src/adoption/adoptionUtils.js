export const applicationStatuses = ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed']

export function applicationPetStatus(pet) {
  if (!pet) return 'Available'
  if (pet.adoptionStatus) return pet.adoptionStatus
  if (pet.status === 'adopted') return 'Adopted'
  if (pet.status === 'under-adoption') return 'Under Adoption'
  return 'Available'
}

export function adoptionStatusValue(pet) {
  const status = applicationPetStatus(pet)
  return status === 'Adopted' ? 'adopted' : status === 'Under Adoption' ? 'under-adoption' : 'available'
}

export function formatApplicationDate(value, options = { day: '2-digit', month: 'short', year: undefined }) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', options)
}

export function withAdoptionRelations(application, pets, organizations) {
  const pet = pets.find((item) => item.id === application.petId) || null
  const organization = organizations.find((item) => item.id === application.organizationId) || null
  return {
    ...application,
    petRecord: pet,
    organizationRecord: organization,
    pet: pet?.name || application.petName || application.pet || 'Pet unavailable',
    organization: organization?.name || application.organizationName || application.organization || 'Organization unavailable',
    applicant: application.applicantName || application.applicant || 'Applicant',
    date: formatApplicationDate(application.submittedAt || application.date, { day: '2-digit', month: 'short' }),
  }
}
