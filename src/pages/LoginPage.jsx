import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import LoginForm from '../components/auth/LoginForm.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function LoginPage() {
  useDocumentTitle('Login | Home4Paws')
  return (
    <AuthLayout>
      <header className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Welcome Back</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Sign in to continue to Home4Paws.</p>
      </header>
      <section aria-label="Login form" className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
        <LoginForm />
        <div className="mt-6 border-t border-ink/10 pt-5 text-center text-sm text-muted">
          <p>Don&apos;t have an account? <Link className="font-semibold text-forest hover:underline" to="/register">Create Account</Link></p>
          <p className="mt-3"><Link className="font-semibold text-forest hover:underline" to="/register/organization">Register as NGO/Shelter</Link></p>
        </div>
      </section>
    </AuthLayout>
  )
}
