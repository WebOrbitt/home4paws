import { useEffect, useState } from 'react'
import { ArrowLeft, Check, MapPin, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import PersonalityTags from '../components/PersonalityTags.jsx'
import Photo from '../components/Photo.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAdminData } from '../admin/AdminDataContext.jsx'
import { applicationPetStatus } from '../adoption/adoptionUtils.js'
import { AuthRole, useAuth } from '../auth/AuthContext.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

function DetailRow({ label, children }) {
  return (
    <div className="border-b border-ink/10 py-3 last:border-0">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}

function ProfileSection({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-ink/10 bg-white p-5 sm:p-6 ${className}`}>
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function YesNo({ value }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${value ? 'text-forest' : 'text-muted'}`}>
      {value ? (
        <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
      ) : (
        <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
      )}
      {value ? 'Yes' : 'No'}
    </span>
  )
}

function ApplyPrompt({ onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="apply-prompt-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink" id="apply-prompt-title">
              Login Required
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Please login or create an account to apply for adoption.
            </p>
          </div>
          <button
            aria-label="Close message"
            autoFocus
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:bg-cream hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" to="/login">
            Login
          </Button>
          <Button className="flex-1" onClick={onClose} to="/register" variant="secondary">
            Create Account
          </Button>
        </div>
      </section>
    </div>
  )
}

function PetNotFound({ message = 'This profile may have been removed or the link may be incorrect.' }) {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[55vh] items-center justify-center bg-cream px-5 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Pet not found</h1>
          <p className="mt-3 text-sm text-muted">{message}</p>
          <Button className="mt-6" to="/pets">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Pets
          </Button>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function PetDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pets: managedPets, isLoading, dataError } = useAdminData()
  const managedPet = managedPets.find((item) => item.id === id)
  const pet = managedPet?.isActive === false ? null : managedPet || null
  const petStatus = applicationPetStatus(pet)
  useDocumentTitle(pet ? `${pet.name} | Home4Paws` : 'Pet Not Found | Home4Paws')
  const [showApplyPrompt, setShowApplyPrompt] = useState(false)

  if (!pet && isLoading) return <><Navbar /><main className="flex min-h-[55vh] items-center justify-center bg-cream px-5 py-16"><p className="text-sm text-muted" role="status">Loading pet profile…</p></main><Footer /></>
  if (!pet) return <PetNotFound message={dataError ? 'Pet listings are unavailable right now. Check the backend and database connection.' : undefined} />

  const goodWith = [
    ['Children', pet.goodWithChildren],
    ['Other dogs', pet.goodWithDogs ?? pet.goodWithPets?.dogs],
    ['Cats', pet.goodWithCats ?? pet.goodWithPets?.cats],
    ['Strangers', pet.goodWithStrangers],
  ]

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-cream">
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <Link
              className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-forest transition hover:text-forest-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              to="/pets"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Pets
            </Link>

            <div className="mt-5 grid items-start gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-sage shadow-card sm:rounded-3xl">
                <Photo
                  src={pet.image}
                  alt={pet.imageAlt || `${pet.name}, ${pet.species}`}
                  className="h-full w-full object-cover"
                  fallbackClassName="h-full w-full"
                />
              </div>

              <div className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-7">
                <StatusBadge status={petStatus} />
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{pet.name}</h1>
                <p className="mt-1 text-base text-muted">{pet.breed}</p>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin aria-hidden="true" className="h-4 w-4 text-coral" />
                  {pet.location}, India
                </p>

                <dl className="mt-5 grid grid-cols-2 gap-x-5">
                  <DetailRow label="Age">{pet.age}</DetailRow>
                  <DetailRow label="Gender">{pet.gender}</DetailRow>
                  <DetailRow label="Size">{pet.size}</DetailRow>
                  <DetailRow label="Animal type">{pet.species}</DetailRow>
                </dl>

                {petStatus === 'Available' ? (
                  <Button
                    className="mt-6 w-full"
                    onClick={() => user?.role === AuthRole.USER ? navigate(`/adoption/apply/${pet.id}`) : setShowApplyPrompt(true)}
                    type="button"
                  >
                    Apply for Adoption
                  </Button>
                ) : (
                  <Button className="mt-6 w-full" disabled type="button" variant="secondary">
                    {petStatus === 'Under Adoption' ? 'Currently Under Adoption' : 'Adopted'}
                  </Button>
                )}
                <Button className="mt-2 w-full" to="/pets" variant="secondary">
                  Back to Pets
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-2 lg:px-10">
          <ProfileSection title={`About ${pet.name}`} className="lg:col-span-2">
            <p className="text-sm leading-6 text-muted">{pet.description}</p>
            <div className="mt-4 grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/75">Rescue story</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{pet.rescueStory}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/75">Right now</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{pet.currentSituation || `${pet.name} is currently listed by ${pet.organizationName || pet.organization || 'a verified organization'}.`}</p>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Personality">
            <PersonalityTags traits={pet.personality} />
          </ProfileSection>

          <ProfileSection title="Behaviour">
            <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/75">Good with</h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {goodWith.map(([label, value]) => (
                <li className="flex items-center justify-between gap-2 text-sm" key={label}>
                  <span className="text-muted">{label}</span>
                  <YesNo value={value} />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
              <span className="text-muted">Activity level</span>
              <span className="font-semibold text-ink">{pet.activityLevel}</span>
            </div>
          </ProfileSection>

          <ProfileSection title="Health">
            <dl>
              <DetailRow label="Vaccinated"><YesNo value={pet.vaccinated} /></DetailRow>
              <DetailRow label="Sterilized"><YesNo value={pet.sterilized} /></DetailRow>
              <DetailRow label="Medical condition">{pet.medicalCondition}</DetailRow>
              <DetailRow label="Special needs">{pet.specialNeeds}</DetailRow>
            </dl>
          </ProfileSection>

          <ProfileSection title="Adoption information">
            <dl>
              <DetailRow label="Current location">{pet.location}, India</DetailRow>
              <DetailRow label="Rescued by">{pet.organizationName}</DetailRow>
              <DetailRow label="Status"><StatusBadge status={petStatus} /></DetailRow>
            </dl>
          </ProfileSection>
        </section>
      </main>
      <Footer />
      {showApplyPrompt && <ApplyPrompt onClose={() => setShowApplyPrompt(false)} />}
    </>
  )
}
