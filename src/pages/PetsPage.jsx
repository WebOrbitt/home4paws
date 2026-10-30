import { useMemo, useState } from 'react'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import PetCard from '../components/PetCard.jsx'
import PetFilters from '../components/PetFilters.jsx'
import { useAdminData } from '../admin/AdminDataContext.jsx'
import { adoptionStatusValue } from '../adoption/adoptionUtils.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import FeedbackMessage from '../components/FeedbackMessage.jsx'

const defaultFilters = {
  search: '',
  species: 'all',
  ageGroup: 'all',
  gender: 'all',
  location: 'all',
  status: 'available',
}

export default function PetsPage() {
  useDocumentTitle('Find Your Companion | Home4Paws')
  const { pets: managedPets, dataError, isLoading } = useAdminData()
  const [filters, setFilters] = useState(defaultFilters)

  const publicPets = useMemo(() => managedPets
    .filter((pet) => pet.isActive !== false)
    .map((pet) => ({
      ...pet,
      status: adoptionStatusValue(pet),
      ageGroup: pet.ageGroup || getAgeGroup(pet),
      location: pet.location || pet.city || pet.state || 'Location not provided',
      goodWithPets: pet.goodWithPets || { dogs: pet.goodWithDogs ?? null, cats: pet.goodWithCats ?? null },
    })), [managedPets])

  const filteredPets = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    return publicPets.filter((pet) => {
      const matchesSearch =
        !search ||
        pet.name.toLowerCase().includes(search) ||
        pet.breed.toLowerCase().includes(search)

      return (
        matchesSearch &&
        (filters.species === 'all' || pet.species === filters.species) &&
        (filters.ageGroup === 'all' || pet.ageGroup === filters.ageGroup) &&
        (filters.gender === 'all' || pet.gender === filters.gender) &&
        (filters.location === 'all' || pet.location === filters.location) &&
        (filters.status === 'all' || pet.status === filters.status)
      )
    })
  }, [filters, publicPets])

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  const clearFilters = () => setFilters({ ...defaultFilters })

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-cream">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Find your match</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Find Your Companion
            </h1>
            <p className="mt-2 text-base text-muted">Meet pets looking for a loving home.</p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <PetFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />
          {dataError && <FeedbackMessage className="mt-5" tone="error">{dataError}</FeedbackMessage>}
          <div className="mt-7 flex items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm font-medium text-ink">
              {filteredPets.length} {filteredPets.length === 1 ? 'pet' : 'pets'} found
            </p>
            <p className="text-xs text-muted">Verified organization listings</p>
          </div>

          {filteredPets.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {filteredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          ) : dataError ? (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-cream px-5 py-14 text-center sm:py-16"><h2 className="text-xl font-semibold tracking-tight text-ink">Pet listings are unavailable</h2><p className="mt-2 text-sm text-muted">Check that the backend and database are running, then refresh this page.</p></div>
          ) : isLoading ? (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-cream px-5 py-14 text-center text-sm text-muted sm:py-16" role="status">Loading pet listings…</div>
          ) : (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-cream px-5 py-14 text-center sm:py-16">
              <h2 className="text-xl font-semibold tracking-tight text-ink">No pets found</h2>
              <p className="mt-2 text-sm text-muted">Try changing your search or filters.</p>
              <button
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                onClick={clearFilters}
                type="button"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}

function getAgeGroup(pet) {
  const ageText = String(pet.age || '').toLowerCase()
  const age = Number.parseFloat(pet.ageValue || ageText)
  if (pet.ageUnit === 'months' && age < 12) return 'puppy-kitten'
  if (/puppy|kitten|baby/.test(ageText)) return 'puppy-kitten'
  if (/young|juvenile/.test(ageText)) return 'young'
  if (/senior|elderly/.test(ageText)) return 'senior'
  if (Number.isFinite(age)) {
    const years = pet.ageUnit === 'months' ? age / 12 : age
    if (years < 1) return 'puppy-kitten'
    if (years < 3) return 'young'
    if (years >= 8) return 'senior'
  }
  return 'adult'
}
