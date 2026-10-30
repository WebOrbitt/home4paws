import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import Button from '../../components/Button.jsx'
import PetForm from '../../components/organization/PetForm.jsx'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

export default function AddPetPage() {
  useDocumentTitle('Add a Pet | Home4Paws')
  const location = useLocation()
  const { organization } = useCurrentOrganization()
  const { rescueReports, addPet } = useAdminData()
  const [createdPet, setCreatedPet] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const rescueReportId = location.state?.rescueReportId || ''
  const rescueReport = rescueReports.find((report) => report.id === rescueReportId)
  const rescueStory = rescueReport && [
    `Reported from rescue report ${rescueReport.id}.`,
    rescueReport.dateFound ? `Found on ${rescueReport.dateFound}.` : '',
    `Approximate age reported: ${rescueReport.age || 'Unknown'}.`,
    rescueReport.additionalInformation ? `Additional information: ${rescueReport.additionalInformation}` : '',
  ].filter(Boolean).join(' ')
  const prefill = rescueReport ? {
    species: rescueReport.animalType,
    breed: rescueReport.breed,
    age: rescueReport.age,
    ageUnknown: rescueReport.age === 'Unknown' || (!/^\d+\s*(months?|years?)$/i.test(rescueReport.age || '') && !['Newborn', 'Young', 'Adult', 'Senior'].includes(rescueReport.age)),
    ageApproximate: ['Newborn', 'Young', 'Adult', 'Senior'].includes(rescueReport.age) ? rescueReport.age : '',
    gender: rescueReport.gender,
    images: rescueReport.photo ? [rescueReport.photo] : [],
    description: rescueReport.description,
    rescueStory,
    rescueReportId: rescueReport.id,
    address: rescueReport.address,
    city: rescueReport.city,
    state: rescueReport.state,
    pincode: rescueReport.pincode,
  } : (rescueReportId ? { rescueReportId } : undefined)

  async function createPet(pet, imageFilesByPreview) {
    if (isSaving) return
    setIsSaving(true)
    setSubmitError('')
    try {
      const nextPet = await addPet({ ...pet, rescueReportId: rescueReport?.id || pet.rescueReportId }, imageFilesByPreview)
      setCreatedPet(nextPet)
    } catch (error) {
      setSubmitError(error.message || 'Could not save this pet. Try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (createdPet) return <section className="mx-auto max-w-2xl rounded-2xl border border-ink/5 bg-white p-6 text-center shadow-card sm:p-9">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest/10 text-forest"><span aria-hidden="true" className="text-2xl">✓</span></div>
    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Pet Profile Created</h1>
    <p className="mt-2 text-sm leading-6 text-muted">{createdPet.name} has been added successfully{rescueReport ? ` and linked to rescue report ${rescueReport.id}` : ''}.</p>
    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
      <Button to={`/organization/pets/${createdPet.id}`}>View Pet</Button>
      <Button to="/organization/pets" variant="secondary">Back to My Pets</Button>
    </div>
  </section>

  return <>
    <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/organization/pets">← Back to My Pets</Link>} subtitle={rescueReport ? `Rescue report ${rescueReport.id} is linked. Review the prefilled details and complete the pet profile.` : 'Create a profile for a rescued pet available through your organization.'} title="Add a Pet" />
    {submitError && <FeedbackMessage className="mb-4" tone="error">{submitError}</FeedbackMessage>}
    <PetForm cancelTo="/organization/pets" onSubmit={createPet} organization={organization} prefill={prefill} submitLabel={isSaving ? 'Publishing...' : 'Publish Pet'} />
  </>
}
