import { Link, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { formatApplicationDate, withAdoptionRelations } from '../../adoption/adoptionUtils.js'
import AdoptionStatusTracker from '../../components/adoption/AdoptionStatusTracker.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

function InfoSection({ title, rows }) {
  return <section className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    <dl className="mt-3 divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-3" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value || '—'}</dd></div>)}</dl>
  </section>
}

export default function AdopterApplicationDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { adoptionRequests, pets, organizations } = useAdminData()
  const source = adoptionRequests.find((item) => item.id === id && item.adopterId === user?.id)
  const request = source ? withAdoptionRelations(source, pets, organizations) : null
  useDocumentTitle(request ? `${request.id} | Home4Paws` : 'Application Not Found | Home4Paws')

  if (!request) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">Application not found</h1><p className="mt-2 text-sm text-muted">This application is not available for your account.</p><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/adopter/applications">Back to My Applications</Link></section>

  const pet = request.petRecord
  const organization = request.organizationRecord
  const otherPets = request.hasOtherPets ? `Yes${request.otherPetsDetails ? ` — ${request.otherPetsDetails}` : ''}` : 'No'
  return <>
    <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/adopter/applications">← Back to My Applications</Link>} subtitle={<span className="inline-flex flex-wrap items-center gap-2">Application status <AdminStatusBadge status={request.status} /></span>} title={request.id} />
    <section className="mb-4 rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
      <div className="grid gap-3 sm:grid-cols-2"><p className="text-sm text-muted">Submitted <span className="font-medium text-ink">{formatApplicationDate(request.submittedAt)}</span></p><p className="text-sm text-muted">Current status <AdminStatusBadge className="ml-2 align-middle" status={request.status} /></p></div>
      <div className="mt-5 border-t border-ink/10 pt-5"><AdoptionStatusTracker status={request.status} /></div>
    </section>
    {request.status === 'Rejected' && request.rejectionReason && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900" role="note"><span className="font-semibold">Organization response:</span> {request.rejectionReason}</p>}
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-card">
        {pet?.image ? <img alt={`${pet.name}, ${pet.species}`} className="aspect-[16/8] w-full object-cover" src={pet.image} /> : <div className="flex aspect-[16/8] items-center justify-center bg-sage text-sm text-muted">Pet photo unavailable</div>}
        <div className="p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-wide text-forest">Pet</p><h2 className="mt-1 text-xl font-semibold text-ink">{pet?.name || request.pet}</h2><p className="mt-1 text-sm text-muted">{[pet?.breed, pet?.age, pet?.gender].filter(Boolean).join(' · ')}</p></div>
      </section>
      <InfoSection title="Organization" rows={[
        ['Organization Name', organization?.name || request.organization], ['Organization Type', organization?.type === 'SHELTER' ? 'Shelter' : organization?.type], ['City', organization?.city],
      ]} />
      <InfoSection title="Applicant Information" rows={[
        ['Name', request.applicantName], ['Email', request.email], ['Mobile', request.mobile], ['Address', request.address], ['City', request.city], ['Pincode', request.pincode],
      ]} />
      <InfoSection title="Adoption Information" rows={[
        ['Reason', request.reason], ['Housing type', request.housingType], ['Pet experience', request.petExperience], ['Other pets', otherPets], ['Primary caregiver', request.primaryCaregiver], ['Additional information', request.additionalInformation],
      ]} />
    </div>
  </>
}
