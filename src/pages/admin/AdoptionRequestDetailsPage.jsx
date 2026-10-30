import { Link, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import { formatApplicationDate, withAdoptionRelations } from '../../adoption/adoptionUtils.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

function InfoSection({ title, rows }) {
  return <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
    <h2 className="font-semibold text-ink">{title}</h2>
    <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-3" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd></div>)}</dl>
  </section>
}

export default function AdoptionRequestDetailsPage() {
  const { id } = useParams()
  const { adoptionRequests, pets, organizations, isLoading } = useAdminData()
  const source = adoptionRequests.find((item) => item.id === id)
  const request = source ? withAdoptionRelations(source, pets, organizations) : null
  useDocumentTitle(request ? `${request.id} | Home4Paws Admin` : 'Application Not Found | Home4Paws Admin')
  if (!request && isLoading) return <section className="rounded-2xl bg-white p-6 text-sm text-muted" role="status">Loading application…</section>
  if (!request) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Application not found</h1><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/admin/adoption-requests">Back to Adoption Requests</Link></section>

  return <>
    <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/admin/adoption-requests">← Back to requests</Link>} subtitle="Application overview" title={request.id} />
    <div className="grid gap-4 xl:grid-cols-2">
      <InfoSection title="Application" rows={[
        ['Application ID', request.id], ['Submitted Date', formatApplicationDate(request.submittedAt)], ['Status', <AdminStatusBadge status={request.status} />],
      ]} />
      <InfoSection title="Application summary" rows={[
        ['Pet', request.pet], ['Applicant', request.applicant], ['Organization', request.organization],
      ]} />
    </div>
    <p className="mt-4 text-xs leading-5 text-muted">This page is read-only. Adoption decisions are made by the assigned NGO or shelter.</p>
  </>
}
