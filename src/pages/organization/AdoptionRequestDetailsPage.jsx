import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import { formatApplicationDate } from '../../adoption/adoptionUtils.js'
import AdoptionStatusTracker from '../../components/adoption/AdoptionStatusTracker.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import PetConfirmationDialog from '../../components/organization/PetConfirmationDialog.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

function InfoSection({ title, rows }) {
  return <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-3" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd></div>)}</dl>
  </section>
}

export default function OrganizationAdoptionRequestDetailsPage() {
  const { id } = useParams()
  const { adoptionRequests } = useCurrentOrganization()
  const { isLoading } = useAdminData()
  const { updateAdoptionRequestStatus } = useAdminData()
  const request = adoptionRequests.find((item) => item.id === id)
  const [dialog, setDialog] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [message, setMessage] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  useDocumentTitle(request ? `${request.id} | Adoption Requests | Home4Paws` : 'Application Not Found | Home4Paws')

  if (!request && isLoading) return <section className="rounded-2xl bg-white p-6 text-sm text-muted shadow-card" role="status">Loading application…</section>
  if (!request) return <section className="rounded-2xl bg-white p-6 shadow-card"><h1 className="text-xl font-semibold text-ink">Application not found</h1><p className="mt-2 text-sm text-muted">This application is not assigned to your organization.</p><Link className="mt-4 inline-block text-sm font-semibold text-forest hover:underline" to="/organization/adoption-requests">Back to Adoption Requests</Link></section>

  const pet = request.petRecord
  const organization = request.organizationRecord
  const canReview = ['Pending', 'Submitted', 'Under Review'].includes(request.status)
  const otherPets = request.hasOtherPets ? `Yes${request.otherPetsDetails ? ` — ${request.otherPetsDetails}` : ''}` : 'No'
  const applicantAddress = [request.address, request.city, request.pincode].filter(Boolean).join(', ')

  async function confirmAction() {
    let nextStatus
    let success
    if (dialog === 'approve') {
      nextStatus = 'Approved'
      success = 'Application approved successfully.'
    } else if (dialog === 'reject') {
      nextStatus = 'Rejected'
      success = 'Application rejected successfully.'
    } else {
      nextStatus = 'Completed'
      success = 'Adoption marked as completed. The pet is now marked as Adopted.'
    }
    setIsSaving(true)
    try {
      await updateAdoptionRequestStatus(request.id, nextStatus, rejectionReason)
      setDialog('')
      setMessage({ tone: 'success', text: success })
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'This application could not be updated.' })
    } finally {
      setIsSaving(false)
    }
  }

  return <>
    <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/organization/adoption-requests">← Back to Adoption Requests</Link>} subtitle={<span className="inline-flex flex-wrap items-center gap-2">Application status <AdminStatusBadge status={request.status} /></span>} title={request.id} />
    {message && <FeedbackMessage className="mb-4" tone={message.tone}>{message.text}</FeedbackMessage>}
    <section className="mb-4 rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-forest">Application overview</p><h2 className="mt-1 text-lg font-semibold text-ink">{request.applicantName} · {request.pet}</h2><p className="mt-1 text-sm text-muted">Submitted {formatApplicationDate(request.submittedAt)}</p></div><AdminStatusBadge status={request.status} /></div>
      <div className="mt-5 border-t border-ink/10 pt-5"><AdoptionStatusTracker status={request.status} /></div>
      {canReview && <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-5 sm:flex-row sm:justify-end"><button className="min-h-11 rounded-full border border-ink/15 px-5 text-sm font-semibold text-ink transition hover:bg-cream" onClick={() => { setRejectionReason(''); setDialog('reject') }} type="button">Reject Application</button><button className="min-h-11 rounded-full bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest-dark" onClick={() => setDialog('approve')} type="button">Approve Application</button></div>}
      {request.status === 'Approved' && <div className="mt-5 flex justify-end border-t border-ink/10 pt-5"><button className="min-h-11 rounded-full bg-forest px-5 text-sm font-semibold text-white transition hover:bg-forest-dark" onClick={() => setDialog('complete')} type="button">Mark Adoption Completed</button></div>}
    </section>
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
        {pet?.image || pet?.images?.[0] ? <img alt={`${pet.name}, ${pet.species}`} className="aspect-[16/8] w-full object-cover" src={pet.image || pet.images[0]} /> : <div className="flex aspect-[16/8] items-center justify-center bg-sage text-sm text-muted">Pet photo unavailable</div>}
        <div className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-forest">Pet</p><h2 className="mt-1 text-xl font-semibold text-ink">{pet?.name || request.pet}</h2><p className="mt-1 text-sm text-muted">{[pet?.breed, pet?.age, pet?.gender].filter(Boolean).join(' · ')}</p><p className="mt-2 text-sm text-muted">{organization?.name || request.organization}</p></div>
      </section>
      <InfoSection title="Applicant Information" rows={[
        ['Name', request.applicantName], ['Email', request.email], ['Mobile', request.mobile], ['Address', applicantAddress],
      ]} />
      <InfoSection title="Adoption Information" rows={[
        ['Reason for adoption', request.reason], ['Housing type', request.housingType], ['Pet experience', request.petExperience], ['Other pets', otherPets], ['Primary caregiver', request.primaryCaregiver], ['Additional information', request.additionalInformation],
      ]} />
      <InfoSection title="Application Details" rows={[
        ['Application ID', request.id], ['Submitted', formatApplicationDate(request.submittedAt)], ['Current status', request.status], ['Organization', organization?.name || request.organization],
      ]} />
    </div>
    {dialog === 'approve' && <PetConfirmationDialog confirmDisabled={isSaving} confirmLabel={isSaving ? 'Saving…' : 'Approve'} description="Approving this application will reserve the pet and mark them as Under Adoption. You can mark the adoption as completed later." onClose={() => setDialog('')} onConfirm={confirmAction} title="Approve Adoption Application?" />}
    {dialog === 'reject' && <PetConfirmationDialog confirmDisabled={isSaving} confirmLabel={isSaving ? 'Saving…' : 'Confirm Rejection'} description="The applicant will see this decision and the reason you provide in their application details." onClose={() => setDialog('')} onConfirm={confirmAction} title="Reject Adoption Application?">
      <label className="block text-sm font-semibold text-ink" htmlFor="rejectionReason">Reason for Rejection <span className="font-normal text-muted">(optional)</span></label>
      <textarea className={`${fieldControlClass} mt-2 min-h-24 resize-y`} id="rejectionReason" maxLength={500} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Share a brief reason with the applicant" rows="3" value={rejectionReason} />
    </PetConfirmationDialog>}
    {dialog === 'complete' && <PetConfirmationDialog confirmDisabled={isSaving} confirmLabel={isSaving ? 'Saving…' : 'Confirm'} description="Confirm that the pet has moved to their new home. This will update the pet’s public status to Adopted." onClose={() => setDialog('')} onConfirm={confirmAction} title="Complete Adoption?" />}
  </>
}
