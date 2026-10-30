import { Link } from 'react-router-dom'
import { AuthStatus, useAuth } from '../../auth/AuthContext.jsx'
import AuthLayout from './AuthLayout.jsx'
import Button from '../Button.jsx'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { status, user, organization, isLoading } = useAuth()

  if (isLoading) return <main className="flex min-h-[50vh] items-center justify-center bg-cream px-4"><p aria-live="polite" className="text-sm font-medium text-muted">Checking your session...</p></main>

  if (status !== AuthStatus.LOGGED_IN && status !== AuthStatus.VERIFIED_ORGANIZATION) {
    return (
      <AuthLayout>
        <section className="rounded-3xl border border-ink/5 bg-white p-6 text-center shadow-card sm:p-9">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Login Required</h1>
          <p className="mt-3 text-sm leading-6 text-muted">You need to log in to access this page.</p>
          <Button className="mt-6 w-full sm:w-auto" to="/login">Login</Button>
        </section>
      </AuthLayout>
    )
  }

  const activeRole = user?.role || organization?.type
  if (!allowedRoles.includes(activeRole)) {
    return (
      <AuthLayout>
        <section className="rounded-3xl border border-ink/5 bg-white p-6 text-center shadow-card sm:p-9">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Access Unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-muted">This area is not available for your account.</p>
          <Link className="mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-forest hover:bg-sage" to="/">Back to Home</Link>
        </section>
      </AuthLayout>
    )
  }

  return children
}
