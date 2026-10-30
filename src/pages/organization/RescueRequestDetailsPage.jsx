import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import Button from '../../components/Button.jsx'
import PetConfirmationDialog from '../../components/organization/PetConfirmationDialog.jsx'
import RescueStatus from '../../components/rescue/RescueStatus.jsx'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

function InfoSection({ title, rows }) {
  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-semibold text-ink">{title}</h2>
      <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[8rem_1fr] sm:gap-3" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd></div>)}</dl>
    </section>
  )
}

export default function RescueRequestDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rescueRequests, organization } = useCurrentOrganization()
  const { isLoading } = useAdminData()
  const { organizations, pets, updateRescueReport, closeRescueReport } = useAdminData()
  const report = rescueRequests.find((item) => item.id === id)
  const assignedOrganization = organizations.find((item) => item.id === report?.assignedOrganizationId)
  const linkedPet = pets.find((item) => item.id === report?.petId)
  const [confirmation, setConfirmation] = useState('')
  const [notice, setNotice] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  useDocumentTitle(report ? `${report.id} | Home4Paws Organization` : 'Rescue Request Not Found | Home4Paws')

  if (!report && isLoading) return <section className="rounded-2xl bg-white p-6 text-sm text-muted" role="status">Loading rescue request…</section>
  if (!report) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Rescue request not found</h1><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/organization/rescue-requests">Back to Rescue Requests</Link></section>

  async function changeStatus(status, successText, closeDialog = false) {
    setIsSaving(true)
    try {
      await updateRescueReport(report.id, status)
      setNotice({ tone: 'success', text: successText })
      if (closeDialog) setConfirmation('')
    } catch (error) {
      setNotice({ tone: 'error', text: error.message || 'Rescue status could not be updated.' })
    } finally { setIsSaving(false) }
  }

  const acceptRequest = () => changeStatus('Rescue Accepted', 'Rescue request accepted.', true)
  const startRescue = () => changeStatus('Rescue In Progress', 'Rescue has been marked as in progress.')
  const markRescued = () => changeStatus('Animal Rescued', 'Animal has been marked as rescued.', true)

  function createPetProfile() {
    navigate('/organization/pets/add', { state: { rescueReportId: report.id } })
  }

  async function finishReport() {
    setIsSaving(true)
    try {
      await closeRescueReport(report.id)
      setNotice({ tone: 'success', text: 'Rescue report closed.' })
      setConfirmation('')
    } catch (error) {
      setNotice({ tone: 'error', text: error.message || 'Rescue report could not be closed.' })
    } finally { setIsSaving(false) }
  }

  return (
    <>
      <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/organization/rescue-requests">← Back to requests</Link>} subtitle={<span className="inline-flex flex-wrap items-center gap-2">Current status <AdminStatusBadge status={report.status} /></span>} title={report.id} />
      {notice && <FeedbackMessage className="mb-4" tone={notice.tone}>{notice.text}</FeedbackMessage>}
      <div className="grid gap-4 xl:grid-cols-[minmax(16rem,0.75fr)_1.25fr]">
        <section className="h-fit overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
          {report.photo ? <img alt={`${report.animalType} rescue report`} className="aspect-[4/3] w-full object-cover xl:aspect-auto xl:h-72" src={report.photo} /> : <div className="flex aspect-[4/3] items-center justify-center bg-sage text-sm text-muted xl:h-72">No photo provided</div>}
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoSection title="Animal" rows={[
            ['Animal type', report.animalType], ['Breed', report.breed], ['Approximate age', report.age], ['Gender', report.gender], ['Condition', report.condition], ['Description', report.description],
          ]} />
          <InfoSection title="Location" rows={[
            ['Address', report.address], ['City', report.city], ['State', report.state], ['Pincode', report.pincode], ['Date Found', report.dateFound],
          ]} />
          <InfoSection title="Reporter" rows={[
            ['Name', report.reporterName], ['Mobile', report.reporterMobile || report.mobile], ['Email', report.reporterEmail || report.email],
          ]} />
          <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
            <h2 className="font-semibold text-ink">Rescue Status</h2>
            <div className="mt-4"><RescueStatus status={report.status} /></div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {report.status === 'NGO Assigned' && <Button className="w-full sm:w-auto" onClick={() => setConfirmation('accept')} type="button">Accept Rescue</Button>}
              {report.status === 'Rescue Accepted' && <Button className="w-full sm:w-auto" disabled={isSaving} onClick={startRescue} type="button">Start Rescue</Button>}
              {report.status === 'Rescue In Progress' && <Button className="w-full sm:w-auto" onClick={() => setConfirmation('rescued')} type="button">Mark as Rescued</Button>}
              {report.status === 'Animal Rescued' && <Button className="w-full sm:w-auto" onClick={createPetProfile} type="button">Create Pet Profile</Button>}
              {(report.status === 'Pet Profile Created' || report.status === 'Closed') && linkedPet && <Button className="w-full sm:w-auto" to={`/organization/pets/${linkedPet.id}`} variant="secondary">View Pet</Button>}
              {report.status === 'Pet Profile Created' && <Button className="w-full sm:w-auto" onClick={() => setConfirmation('close')} type="button" variant="secondary">Close Report</Button>}
            </div>
          </section>
          <InfoSection title="Organization" rows={[
            ['Name', assignedOrganization?.name || report.assignedOrganizationName || organization?.name],
            ['Type', assignedOrganization ? (assignedOrganization.type === 'SHELTER' ? 'Shelter' : assignedOrganization.type) : organization?.type],
          ]} />
          {report.petId && <InfoSection title="Pet Profile" rows={[
            ['Pet', linkedPet?.name || report.petName], ['Rescue Report', report.id],
          ]} />}
        </div>
      </div>
      {confirmation === 'accept' && <PetConfirmationDialog confirmDisabled={isSaving} confirmLabel={isSaving ? 'Saving…' : 'Accept Rescue'} description="Confirm that your organization will handle this rescue." onClose={() => setConfirmation('')} onConfirm={acceptRequest} title="Accept Rescue Request?" />}
      {confirmation === 'rescued' && <PetConfirmationDialog confirmDisabled={isSaving} confirmLabel={isSaving ? 'Saving…' : 'Confirm'} description="Mark this animal as successfully rescued?" onClose={() => setConfirmation('')} onConfirm={markRescued} title="Confirm Rescue" />}
      {confirmation === 'close' && <PetConfirmationDialog confirmDisabled={isSaving} confirmLabel={isSaving ? 'Saving…' : 'Close Report'} description="Close this rescue report after creating the pet profile?" onClose={() => setConfirmation('')} onConfirm={finishReport} title="Close Rescue Report?" />}
    </>
  )
}
