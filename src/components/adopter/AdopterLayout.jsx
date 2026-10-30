import { ClipboardList, LayoutDashboard, PawPrint, UserRound } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'

const navigation = [
  { label: 'Dashboard', to: '/adopter', icon: LayoutDashboard, end: true },
  { label: 'My Applications', to: '/adopter/applications', icon: ClipboardList },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

function NavigationLinks({ compact = false }) {
  return <nav aria-label="Adopter navigation" className={compact ? 'flex gap-2 overflow-x-auto' : 'flex flex-col gap-1'}>
    {navigation.map(({ label, to, icon: Icon, end }) => <NavLink className={({ isActive }) => `flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-medium transition ${isActive ? 'bg-sage text-forest' : 'text-ink/75 hover:bg-cream hover:text-forest'}`} end={end} key={to} to={to}>
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />{label}
    </NavLink>)}
  </nav>
}

export default function AdopterLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  function logout() {
    signOut()
    navigate('/')
  }

  return <div className="min-h-screen bg-cream lg:pl-64">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-ink/10 bg-white px-4 py-6 lg:block">
      <Link className="mb-8 inline-flex items-center gap-2 px-2 text-ink" to="/adopter">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-white"><PawPrint aria-hidden="true" className="h-5 w-5" /></span>
        <span className="font-bold tracking-tight">Home4Paws</span>
      </Link>
      <NavigationLinks />
    </aside>
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0"><p className="truncate text-base font-semibold text-ink sm:text-lg">Home4Paws</p><p className="truncate text-xs text-muted">{user?.name || 'Adopter account'}</p></div>
        <button className="rounded-lg px-2 py-2 text-sm font-semibold text-forest hover:bg-sage" onClick={logout} type="button">Logout</button>
      </div>
      <div className="border-t border-ink/10 px-3 py-2 lg:hidden"><NavigationLinks compact /></div>
    </header>
    <main className="mx-auto min-w-0 max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8"><Outlet /></main>
  </div>
}
