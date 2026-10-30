import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import Button from '../../components/Button.jsx'
import ConfirmationModal from '../../components/admin/ConfirmationModal.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'
import { apiDownload } from '../../services/api.js'
import { adminList } from '../../services/organizationService.js'

function InfoSection({ title, rows }) {
  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <dl className="mt-4 divide-y divide-ink/10">
        {rows.map(([label, value]) => (
          <div className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4" key={label}>
            <dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function OrganizationDetailsPage() {
  const { id } = useParams()
  const { organizations, updateOrganization } = useAdminData()
  const summary = organizations.find((item) => item.id === id)
  const [details, setDetails] = useState(null)
  const [detailsError, setDetailsError] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [message, setMessage] = useState(null)
  const [downloadError, setDownloadError] = useState('')
  const organization = details || summary
  useEffect(() => {
    let active = true
    adminList(`organizations/${encodeURIComponent(id)}`)
      .then((data) => { if (active) setDetails(data.organization) })
      .catch((error) => { if (active) setDetailsError(error.message || 'Organization details could not be loaded.') })
    return () => { active = false }
  }, [id])
  useDocumentTitle(organization ? `${organization.name} | Home4Paws Admin` : 'Organization Not Found | Home4Paws Admin')

  if (!organization && !detailsError) return <div className="rounded-2xl bg-white p-6 text-sm text-muted" role="status">Loading organization details…</div>
  if (!organization) return <div className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Organization details unavailable</h1><p className="mt-2 text-sm text-red-700">{detailsError}</p><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/admin/organizations">Back to NGOs &amp; Shelters</Link></div>

  async function approve() {
    try {
      const updated = await updateOrganization(organization.id, 'Approved')
      setDetails((current) => ({ ...(current || organization), ...updated }))
      setMessage({ tone: 'success', text: 'Organization approved successfully.' })
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'Organization could not be approved.' })
    }
  }

  async function reject(reason) {
    try {
      const updated = await updateOrganization(organization.id, 'Rejected', reason)
      setDetails((current) => ({ ...(current || organization), ...updated }))
      setShowReject(false)
      setMessage({ tone: 'success', text: 'Organization rejected.' })
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'Organization could not be rejected.' })
    }
  }

  async function downloadDocument(document) {
    try {
      setDownloadError('')
      const blob = await apiDownload(document.downloadUrl)
      const url = URL.createObjectURL(blob)
      const anchor = window.document.createElement('a')
      anchor.href = url
      anchor.download = document.name || 'organization-document'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      setDownloadError(error.message || 'The document could not be downloaded.')
    }
  }

  return (
    <>
      <AdminPageHeader
        action={<Link className="text-sm font-semibold text-forest hover:underline" to="/admin/organizations">← Back to list</Link>}
        subtitle={<span className="inline-flex items-center gap-2">Verification status <AdminStatusBadge label={organization.status === 'Approved' ? 'Verified' : organization.status} status={organization.status} /></span>}
        title={organization.name}
      />
      {message && <FeedbackMessage className="mb-5" tone={message.tone}>{message.text}</FeedbackMessage>}
      <div className="grid gap-4 xl:grid-cols-2">
        <InfoSection title="Organization Information" rows={[
          ['Organization Name', organization.name], ['Organization Type', organization.type === 'SHELTER' ? 'Animal Shelter' : organization.type],
          ['Registration Number', organization.registrationNumber], ['Year Established', organization.yearEstablished], ['Description', organization.description],
        ]} />
        <InfoSection title="Contact" rows={[
          ['Contact Person', organization.contactPerson], ['Designation', organization.designation], ['Email', organization.email], ['Mobile', organization.mobile],
        ]} />
        <InfoSection title="Address" rows={[
          ['Address', organization.address], ['City', organization.city], ['State', organization.state], ['Pincode', organization.pincode],
        ]} />
        <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-base font-semibold text-ink">Documents</h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {[
              ['Registration Certificate', organization.documents?.registrationCertificate],
              ['Authorized Person ID', organization.documents?.authorizedPersonId],
              ['Address Proof', organization.documents?.addressProof],
            ].map(([label, file]) => <li className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4" key={label}><span className="text-sm text-muted">{label}</span>{file?.downloadUrl ? <button className="break-all text-left text-sm font-semibold text-forest underline underline-offset-2" onClick={() => downloadDocument(file)} type="button">{file.name || 'Download document'}</button> : <span className="text-sm text-muted">Not provided</span>}</li>)}
          </ul>
          {downloadError && <p className="mt-3 text-xs text-red-700" role="alert">{downloadError}</p>}
        </section>
      </div>
      {organization.rejectionReason && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">Rejection reason: {organization.rejectionReason}</p>}
      {organization.status === 'Pending' && (
        <section aria-label="Verification actions" className="mt-5 flex flex-col gap-3 rounded-2xl border border-ink/5 bg-white p-4 sm:flex-row sm:justify-end">
          <Button className="text-red-800 hover:bg-red-50" onClick={() => setShowReject(true)} type="button" variant="secondary">Reject</Button>
          <Button onClick={approve} type="button">Approve</Button>
        </section>
      )}
      {showReject && (
        <ConfirmationModal confirmLabel="Confirm Rejection" description="This changes the organization's verification status to Rejected." onClose={() => setShowReject(false)} onConfirm={reject} title="Rejection Reason">
          {({ error, setError }) => (
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="rejection-reason">Rejection Reason</label>
              <textarea aria-describedby={error ? 'rejection-reason-error' : undefined} aria-invalid={Boolean(error)} className="min-h-28 w-full rounded-xl border border-ink/15 px-4 py-3 text-sm text-ink outline-none focus:border-forest focus:ring-2 focus:ring-forest/15" id="rejection-reason" onChange={() => setError('')} placeholder="Explain what needs to be corrected" rows="4" />
              {error && <p className="mt-1.5 text-xs font-medium text-red-700" id="rejection-reason-error" role="alert">{error}</p>}
            </div>
          )}
        </ConfirmationModal>
      )}
    </>
  )
}
