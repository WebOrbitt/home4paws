import { ArrowRight, ClipboardCheck, HeartHandshake, PawPrint } from 'lucide-react'
import Button from '../components/Button.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

const steps = [
  { icon: PawPrint, number: '01', title: 'Find a pet', description: 'Browse profiles from verified animal welfare organizations and open a pet’s details to learn about their care and personality.' },
  { icon: ClipboardCheck, number: '02', title: 'Send an application', description: 'Share information about your home and experience. You can follow the application status from My Applications.' },
  { icon: HeartHandshake, number: '03', title: 'Meet and welcome them', description: 'The pet’s organization reviews your application and coordinates the next steps with you.' },
]

export default function HowItWorksPage() {
  useDocumentTitle('How Adoption Works | Home4Paws')

  return <>
    <Navbar />
    <main>
      <section className="bg-cream px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <header className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-forest">A clear, caring process</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">How Adoption Works</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">A thoughtful introduction helps you and the organization find the right next step for a pet.</p>
          </header>
          <div className="mt-9 grid gap-4 md:grid-cols-3 md:gap-5">
            {steps.map(({ icon: Icon, number, title, description }) => <article className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-7" key={number}>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage text-forest"><Icon aria-hidden="true" className="h-5 w-5" /></span>
              <p className="mt-5 text-xs font-bold tracking-[0.12em] text-coral">{number}</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </article>)}
          </div>
          <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div><h2 className="text-lg font-semibold text-ink">Ready to meet your companion?</h2><p className="mt-1 text-sm text-muted">Browse the pets currently looking for a home.</p></div>
            <Button className="w-full shrink-0 sm:w-auto" to="/pets">Find a Pet <ArrowRight aria-hidden="true" className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </>
}
