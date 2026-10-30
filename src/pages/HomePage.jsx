import { useMemo } from 'react'
import { ArrowRight, Heart, ShieldCheck } from 'lucide-react'
import Button from '../components/Button.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import PetCard from '../components/PetCard.jsx'
import Photo from '../components/Photo.jsx'
import SectionHeading from '../components/SectionHeading.jsx'
import { useAdminData } from '../admin/AdminDataContext.jsx'
import { adoptionStatusValue } from '../adoption/adoptionUtils.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'
import FeedbackMessage from '../components/FeedbackMessage.jsx'

const steps = [
  {
    number: '01',
    title: 'Find a Pet',
    description: 'Browse pets looking for a loving home.',
  },
  {
    number: '02',
    title: 'Apply',
    description: 'Submit an adoption application for the pet you are interested in.',
  },
  {
    number: '03',
    title: 'Adopt',
    description: 'The NGO or shelter reviews your application and guides you through the adoption process.',
  },
]

export default function HomePage() {
  useDocumentTitle('Home4Paws — Find a Friend. Give Them a Home.')
  const { pets: managedPets, dataError } = useAdminData()
  const currentFeaturedPets = useMemo(() => managedPets
    .filter((pet) => pet.isActive !== false && pet.adoptionStatus === 'Available')
    .slice(0, 3)
    .map((pet) => ({ ...pet, status: adoptionStatusValue(pet), location: pet.location || pet.city || pet.state || 'Location not provided' })), [managedPets])

  return (
    <>
      <Navbar />
      <main>
        {dataError && <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8 lg:px-10"><FeedbackMessage tone="error">{dataError}</FeedbackMessage></div>}
        <section className="overflow-hidden bg-cream">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 md:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:px-10 lg:py-24">
            <div className="relative z-10 max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-forest/10 bg-white/75 px-3.5 py-2 text-xs font-semibold text-forest">
                <Heart aria-hidden="true" className="h-3.5 w-3.5 fill-coral text-coral" />
                A kinder way home
              </div>
              <h1 className="max-w-xl text-[2.7rem] font-semibold leading-[1.08] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[4.15rem]">
                Find a Friend.
                <span className="mt-1 block text-forest">Give Them a Home.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
                Home4Paws connects rescued pets with caring people and trusted animal welfare organizations.
              </p>
              <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
                <Button to="/pets" className="w-full min-[400px]:w-auto">
                  Find a Pet <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Button>
                <Button to="/report-rescue" variant="secondary" className="w-full min-[400px]:w-auto">
                  Report a Rescue
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm text-muted">
                <ShieldCheck aria-hidden="true" className="h-[18px] w-[18px] text-forest" />
                A thoughtful start to finding your new best friend
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
              <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full border border-coral/30 sm:-right-7 sm:-top-7 sm:h-32 sm:w-32" aria-hidden="true" />
              <div className="relative aspect-[4/3.35] overflow-hidden rounded-[1.8rem] bg-sage shadow-soft sm:rounded-[2.2rem]">
                <Photo
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1400&q=90"
                  alt="A happy rescue dog enjoying a quiet moment outdoors"
                  className="h-full w-full object-cover"
                  fallbackClassName="h-full w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" aria-hidden="true" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3 text-white sm:bottom-7 sm:left-7 sm:right-7">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Every paw deserves</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">a place to belong.</p>
                  </div>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <Heart aria-hidden="true" className="h-5 w-5 fill-white" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20 lg:py-24" id="featured-pets">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Meet your new best friend"
                title="Pets Looking for a Home"
                description="Every pet has a story. Maybe yours starts with one of these friendly faces."
              />
              <Button to="/pets" variant="secondary" className="w-fit shrink-0">
                View All Pets <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:mt-11 lg:grid-cols-3 lg:gap-6">
              {currentFeaturedPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
            {!currentFeaturedPets.length && <p className="mt-5 text-sm text-muted">New pet listings will appear here as verified organizations add them.</p>}
          </div>
        </section>

        <section className="bg-cream py-16 sm:py-20 lg:py-24" id="how-it-works">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading
              eyebrow="A clear, caring process"
              title="How Adoption Works"
              description="Three simple steps bring you closer to a companion for life."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
              {steps.map((step) => (
                <article
                  className="rounded-2xl border border-ink/5 bg-white p-6 sm:p-7"
                  key={step.number}
                >
                  <p className="text-sm font-bold tracking-[0.12em] text-coral">{step.number}</p>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[1.6rem] bg-forest px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10 sm:py-9">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to Give a Pet a Home?</h2>
              <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">Your next best friend may be waiting for you.</p>
            </div>
            <Button to="/pets" variant="light" className="shrink-0">
              Find a Pet <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
