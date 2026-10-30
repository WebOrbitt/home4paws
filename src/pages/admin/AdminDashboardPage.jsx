import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatCard from '../../components/admin/AdminStatCard.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

function ViewLink({ to }) {
  return <Link className="rounded-md font-semibold text-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" to={to}>View</Link>
}

function SectionHeading({ id, title, to }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight text-ink" id={id}>{title}</h2>
      <Link className="shrink-0 text-sm font-semibold text-forest hover:underline" to={to}>View All</Link>
    </div>
  )
}

export default function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard | Home4Paws')
  const { organizations, pets, rescueReports, adoptionRequests } = useAdminData()
  const pendingOrganizations = organizations.filter((organization) => organization.status === 'Pending').slice(0, 3)
  const recentReports = rescueReports.slice(0, 3)

  const organizationColumns = [
    { key: 'name', label: 'Organization' },
    { key: 'type', label: 'Type', render: (row) => row.type === 'SHELTER' ? 'Shelter' : row.type },
    { key: 'city', label: 'City' },
    { key: 'submittedAt', label: 'Submitted' },
    { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge status={row.status} /> },
    { key: 'action', label: 'Action', render: (row) => <ViewLink to={`/admin/organizations/${row.id}`} /> },
  ]
  const reportColumns = [
    { key: 'id', label: 'Report ID' },
    { key: 'animalType', label: 'Animal' },
    { key: 'city', label: 'Location' },
    { key: 'condition', label: 'Condition' },
    { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge status={row.status} /> },
    { key: 'action', label: 'Action', render: (row) => <ViewLink to={`/admin/rescue-reports/${row.id}`} /> },
  ]

  return (
    <>
      <AdminPageHeader title="Dashboard" subtitle="Overview of Home4Paws activity." />
      <section aria-label="Platform summary" className="mb-7 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <AdminStatCard detail={`${organizations.filter((organization) => organization.status === 'Approved').length} verified`} label="NGOs/Shelters" value={organizations.length} />
        <AdminStatCard detail={`${pets.filter((pet) => pet.isActive !== false).length} active listings`} label="Available Pets" value={pets.filter((pet) => pet.isActive !== false && pet.adoptionStatus === 'Available').length} />
        <AdminStatCard detail="All current statuses" label="Rescue Reports" value={rescueReports.length} />
        <AdminStatCard detail="All current statuses" label="Adoption Requests" value={adoptionRequests.length} />
      </section>

      <div className="space-y-7">
        <section aria-labelledby="pending-verification-heading" className="min-w-0">
          <SectionHeading id="pending-verification-heading" title="Pending Verification" to="/admin/organizations" />
          <DataTable columns={organizationColumns} emptyMessage="No organizations are awaiting verification." rows={pendingOrganizations} />
        </section>
        <section aria-labelledby="recent-rescue-reports-heading" className="min-w-0">
          <SectionHeading id="recent-rescue-reports-heading" title="Recent Rescue Reports" to="/admin/rescue-reports" />
          <DataTable columns={reportColumns} emptyMessage="No rescue reports have been submitted yet." rows={recentReports} />
        </section>
      </div>
    </>
  )
}
