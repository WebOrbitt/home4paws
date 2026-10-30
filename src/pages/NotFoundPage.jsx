import { ArrowLeft } from 'lucide-react'
import Button from '../components/Button.jsx'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found | Home4Paws')

  return <>
    <Navbar />
    <main className="flex min-h-[62vh] items-center justify-center bg-cream px-5 py-16 sm:px-8">
      <section className="max-w-lg text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Page Not Found</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Sorry, the page you’re looking for doesn’t exist.</p>
        <Button className="mt-7" to="/"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back to Home</Button>
      </section>
    </main>
    <Footer />
  </>
}
