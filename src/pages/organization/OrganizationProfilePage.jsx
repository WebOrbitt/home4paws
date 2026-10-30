import { useState } from 'react'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import { isValidIndianMobile } from '../../auth/validation.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import Button from '../../components/Button.jsx'
import FormField, { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

const editableFields = [
  ['description', 'Organization Description', true],
  ['contactPerson', 'Contact Person', false],
  ['designation', 'Designation', false],
  ['mobile', 'Mobile Number', false],
  ['address', 'Address', false],
  ['city', 'City', false],
  ['state', 'State', false],
  ['pincode', 'Pincode', false],
]

function ProfileSection({ title, rows }) {
  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-semibold text-ink">{title}</h2>
      <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd></div>)}</dl>
    </section>
  )
}

export default function OrganizationProfilePage() {
  useDocumentTitle('Organization Profile | Home4Paws')
  const { organization } = useCurrentOrganization()
  const { updateOrganizationProfile } = useAdminData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({})
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)

  if (!organization) return null

  function startEditing() {
    setDraft(Object.fromEntries(editableFields.map(([key]) => [key, organization[key] || ''])))
    setErrors({})
    setMessage('')
    setEditing(true)
  }

  async function saveProfile(event) {
    event.preventDefault()
    const nextErrors = {}
    for (const [key, label] of editableFields) if (!draft[key]?.trim()) nextErrors[key] = `Enter ${label.toLowerCase()}.`
    if (draft.mobile && !isValidIndianMobile(draft.mobile)) nextErrors.mobile = 'Enter a valid Indian mobile number.'
    if (draft.pincode && !/^\d{6}$/.test(draft.pincode)) nextErrors.pincode = 'Enter a valid 6-digit pincode.'
    setErrors(nextErrors)
    const firstError = editableFields.find(([key]) => nextErrors[key])?.[0]
    if (firstError) {
      document.getElementById(`org-profile-${firstError}`)?.focus()
      return
    }
    try {
      await updateOrganizationProfile(organization.id, draft)
      setEditing(false)
      setMessage({ tone: 'success', text: 'Organization profile updated.' })
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'Organization profile could not be updated.' })
    }
  }

  function updateField(key, value) {
    const cleanValue = key === 'pincode' ? value.replace(/\D/g, '').slice(0, 6) : value
    setDraft((current) => ({ ...current, [key]: cleanValue }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  return (
    <>
      <AdminPageHeader
        action={!editing && <Button onClick={startEditing} type="button" variant="secondary">Edit Profile</Button>}
        subtitle="Organization details and verification information."
        title="Organization Profile"
      />
      {message && <FeedbackMessage className="mb-5" tone={message.tone}>{message.text}</FeedbackMessage>}

      {editing ? (
        <form className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-7" noValidate onSubmit={saveProfile}>
          <h2 className="mb-5 text-lg font-semibold text-ink">Edit Profile</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {editableFields.map(([key, label, multiline]) => (
              <FormField className={multiline || key === 'address' ? 'md:col-span-2' : ''} error={errors[key]} htmlFor={`org-profile-${key}`} key={key} label={label} required>
                {(descriptionId) => multiline ? (
                  <textarea aria-describedby={descriptionId} aria-invalid={Boolean(errors[key])} aria-required="true" className={`${fieldControlClass} min-h-28 resize-y`} id={`org-profile-${key}`} onChange={(event) => updateField(key, event.target.value)} rows="4" value={draft[key] || ''} />
                ) : (
                  <input aria-describedby={descriptionId} aria-invalid={Boolean(errors[key])} aria-required="true" autoComplete={key === 'address' ? 'street-address' : undefined} className={fieldControlClass} id={`org-profile-${key}`} inputMode={key === 'mobile' ? 'tel' : key === 'pincode' ? 'numeric' : undefined} maxLength={key === 'pincode' ? 6 : undefined} onChange={(event) => updateField(key, event.target.value)} type={key === 'mobile' ? 'tel' : 'text'} value={draft[key] || ''} />
                )}
              </FormField>
            ))}
          </div>
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:justify-end">
            <Button onClick={() => setEditing(false)} type="button" variant="secondary">Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <ProfileSection title="Organization Information" rows={[
            ['Organization Name', organization.name], ['Organization Type', organization.type === 'SHELTER' ? 'Shelter' : 'NGO'],
            ['Registration Number', organization.registrationNumber], ['Year Established', organization.yearEstablished], ['Description', organization.description],
          ]} />
          <ProfileSection title="Contact Information" rows={[
            ['Contact Person', organization.contactPerson], ['Designation', organization.designation], ['Official Email', organization.email], ['Mobile Number', organization.mobile],
          ]} />
          <ProfileSection title="Address" rows={[
            ['Address', organization.address], ['City', organization.city], ['State', organization.state], ['Pincode', organization.pincode],
          ]} />
          <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
            <h2 className="font-semibold text-ink">Verification</h2>
            <dl className="mt-3 divide-y divide-ink/10">
              <div className="flex flex-wrap items-center justify-between gap-3 py-3"><dt className="text-sm text-muted">Verification status</dt><dd><AdminStatusBadge label="Verified" status="Approved" /></dd></div>
              <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"><dt className="text-sm text-muted">Verification date</dt><dd className="text-sm font-medium text-ink">{organization.verificationDate || '—'}</dd></div>
            </dl>
            <h3 className="mt-4 border-t border-ink/10 pt-4 text-sm font-semibold text-ink">Documents</h3>
            <ul className="mt-2 space-y-2 text-sm text-ink/80">
              <li>Registration Certificate: {organization.documents?.registrationCertificate || '—'}</li>
              <li>Authorized Person ID: {organization.documents?.authorizedPersonId || '—'}</li>
              <li>Address Proof: {organization.documents?.addressProof || '—'}</li>
            </ul>
            <p className="mt-3 text-xs text-muted">Organization documents are available to administrators during verification.</p>
          </section>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">Organization registration details and verification status are managed by Admin.</p>
    </>
  )
}
