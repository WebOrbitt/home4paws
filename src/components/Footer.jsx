import { Link } from 'react-router-dom'
import { PawPrint } from 'lucide-react'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Find a Pet', to: '/pets' },
  { label: 'Report Rescue', to: '/report-rescue' },
  { label: 'How Adoption Works', to: '/how-it-works' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
]

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
        <div className="max-w-xs">
          <Link className="inline-flex items-center gap-2 text-ink" to="/">
            <PawPrint aria-hidden="true" className="h-5 w-5 text-forest" />
            <span className="font-bold tracking-tight">Home4Paws</span>
          </Link>
          <p className="mt-2 text-sm leading-6 text-muted">
            A welcoming first step toward a lifelong friendship.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex max-w-2xl flex-wrap gap-x-5 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              className="rounded-sm text-sm text-ink/70 transition hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
              key={link.to}
              to={link.to}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-muted md:whitespace-nowrap">
          © {new Date().getFullYear()} Home4Paws. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
