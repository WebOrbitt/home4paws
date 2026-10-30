import { MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import Button from '../Button.jsx'
import Photo from '../Photo.jsx'
import AdminStatusBadge from '../admin/AdminStatusBadge.jsx'

export default function OrganizationPetCard({ pet, onRemove }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-sage">
        <Photo alt={pet.imageAlt || `${pet.name}, ${pet.species}`} className="h-full w-full object-cover" fallbackClassName="h-full w-full" src={pet.image || pet.images?.[0]} />
        <AdminStatusBadge className="absolute left-3 top-3 bg-white/95 shadow-sm" status={pet.adoptionStatus} />
        <details className="group absolute right-3 top-3">
          <summary aria-label={`More actions for ${pet.name}`} className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-white/95 text-ink shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest [&::-webkit-details-marker]:hidden">
            <MoreVertical aria-hidden="true" className="h-5 w-5" />
          </summary>
          <div className="absolute right-0 z-10 mt-2 w-44 rounded-xl border border-ink/10 bg-white p-1.5 shadow-soft">
            <button className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-red-700 hover:bg-red-50" onClick={(event) => { event.currentTarget.closest('details').open = false; onRemove(pet) }} type="button">
              <Trash2 aria-hidden="true" className="h-4 w-4" /> Remove Pet
            </button>
          </div>
        </details>
      </div>
      <div className="p-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{pet.name}</h2>
        <p className="mt-1 text-sm text-muted">{pet.species}{pet.breed ? ` · ${pet.breed}` : ''}</p>
        <p className="mt-3 text-sm text-ink/80">{pet.age} <span aria-hidden="true">·</span> {pet.gender}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted"><MapPin aria-hidden="true" className="h-4 w-4 text-coral" />{pet.location || pet.city || 'Location not set'}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button aria-label={`View ${pet.name}`} className="min-h-10 px-4 py-2" to={`/organization/pets/${pet.id}`} variant="secondary">View</Button>
          <Button aria-label={`Edit ${pet.name}`} className="min-h-10 px-4 py-2" to={`/organization/pets/${pet.id}/edit`}><Pencil aria-hidden="true" className="h-4 w-4" /> Edit</Button>
        </div>
      </div>
    </article>
  )
}
