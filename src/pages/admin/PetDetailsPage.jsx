import { Link, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

function DetailCard({ title, rows }) {
  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card">
      <h2 className="font-semibold text-ink">{title}</h2>
      <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-3" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value}</dd></div>)}</dl>
    </section>
  )
}

export default function AdminPetDetailsPage() {
  const { id } = useParams()
  const { pets } = useAdminData()
  const pet = pets.find((item) => item.id === id)
  useDocumentTitle(pet ? `${pet.name} | Home4Paws Admin` : 'Pet Not Found | Home4Paws Admin')

  if (!pet) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Pet not found</h1><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/admin/pets">Back to Pets</Link></section>

  return (
    <>
      <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/admin/pets">← Back to Pets</Link>} title={pet.name} subtitle="Pet listing details" />
      <div className="grid gap-4 xl:grid-cols-[minmax(16rem,0.8fr)_1.2fr]">
        <section className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
          <img alt={pet.imageAlt} className="h-64 w-full object-cover sm:h-80 xl:h-full" src={pet.image} />
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailCard title="Pet Information" rows={[
            ['Name', pet.name], ['Species', pet.species], ['Breed', pet.breed], ['Age', pet.age], ['Gender', pet.gender],
          ]} />
          <DetailCard title="Listing" rows={[
            ['Organization', pet.organization], ['Location', pet.location], ['Adoption Status', <AdminStatusBadge status={pet.adoptionStatus} />], ['Personality', pet.personality.join(', ')],
          ]} />
          <DetailCard title="Health" rows={[
            ['Medical Condition', pet.medicalCondition], ['Vaccinated', pet.vaccinated ? 'Yes' : 'No'], ['Sterilized', pet.sterilized ? 'Yes' : 'No'], ['Special Needs', pet.specialNeeds],
          ]} />
        </div>
      </div>
    </>
  )
}
