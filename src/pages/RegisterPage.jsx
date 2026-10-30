import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import RegisterForm from '../components/auth/RegisterForm.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function RegisterPage() {
  useDocumentTitle('Create Your Account | Home4Paws')
  return (
    <AuthLayout>
      <header className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Create Your Account</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Join Home4Paws and help give rescued pets a loving home.</p>
      </header>
      <section aria-label="Create account form" className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
        <RegisterForm />
        <div className="mt-6 border-t border-ink/10 pt-5 text-center text-sm text-muted">
          <p>Already have an account? <Link className="font-semibold text-forest hover:underline" to="/login">Login</Link></p>
          <p className="mt-3">Are you an NGO or animal shelter? <Link className="font-semibold text-forest hover:underline" to="/register/organization">Register as NGO/Shelter</Link></p>
        </div>
      </section>
    </AuthLayout>
  )
}
