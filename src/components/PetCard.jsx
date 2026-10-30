import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from './Button.jsx'
import PersonalityTags from './PersonalityTags.jsx'
import Photo from './Photo.jsx'
import StatusBadge from './StatusBadge.jsx'

export default function PetCard({ pet }) {
  const adopted = pet.status === 'adopted'

  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-sage">
        <Link
          aria-label={`View ${pet.name}'s profile`}
          className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-forest"
          to={`/pets/${pet.id}`}
        >
          <Photo
            src={pet.image}
            alt={pet.imageAlt}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${adopted ? 'grayscale-[25%]' : ''}`}
            fallbackClassName="h-full w-full"
          />
        </Link>
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest shadow-sm backdrop-blur">
          Home4Paws
        </span>
        <StatusBadge className="pointer-events-none absolute right-3 top-3 bg-white/95 shadow-sm" status={pet.status} />
      </div>
      <div className="p-5 sm:p-6">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-ink">{pet.name}</h3>
          <p className="mt-1 text-sm text-muted">{pet.breed}</p>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-sm text-ink/75">
          <span>{pet.age}</span>
          <span className="text-ink/25" aria-hidden="true">·</span>
          <span>{pet.gender}</span>
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <MapPin aria-hidden="true" className="h-4 w-4 text-coral" />
          {pet.location || 'Location not provided'}
        </p>
        <PersonalityTags className="mt-4" traits={(pet.personality || []).slice(0, 3)} />
        <Button
          to={`/pets/${pet.id}`}
          variant="text"
          className="mt-4 min-h-10 px-0 py-2"
          aria-label={`View details for ${pet.name}`}
        >
          View Details <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </article>
  )
}
