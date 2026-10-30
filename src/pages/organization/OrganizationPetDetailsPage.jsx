import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import Button from '../../components/Button.jsx'
import PetConfirmationDialog from '../../components/organization/PetConfirmationDialog.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import PersonalityTags from '../../components/PersonalityTags.jsx'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

function displayBoolean(value) {
  return value == null ? 'Unknown' : value ? 'Yes' : 'No'
}

function DetailSection({ title, rows, children }) {
  return <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    {children && <div className="mt-4">{children}</div>}
    {rows && <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-3" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd></div>)}</dl>}
  </section>
}

export default function OrganizationPetDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const { pets } = useCurrentOrganization()
  const { isLoading } = useAdminData()
  const { updatePet, removePet } = useAdminData()
  const pet = pets.find((item) => item.id === id)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [statusDialog, setStatusDialog] = useState(false)
  const [nextStatus, setNextStatus] = useState(pet?.adoptionStatus || 'Available')
  const [removeDialog, setRemoveDialog] = useState(false)
  const [notice, setNotice] = useState(routeLocation.state?.updated ? { tone: 'success', text: 'Pet information updated successfully.' } : null)
  const [isSaving, setIsSaving] = useState(false)
  useDocumentTitle(pet ? `${pet.name} | Home4Paws Organization` : 'Pet Not Found | Home4Paws')

  if (!pet && isLoading) return <section className="rounded-2xl bg-white p-6 text-sm text-muted" role="status">Loading pet details…</section>
  if (!pet) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Pet not found</h1><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/organization/pets">Back to My Pets</Link></section>

  const photos = pet.images?.length ? pet.images : pet.image ? [pet.image] : []
  const activePhoto = photos[Math.min(photoIndex, Math.max(photos.length - 1, 0))]
  const location = [pet.address, pet.city || pet.location, pet.state, pet.pincode].filter(Boolean).join(', ')

  async function confirmStatusChange() {
    setIsSaving(true)
    try {
      await updatePet(pet.id, { adoptionStatus: nextStatus })
      setNotice({ tone: 'success', text: `${pet.name}'s status was updated to ${nextStatus}.` })
      setStatusDialog(false)
    } catch (error) {
      setNotice({ tone: 'error', text: error.message || 'Pet status could not be changed.' })
    } finally { setIsSaving(false) }
  }

  async function confirmRemoval() {
    setIsSaving(true)
    try {
      await removePet(pet.id)
      navigate('/organization/pets', { state: { notice: `${pet.name} was removed from your active listings.` } })
    } catch (error) {
      setNotice({ tone: 'error', text: error.message || 'Pet could not be removed.' })
    } finally { setIsSaving(false) }
  }

  return <>
    <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/organization/pets">← Back to My Pets</Link>} subtitle="Pet profile" title={pet.name} />
    {notice && <FeedbackMessage className="mb-5" tone={notice.tone}>{notice.text}</FeedbackMessage>}
    <div className="grid gap-4 xl:grid-cols-[minmax(16rem,0.85fr)_1.15fr]">
      <section className="h-fit overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
        {activePhoto ? <img alt={pet.imageAlt || `${pet.name}, ${pet.species}`} className="aspect-[4/3] w-full object-cover" src={activePhoto} /> : <div className="flex aspect-[4/3] items-center justify-center bg-sage text-sm text-muted">No photo provided</div>}
        {photos.length > 1 && <div className="grid grid-cols-5 gap-2 p-3">{photos.map((photo, index) => <button aria-label={`Show pet photo ${index + 1}`} aria-pressed={index === photoIndex} className={`overflow-hidden rounded-lg border-2 ${index === photoIndex ? 'border-forest' : 'border-transparent'}`} key={`${index}-${photo.slice(0, 35)}`} onClick={() => setPhotoIndex(index)} type="button"><img alt="" className="aspect-square w-full object-cover" src={photo} /></button>)}</div>}
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <DetailSection title="Basic Information" rows={[
          ['Name', pet.name], ['Species', pet.species], ['Breed', pet.breed], ['Age', pet.age], ['Gender', pet.gender], ['Size', pet.size],
        ]} />
        <DetailSection title="About">
          <div className="space-y-4">
            <div><h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Description</h3><p className="mt-1 whitespace-pre-line text-sm leading-6 text-ink">{pet.description || 'No description added.'}</p></div>
            <div className="border-t border-ink/10 pt-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Rescue Story</h3><p className="mt-1 whitespace-pre-line text-sm leading-6 text-ink">{pet.rescueStory || 'No rescue story added.'}</p></div>
          </div>
        </DetailSection>
        <DetailSection title="Personality"><PersonalityTags traits={pet.personality || []} /></DetailSection>
        <DetailSection title="Behaviour" rows={[
          ['Good with children', displayBoolean(pet.goodWithChildren)],
          ['Good with other dogs', displayBoolean(pet.goodWithDogs ?? pet.goodWithPets?.dogs)],
          ['Good with cats', displayBoolean(pet.goodWithCats ?? pet.goodWithPets?.cats)],
          ['Good with strangers', displayBoolean(pet.goodWithStrangers)],
          ['Activity level', pet.activityLevel],
        ]} />
        <DetailSection title="Health" rows={[
          ['Vaccinated', displayBoolean(pet.vaccinated)], ['Sterilized', displayBoolean(pet.sterilized)],
          ['Medical condition', pet.medicalCondition], ['Special needs', pet.specialNeeds],
        ]} />
        <DetailSection title="Adoption" rows={[
          ['Status', <AdminStatusBadge status={pet.adoptionStatus} />], ['Location', location],
          ...(pet.rescueReportId ? [['Rescue Report', <Link className="font-semibold text-forest hover:underline" to={`/organization/rescue-requests/${pet.rescueReportId}`}>View rescue report {pet.rescueReportId}</Link>]] : []),
        ]} />
      </div>
    </div>
    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
      <Button className="w-full sm:w-auto" to={`/organization/pets/${pet.id}/edit`} variant="secondary">Edit Pet</Button>
      <Button className="w-full sm:w-auto" onClick={() => { setNextStatus(pet.adoptionStatus || 'Available'); setStatusDialog(true) }} type="button" variant="secondary">Change Status</Button>
      <Button className="w-full text-red-700 hover:bg-red-50 sm:w-auto" onClick={() => setRemoveDialog(true)} type="button" variant="secondary">Remove Pet</Button>
    </div>
    {statusDialog && <PetConfirmationDialog confirmDisabled={isSaving || nextStatus === pet.adoptionStatus} confirmLabel={isSaving ? 'Saving…' : 'Confirm'} description={`Change ${pet.name}'s status from ${pet.adoptionStatus} to ${nextStatus}?`} onClose={() => setStatusDialog(false)} onConfirm={confirmStatusChange} title="Change Adoption Status?">
      <label className="block text-sm font-semibold text-ink" htmlFor="nextPetStatus">Adoption Status</label>
      <select className={`${fieldControlClass} mt-2`} id="nextPetStatus" onChange={(event) => setNextStatus(event.target.value)} value={nextStatus}>{['Available', 'Under Adoption', 'Adopted'].map((item) => <option key={item}>{item}</option>)}</select>
    </PetConfirmationDialog>}
    {removeDialog && <PetConfirmationDialog confirmDisabled={isSaving} confirmLabel={isSaving ? 'Saving…' : 'Remove'} description="This will remove the pet from your active listings." onClose={() => setRemoveDialog(false)} onConfirm={confirmRemoval} title="Remove Pet Listing?" />}
  </>
}
