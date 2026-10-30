import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import PetForm from '../../components/organization/PetForm.jsx'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import { useState } from 'react'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

export default function EditPetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { pets, organization } = useCurrentOrganization()
  const { updatePet, adoptionRequests } = useAdminData()
  const pet = pets.find((item) => item.id === id)
  const statusLocked = adoptionRequests.some((request) => request.petId === id && ['Approved', 'Completed'].includes(request.status))
  const [submitError, setSubmitError] = useState('')
  useDocumentTitle(pet ? `Edit ${pet.name} | Home4Paws` : 'Pet Not Found | Home4Paws')

  if (!pet) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Pet not found</h1><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/organization/pets">Back to My Pets</Link></section>

  async function savePet(changes, imageFilesByPreview) {
    setSubmitError('')
    try {
      await updatePet(pet.id, changes, imageFilesByPreview)
      navigate(`/organization/pets/${pet.id}`, { state: { updated: true } })
    } catch (error) {
      setSubmitError(error.message || 'Could not save the pet changes.')
    }
  }

  return <>
    <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to={`/organization/pets/${pet.id}`}>← Back to pet</Link>} subtitle={`Update ${pet.name}'s profile.`} title="Edit Pet" />
    {submitError && <FeedbackMessage className="mb-4" tone="error">{submitError}</FeedbackMessage>}
    <PetForm cancelTo={`/organization/pets/${pet.id}`} initialPet={pet} onSubmit={savePet} organization={organization} statusLocked={statusLocked} submitLabel="Save Changes" />
  </>
}
