import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import Button from '../../components/Button.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import RescueStatus from '../../components/rescue/RescueStatus.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

function ReportInfo({ title, rows }) {
  return (
    <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr] sm:gap-4" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd></div>)}</dl>
    </section>
  )
}

export default function RescueReportDetailsPage() {
  const { id } = useParams()
  const { rescueReports, organizations, pets, updateRescueReport, assignRescueOrganization, isLoading } = useAdminData()
  const report = rescueReports.find((item) => item.id === id)
  const assignedOrganization = organizations.find((item) => item.id === report?.assignedOrganizationId)
  const linkedPet = pets.find((item) => item.id === report?.petId)
  const approvedOrganizations = organizations.filter((item) => item.status === 'Approved')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('')
  const [notice, setNotice] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  useDocumentTitle(report ? `${report.id} | Home4Paws Admin` : 'Report Not Found | Home4Paws Admin')

  if (!report && isLoading) return <section className="rounded-2xl bg-white p-6 text-sm text-muted" role="status">Loading rescue report…</section>
  if (!report) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Rescue report not found</h1><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/admin/rescue-reports">Back to Rescue Reports</Link></section>

  async function reviewReport() {
    setIsSaving(true)
    try {
      await updateRescueReport(report.id, 'Under Review')
      setNotice({ tone: 'success', text: 'Rescue report is now under review.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error.message || 'Rescue report could not be updated.' })
    } finally { setIsSaving(false) }
  }

  async function assignOrganization() {
    if (!selectedOrganizationId) return
    setIsSaving(true)
    try {
      await assignRescueOrganization(report.id, selectedOrganizationId)
      setNotice({ tone: 'success', text: 'Rescue request assigned successfully.' })
    } catch (error) {
      setNotice({ tone: 'error', text: error.message || 'Rescue request could not be assigned.' })
    } finally { setIsSaving(false) }
  }

  return (
    <>
      <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/admin/rescue-reports">← Back to reports</Link>} subtitle={<span className="inline-flex flex-wrap items-center gap-2">Current status <AdminStatusBadge status={report.status} /></span>} title={report.id} />
      {notice && <FeedbackMessage className="mb-4" tone={notice.tone}>{notice.text}</FeedbackMessage>}
      <div className="grid gap-4 xl:grid-cols-[minmax(16rem,0.7fr)_1.3fr]">
        <section className="h-fit overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
          {report.photo ? <img alt={`${report.animalType} in the rescue report`} className="aspect-[4/3] w-full object-cover xl:aspect-auto xl:h-72" src={report.photo} /> : <div className="flex aspect-[4/3] items-center justify-center bg-sage text-sm text-muted xl:h-72">No photo provided</div>}
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <ReportInfo title="Rescue Information" rows={[
            ['Report ID', report.id], ['Animal Type', report.animalType], ['Breed', report.breed], ['Approximate Age', report.age], ['Gender', report.gender], ['Condition', report.condition], ['Description', report.description],
          ]} />
          <ReportInfo title="Location" rows={[
            ['Address', report.address], ['City', report.city], ['State', report.state], ['Pincode', report.pincode], ['Date Found', report.dateFound], ['Reported Date', report.reportedAt],
          ]} />
          <ReportInfo title="Reporter" rows={[
            ['Name', report.reporterName], ['Mobile', report.reporterMobile || report.mobile], ['Email', report.reporterEmail || report.email],
          ]} />
          <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-base font-semibold text-ink">Rescue Status</h2>
            <div className="mt-4"><RescueStatus status={report.status} /></div>
            {report.status === 'Pending Review' && <Button className="mt-5 w-full sm:w-auto" disabled={isSaving} onClick={reviewReport} type="button">Review Report</Button>}
            {report.status === 'Under Review' && <div className="mt-5 space-y-3">
              <label className="block text-sm font-semibold text-ink" htmlFor="rescue-organization">Assign Organization</label>
              <select className={fieldControlClass} id="rescue-organization" onChange={(event) => setSelectedOrganizationId(event.target.value)} value={selectedOrganizationId}>
                <option value="">Select verified organization</option>
                {approvedOrganizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name} — {organization.type === 'SHELTER' ? 'Shelter' : organization.type}</option>)}
              </select>
              <Button className="w-full sm:w-auto" disabled={!selectedOrganizationId || isSaving} onClick={assignOrganization} type="button">{isSaving ? 'Saving…' : 'Assign Rescue'}</Button>
              {!approvedOrganizations.length && <p className="text-sm text-muted">There are no approved organizations available to assign.</p>}
            </div>}
          </section>
          <ReportInfo title="Assigned Organization" rows={[
            ['Organization', assignedOrganization?.name || report.assignedOrganizationName || 'Not Assigned'],
            ['Organization Type', assignedOrganization ? (assignedOrganization.type === 'SHELTER' ? 'Shelter' : assignedOrganization.type) : '—'],
            ['Contact Person', assignedOrganization?.contactPerson],
            ['Mobile', assignedOrganization?.mobile],
          ]} />
          {report.petId && <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
            <h2 className="text-base font-semibold text-ink">Pet Profile Created</h2>
            <p className="mt-2 text-sm text-muted">{linkedPet?.name || report.petName || 'Linked pet profile'}</p>
            {linkedPet && <Button className="mt-4 w-full sm:w-auto" to={`/admin/pets/${linkedPet.id}`} variant="secondary">View Pet</Button>}
          </section>}
        </div>
      </div>
    </>
  )
}
