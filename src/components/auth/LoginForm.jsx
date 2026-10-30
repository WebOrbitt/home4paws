import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { isValidEmail } from '../../auth/validation.js'
import Button from '../Button.jsx'
import FormField, { fieldControlClass } from '../rescue/FormField.jsx'
import PasswordField from './PasswordField.jsx'

export default function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  async function submit(event) {
    event.preventDefault()
    if (isSubmitting) return
    const nextErrors = {}
    if (!values.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!isValidEmail(values.email)) nextErrors.email = 'Enter a valid email address.'
    if (!values.password) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      document.getElementById(`login-${firstError}`)?.focus()
      return
    }

    setSubmitError('')
    setIsSubmitting(true)
    try {
      const { user } = await login({ email: values.email.trim(), password: values.password })
      const destination = user.role === 'ADMIN' ? '/admin' : ['NGO', 'SHELTER'].includes(user.role) ? '/organization' : '/adopter'
      navigate(destination, { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Could not sign in. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <FormField error={errors.email} htmlFor="login-email" label="Email" required>
        {(descriptionId) => (
          <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.email)} aria-required="true" autoComplete="email" className={fieldControlClass} id="login-email" name="email" onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" type="email" value={values.email} />
        )}
      </FormField>
      <PasswordField autoComplete="current-password" error={errors.password} id="login-password" label="Password" onChange={(event) => update('password', event.target.value)} value={values.password} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm text-ink/80">
          <input checked={values.remember} className="h-4 w-4 rounded border-ink/25 accent-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" onChange={(event) => update('remember', event.target.checked)} type="checkbox" />
          Remember me
        </label>
        <Link className="rounded-sm text-sm font-semibold text-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" to="/forgot-password">Forgot Password?</Link>
      </div>
      {submitError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-800" role="alert">{submitError}</p>}
      <Button aria-busy={isSubmitting} className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing in...' : 'Login'}</Button>
    </form>
  )
}
