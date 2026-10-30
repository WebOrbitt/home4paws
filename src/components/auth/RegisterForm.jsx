import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { isValidEmail, isValidIndianMobile } from '../../auth/validation.js'
import Button from '../Button.jsx'
import FormField, { fieldControlClass } from '../rescue/FormField.jsx'
import PasswordField from './PasswordField.jsx'

const initialValues = { name: '', email: '', mobile: '', password: '', confirmPassword: '' }

export default function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '', ...(name === 'password' ? { confirmPassword: '' } : {}) }))
  }

  async function submit(event) {
    event.preventDefault()
    if (isSubmitting) return
    const nextErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Enter your full name.'
    if (!values.email.trim()) nextErrors.email = 'Enter your email address.'
    else if (!isValidEmail(values.email)) nextErrors.email = 'Enter a valid email address.'
    if (!values.mobile.trim()) nextErrors.mobile = 'Enter your mobile number.'
    else if (!isValidIndianMobile(values.mobile)) nextErrors.mobile = 'Enter a valid Indian mobile number.'
    if (!values.password) nextErrors.password = 'Create a password.'
    else if (values.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!values.confirmPassword) nextErrors.confirmPassword = 'Confirm your password.'
    else if (values.password !== values.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      document.getElementById(`register-${firstError}`)?.focus()
      return
    }

    setSubmitError('')
    setIsSubmitting(true)
    try {
      await register({ name: values.name.trim(), email: values.email.trim(), mobile: values.mobile.trim(), password: values.password, confirmPassword: values.confirmPassword })
      navigate('/adopter', { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Could not create your account. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <FormField error={errors.name} htmlFor="register-name" label="Full Name" required>
        {(descriptionId) => (
          <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.name)} aria-required="true" autoComplete="name" className={fieldControlClass} id="register-name" name="name" onChange={(event) => update('name', event.target.value)} placeholder="Enter your full name" value={values.name} />
        )}
      </FormField>
      <FormField error={errors.email} htmlFor="register-email" label="Email" required>
        {(descriptionId) => (
          <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.email)} aria-required="true" autoComplete="email" className={fieldControlClass} id="register-email" name="email" onChange={(event) => update('email', event.target.value)} placeholder="you@example.com" type="email" value={values.email} />
        )}
      </FormField>
      <FormField error={errors.mobile} htmlFor="register-mobile" label="Mobile Number" required>
        {(descriptionId) => (
          <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.mobile)} aria-required="true" autoComplete="tel" className={fieldControlClass} id="register-mobile" inputMode="tel" name="mobile" onChange={(event) => update('mobile', event.target.value)} placeholder="e.g. 98765 43210 or +91 98765 43210" type="tel" value={values.mobile} />
        )}
      </FormField>
      <PasswordField autoComplete="new-password" error={errors.password} hint="Use at least 8 characters." id="register-password" label="Password" onChange={(event) => update('password', (event.target.value))} value={values.password} />
      <PasswordField autoComplete="new-password" error={errors.confirmPassword} id="register-confirmPassword" label="Confirm Password" onChange={(event) => update('confirmPassword', event.target.value)} value={values.confirmPassword} />
      {submitError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-800" role="alert">{submitError}</p>}
      <Button aria-busy={isSubmitting} className="w-full" disabled={isSubmitting} type="submit">{isSubmitting ? 'Creating Account...' : 'Create Account'}</Button>
    </form>
  )
}
