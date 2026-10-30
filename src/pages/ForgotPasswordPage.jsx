import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import FormField, { fieldControlClass } from '../components/rescue/FormField.jsx'
import { isValidEmail } from '../auth/validation.js'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function ForgotPasswordPage() {
  useDocumentTitle('Reset Your Password | Home4Paws')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit(event) {
    event.preventDefault()
    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  return (
    <AuthLayout>
      <header className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Reset Your Password</h1>
      </header>
      <section className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
        {submitted ? (
          <div aria-live="polite" className="text-center" role="status">
            <p className="text-base font-semibold text-ink">Reset request noted</p>
            <p className="mt-2 text-sm leading-6 text-muted">Password reset is not configured yet, so no reset email has been sent.</p>
            <p className="mt-1 break-all text-sm text-ink">{email}</p>
          </div>
        ) : (
          <form className="space-y-5" noValidate onSubmit={submit}>
            <p className="text-sm leading-6 text-muted">Enter the email address associated with your account.</p>
            <FormField error={error} htmlFor="reset-email" label="Email" required>
              {(descriptionId) => (
                <input aria-describedby={descriptionId} aria-invalid={Boolean(error)} aria-required="true" autoComplete="email" className={fieldControlClass} id="reset-email" onChange={(event) => { setEmail(event.target.value); setError('') }} placeholder="you@example.com" type="email" value={email} />
              )}
            </FormField>
            <Button className="w-full" type="submit">Send Reset Link</Button>
          </form>
        )}
        <p className="mt-6 border-t border-ink/10 pt-5 text-center text-sm text-muted"><Link className="font-semibold text-forest hover:underline" to="/login">Back to Login</Link></p>
      </section>
    </AuthLayout>
  )
}
