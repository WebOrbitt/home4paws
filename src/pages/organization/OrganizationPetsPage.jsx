import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import OrganizationPetCard from '../../components/organization/OrganizationPetCard.jsx'
import PetConfirmationDialog from '../../components/organization/PetConfirmationDialog.jsx'
import Button from '../../components/Button.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

export default function OrganizationPetsPage() {
  useDocumentTitle('My Pets | Home4Paws')
  const { pets } = useCurrentOrganization()
  const { removePet } = useAdminData()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [animal, setAnimal] = useState('All')
  const [petToRemove, setPetToRemove] = useState(null)
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [removeError, setRemoveError] = useState('')
  const filteredPets = useMemo(() => pets.filter((pet) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || pet.name.toLowerCase().includes(query) || (pet.breed || '').toLowerCase().includes(query)
    return matchesSearch && (status === 'All' || pet.adoptionStatus === status) && (animal === 'All' || pet.species === animal)
  }), [pets, search, status, animal])

  async function confirmRemoval() {
    if (!petToRemove) return
    setRemoveError('')
    try {
      await removePet(petToRemove.id)
      setNotice(`${petToRemove.name} was removed from your active listings.`)
      setPetToRemove(null)
    } catch (error) {
      setRemoveError(error.message || 'This pet could not be removed.')
    }
  }

  return (
    <>
      <AdminPageHeader action={<Button className="self-start sm:self-auto" to="/organization/pets/add">+ Add Pet</Button>} subtitle="Manage the pets currently listed by your organization." title="My Pets" />
      {notice && <FeedbackMessage className="mb-5">{notice}</FeedbackMessage>}
      {removeError && <FeedbackMessage className="mb-5" tone="error">{removeError}</FeedbackMessage>}
      <section aria-label="Pet filters" className="mb-5 grid gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:grid-cols-[minmax(12rem,1fr)_11rem_11rem]">
        <input aria-label="Search pets by name or breed" className={fieldControlClass} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or breed" type="search" value={search} />
        <select aria-label="Filter pets by adoption status" className={fieldControlClass} onChange={(event) => setStatus(event.target.value)} value={status}>
          {['All', 'Available', 'Under Adoption', 'Adopted'].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Filter pets by animal" className={fieldControlClass} onChange={(event) => setAnimal(event.target.value)} value={animal}>
          {['All', 'Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>
      <p aria-live="polite" className="mb-4 text-sm text-muted">{filteredPets.length} {filteredPets.length === 1 ? 'pet' : 'pets'}</p>
      {filteredPets.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPets.map((pet) => <OrganizationPetCard key={pet.id} onRemove={setPetToRemove} pet={pet} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-ink/5 bg-white px-5 py-10 text-center">
          <p className="text-sm text-muted">{pets.length ? 'No pets match those filters.' : 'Your organization has no active pet listings yet.'}</p>
          {!pets.length && <Button className="mt-4" to="/organization/pets/add">+ Add Pet</Button>}
        </div>
      )}
      {petToRemove && <PetConfirmationDialog confirmLabel="Remove" description="This will remove the pet from your active listings." onClose={() => setPetToRemove(null)} onConfirm={confirmRemoval} title="Remove Pet Listing?" />}
    </>
  )
}
