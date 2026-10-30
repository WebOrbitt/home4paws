import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, PawPrint, X } from 'lucide-react'
import Button from './Button.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

const links = [
  { label: 'Home', to: '/', end: true },
  { label: 'Find a Pet', to: '/pets' },
  { label: 'Report Rescue', to: '/report-rescue' },
  { label: 'How Adoption Works', to: '/how-it-works' },
]

const linkClasses = ({ isActive }) =>
  `rounded-md py-2 text-sm font-medium transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest ${isActive ? 'text-forest' : 'text-ink/70'}`

function Brand({ onClick }) {
  return (
    <Link
      className="inline-flex items-center gap-2.5 rounded-md text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
      to="/"
      onClick={onClick}
      aria-label="Home4Paws home"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white">
        <PawPrint aria-hidden="true" className="h-5 w-5" strokeWidth={2.1} />
      </span>
      <span className="text-lg font-bold tracking-tight">Home4Paws</span>
    </Link>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoggedIn, user, signOut } = useAuth()
  const navigate = useNavigate()
  const closeMenu = () => setMenuOpen(false)

  function handleLogout() {
    signOut()
    closeMenu()
    navigate('/')
  }

  return (
    <header className="relative z-20 border-b border-ink/5 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Brand onClick={closeMenu} />

        <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink className={linkClasses} end={link.end} key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isLoggedIn ? (
            <>
              {user?.role === 'USER' && <Button to="/adopter" variant="text" className="min-h-10 px-4 py-2 text-ink/75">My Applications</Button>}
              <Button to="/profile" variant="text" className="min-h-10 px-4 py-2 text-ink/75">Profile</Button>
              <Button className="min-h-10 px-4 py-2" onClick={handleLogout} type="button" variant="secondary">Logout</Button>
            </>
          ) : (
            <>
              <Button to="/login" variant="text" className="min-h-10 px-4 py-2 text-ink/75">Login</Button>
              <Button to="/register" className="min-h-10 px-4 py-2">Register</Button>
            </>
          )}
        </div>

        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-t border-ink/5 bg-white px-5 pb-5 pt-3 shadow-soft lg:hidden"
          id="mobile-navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <NavLink
                className={({ isActive }) => `${linkClasses({ isActive })} px-2`}
                end={link.end}
                key={link.to}
                onClick={closeMenu}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-3 flex gap-2 border-t border-ink/5 pt-4">
              {isLoggedIn ? (
                <>
                  {user?.role === 'USER' && <Button to="/adopter" variant="secondary" className="flex-1" onClick={closeMenu}>My Applications</Button>}
                  <Button to="/profile" variant="secondary" className="flex-1" onClick={closeMenu}>Profile</Button>
                  <Button className="flex-1" onClick={handleLogout} type="button">Logout</Button>
                </>
              ) : (
                <>
                  <Button to="/login" variant="secondary" className="flex-1" onClick={closeMenu}>Login</Button>
                  <Button to="/register" className="flex-1" onClick={closeMenu}>Register</Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
