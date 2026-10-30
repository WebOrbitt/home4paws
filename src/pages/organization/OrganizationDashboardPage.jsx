import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import OrganizationStatCard from '../../components/organization/OrganizationStatCard.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const quickActions = [
  ['View My Pets', '/organization/pets'],
  ['View Rescue Requests', '/organization/rescue-requests'],
  ['View Adoption Requests', '/organization/adoption-requests'],
]

export default function OrganizationDashboardPage() {
  useDocumentTitle('Organization Dashboard | Home4Paws')
  const { pets, rescueRequests, adoptionRequests } = useCurrentOrganization()
  const { organizations } = useAdminData()
  const activities = [
    ...rescueRequests.map((report) => ({ date: report.updatedAt || report.createdAt, text: `Rescue report ${report.id} is ${report.status}.` })),
    ...adoptionRequests.map((request) => ({ date: request.updatedAt || request.submittedAt, text: `Application ${request.id} for ${request.pet} is ${request.status}.` })),
    ...pets.filter((pet) => pet.rescueReportId).map((pet) => ({ date: pet.updatedAt || pet.createdAt, text: `Pet profile created for rescue report ${pet.rescueReportId}.` })),
  ].sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0)).slice(0, 4)

  return (
    <>
      <AdminPageHeader subtitle="Manage your organization's pets and adoption activities." title="Dashboard" />
      <section aria-label="Organization summary" className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <OrganizationStatCard label="Total Pets" value={pets.length} />
        <OrganizationStatCard label="Available for Adoption" value={pets.filter((pet) => pet.adoptionStatus === 'Available').length} />
        <OrganizationStatCard label="Rescue Requests" value={rescueRequests.length} />
        <OrganizationStatCard label="Adoption Requests" value={adoptionRequests.length} />
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section aria-labelledby="recent-activity-heading" className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-semibold text-ink" id="recent-activity-heading">Recent Activity</h2>
          <ul className="mt-4 divide-y divide-ink/10">
            {activities.map((activity) => <li className="flex items-start gap-3 py-3 text-sm text-ink/80 first:pt-0 last:pb-0" key={activity.text}><span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-forest/70" />{activity.text}</li>)}
            {!activities.length && <li className="py-3 text-sm text-muted">No recent activity.</li>}
          </ul>
        </section>
        <section aria-labelledby="quick-actions-heading" className="rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-6">
          <h2 className="text-lg font-semibold text-ink" id="quick-actions-heading">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            {quickActions.map(([label, to]) => <Link className="flex min-h-11 items-center justify-between rounded-xl bg-cream px-4 text-sm font-semibold text-forest transition hover:bg-sage" key={to} to={to}>{label}<span aria-hidden="true">→</span></Link>)}
          </div>
          {organizations.length === 0 && <p className="mt-4 text-xs text-muted">Organization data is not available right now. Refresh the page or check the API connection.</p>}
        </section>
      </div>
    </>
  )
}
