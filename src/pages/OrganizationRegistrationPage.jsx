import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import OrganizationRegistrationForm from '../components/auth/OrganizationRegistrationForm.jsx'
import Button from '../components/Button.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

function OrganizationSubmitted() {
  return (
    <section aria-labelledby="organization-success-heading" className="rounded-3xl border border-ink/5 bg-white p-6 text-center shadow-card sm:p-9">
      <span aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest">✓</span>
      <h2 className="mt-5 text-2xl font-semibold tracking-tight text-ink" id="organization-success-heading">Registration Submitted</h2>
      <p className="mt-3 text-sm leading-6 text-muted">Your NGO/Shelter registration has been submitted for verification.</p>
      <p className="mx-auto mt-5 w-fit rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">Status: Pending Verification</p>
      <p className="mt-5 text-sm leading-6 text-muted">An administrator will review your organization details and documents before your organization can manage pets or adoption requests.</p>
      <Button className="mt-7 w-full sm:w-auto" to="/">Back to Home</Button>
      <Link className="mt-4 block text-sm font-semibold text-forest hover:underline" to="/organization">View Verification Status</Link>
    </section>
  )
}

export default function OrganizationRegistrationPage() {
  useDocumentTitle('Register as NGO/Shelter | Home4Paws')
  const { registerOrganization } = useAuth()
  const [submitted, setSubmitted] = useState(false)

  async function submitOrganization(formData) {
    const payload = new FormData()
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'documents') {
        for (const [documentType, file] of Object.entries(value || {})) {
          if (file) payload.append(`document_${documentType}`, file)
        }
      } else {
        payload.append(key, String(value))
      }
    }
    await registerOrganization(payload)
    setSubmitted(true)
  }

  return (
    <AuthLayout maxWidth="max-w-3xl">
      <header className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Register as NGO/Shelter</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Share your organization details for admin verification.</p>
      </header>
      {submitted ? <OrganizationSubmitted /> : <OrganizationRegistrationForm onSubmit={submitOrganization} />}
      {!submitted && <p className="mt-5 text-center text-sm text-muted">Registering as an individual? <Link className="font-semibold text-forest hover:underline" to="/register">Create an account</Link></p>}
    </AuthLayout>
  )
}
