import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import AuthLayout from '../components/auth/AuthLayout.jsx'
import Button from '../components/Button.jsx'
import FormField, { fieldControlClass } from '../components/rescue/FormField.jsx'
import FeedbackMessage from '../components/FeedbackMessage.jsx'
import { isValidIndianMobile } from '../auth/validation.js'
import { useAdminData } from '../admin/AdminDataContext.jsx'
import useDocumentTitle from '../hooks/useDocumentTitle.js'

export default function ProfilePage() {
  useDocumentTitle('My Profile | Home4Paws')
  const navigate = useNavigate()
  const { user, signOut, updateProfile } = useAuth()
  const { updateUserProfile } = useAdminData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: user?.name || '', mobile: user?.mobile || '' })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  function logout() {
    signOut()
    navigate('/', { replace: true })
  }

  function startEditing() {
    setDraft({ name: user?.name || '', mobile: user?.mobile || '' })
    setErrors({})
    setMessage('')
    setEditing(true)
  }

  async function saveProfile(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!draft.name.trim()) nextErrors.name = 'Enter your name.'
    if (draft.mobile.trim() && !isValidIndianMobile(draft.mobile)) nextErrors.mobile = 'Enter a valid Indian mobile number.'
    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      document.getElementById(`profile-${firstError}`)?.focus()
      return
    }
    try {
      await updateProfile({ name: draft.name.trim(), mobile: draft.mobile.trim() })
      updateUserProfile(user?.email, { name: draft.name.trim(), mobile: draft.mobile.trim() })
      setEditing(false)
      setMessage({ tone: 'success', text: 'Profile updated successfully.' })
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'Profile could not be updated.' })
    }
  }

  return (
    <AuthLayout>
      <header className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest">Home4Paws</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">My Profile</h1>
      </header>
      <section aria-label="Profile details" className="rounded-3xl border border-ink/5 bg-white p-5 shadow-card sm:p-8">
        {message && <FeedbackMessage className="mb-4" tone={message.tone}>{message.text}</FeedbackMessage>}
        {editing ? <form className="space-y-5" noValidate onSubmit={saveProfile}>
          <FormField error={errors.name} htmlFor="profile-name" label="Name" required>{(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.name)} aria-required="true" autoComplete="name" className={fieldControlClass} id="profile-name" onChange={(event) => { setDraft((current) => ({ ...current, name: event.target.value })); setErrors((current) => ({ ...current, name: '' })) }} value={draft.name} />}</FormField>
          <FormField htmlFor="profile-email" label="Email">{(descriptionId) => <input aria-describedby={descriptionId} className={`${fieldControlClass} bg-cream text-muted`} id="profile-email" readOnly value={user?.email || ''} />}</FormField>
          <FormField error={errors.mobile} htmlFor="profile-mobile" label="Mobile Number" hint="Optional. Use an Indian mobile number if you add one.">{(descriptionId) => <input aria-describedby={descriptionId} aria-invalid={Boolean(errors.mobile)} autoComplete="tel" className={fieldControlClass} id="profile-mobile" inputMode="tel" onChange={(event) => { setDraft((current) => ({ ...current, mobile: event.target.value })); setErrors((current) => ({ ...current, mobile: '' })) }} type="tel" value={draft.mobile} />}</FormField>
          <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:justify-end"><Button onClick={() => setEditing(false)} type="button" variant="secondary">Cancel</Button><Button type="submit">Save Changes</Button></div>
        </form> : <>
        <dl className="divide-y divide-ink/10">
          {[
            ['Name', user?.name || '—'],
            ['Email', user?.email || '—'],
            ['Mobile', user?.mobile || '—'],
            ['Account type', user?.accountType || 'Adopter'],
          ].map(([label, value]) => (
            <div className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-4" key={label}>
              <dt className="text-sm font-medium text-muted">{label}</dt>
              <dd className="break-words text-sm font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-col gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:justify-end">
          <Button onClick={startEditing} type="button" variant="secondary">Edit Profile</Button>
          <Button onClick={logout} type="button">Logout</Button>
        </div>
        </>}
        <p className="mt-5 text-center text-xs leading-5 text-muted">This profile exists only in the current frontend session.</p>
      </section>
    </AuthLayout>
  )
}
