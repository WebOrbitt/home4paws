import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

export default function PetsPage() {
  useDocumentTitle('Pets | Home4Paws Admin')
  const { pets } = useAdminData()
  const [species, setSpecies] = useState('All')
  const [status, setStatus] = useState('All')
  const [location, setLocation] = useState('All')
  const locations = [...new Set(pets.map((pet) => pet.location))].sort()

  const filteredPets = useMemo(() => pets.filter((pet) =>
    (species === 'All' || pet.species === species) &&
    (status === 'All' || pet.adoptionStatus === status) &&
    (location === 'All' || pet.location === location)
  ), [pets, species, status, location])

  const columns = [
    { key: 'photo', label: 'Pet', render: (pet) => <div className="flex items-center gap-3"><img alt={pet.imageAlt} className="h-12 w-12 rounded-xl object-cover" loading="lazy" src={pet.image} /><span className="font-semibold text-ink">{pet.name}</span></div> },
    { key: 'species', label: 'Species' }, { key: 'breed', label: 'Breed' }, { key: 'organization', label: 'Organization' }, { key: 'location', label: 'Location' },
    { key: 'adoptionStatus', label: 'Adoption Status', render: (pet) => <AdminStatusBadge status={pet.adoptionStatus} /> },
    { key: 'action', label: 'Action', render: (pet) => <Link className="font-semibold text-forest hover:underline" to={`/admin/pets/${pet.id}`}>View</Link> },
  ]

  return (
    <>
      <AdminPageHeader title="Pets" subtitle="Monitor pets listed by NGOs and shelters." />
      <section aria-label="Pet filters" className="mb-4 grid gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:grid-cols-3">
        <select aria-label="Filter by species" className={fieldControlClass} onChange={(event) => setSpecies(event.target.value)} value={species}><option>All</option>{['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'].map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter by adoption status" className={fieldControlClass} onChange={(event) => setStatus(event.target.value)} value={status}><option>All</option><option>Available</option><option>Under Adoption</option><option>Adopted</option></select>
        <select aria-label="Filter by location" className={fieldControlClass} onChange={(event) => setLocation(event.target.value)} value={location}><option>All</option>{locations.map((item) => <option key={item}>{item}</option>)}</select>
      </section>
      <DataTable columns={columns} emptyMessage="No pets match these filters." rows={filteredPets} />
    </>
  )
}
