import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ClipboardList, Menu, PawPrint, UserRound, UsersRound, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext.jsx'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import FeedbackMessage from '../FeedbackMessage.jsx'

const navigation = [
  { label: 'Dashboard', to: '/organization', icon: PawPrint, end: true },
  { label: 'My Pets', to: '/organization/pets', icon: PawPrint },
  { label: 'Rescue Requests', to: '/organization/rescue-requests', icon: ClipboardList },
  { label: 'Adoption Requests', to: '/organization/adoption-requests', icon: UsersRound },
  { label: 'Organization Profile', to: '/organization/profile', icon: UserRound },
]

function NavigationLinks({ onNavigate }) {
  return (
    <nav aria-label="Organization navigation" className="flex flex-col gap-1">
      {navigation.map(({ label, to, icon: Icon, end }) => (
        <NavLink className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${isActive ? 'bg-sage text-forest' : 'text-ink/75 hover:bg-cream hover:text-forest'}`} end={end} key={to} onClick={onNavigate} to={to}>
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />{label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function OrganizationLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { organization } = useCurrentOrganization()
  const { dataError } = useAdminData()
  const organizationName = organization?.name || 'Organization'
  const organizationType = organization?.type === 'SHELTER' ? 'Shelter' : 'NGO'

  function logout() {
    signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-ink/10 bg-white px-4 py-6 lg:block">
        <Link className="mb-8 inline-flex items-center gap-2 px-2 text-ink" to="/organization">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white"><PawPrint aria-hidden="true" className="h-5 w-5" /></span>
          <span className="font-bold tracking-tight">Home4Paws</span>
        </Link>
        <NavigationLinks />
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink/10 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button aria-expanded={menuOpen} aria-label={menuOpen ? 'Close organization menu' : 'Open organization menu'} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink hover:bg-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest lg:hidden" onClick={() => setMenuOpen((open) => !open)} type="button">
              {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-ink sm:text-lg">Home4Paws</p>
              <p className="max-w-[44vw] truncate text-xs text-muted sm:max-w-none">{organizationName} · {organizationType}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link aria-label="Organization profile" className="rounded-lg px-2 py-2 text-sm font-medium text-ink/70 hover:bg-cream hover:text-forest" to="/organization/profile">Profile</Link>
            <button className="rounded-lg px-2 py-2 text-sm font-semibold text-forest hover:bg-sage" onClick={logout} type="button">Logout</button>
          </div>
        </div>
        {menuOpen && <div className="border-t border-ink/10 bg-white px-4 py-3 lg:hidden"><NavigationLinks onNavigate={() => setMenuOpen(false)} /></div>}
      </header>

      <main className="mx-auto min-w-0 max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {dataError && <FeedbackMessage className="mb-5" tone="error">{dataError}</FeedbackMessage>}
        <Outlet />
      </main>
    </div>
  )
}
