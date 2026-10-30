import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

export default function OrganizationsPage() {
  useDocumentTitle('NGOs & Shelters | Home4Paws Admin')
  const { organizations } = useAdminData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [type, setType] = useState('All')

  const filteredOrganizations = useMemo(() => organizations.filter((organization) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [organization.name, organization.city, organization.contactPerson].some((value) => value.toLowerCase().includes(query))
    return matchesSearch && (status === 'All' || organization.status === status) && (type === 'All' || organization.type === type)
  }), [organizations, search, status, type])

  const columns = [
    { key: 'name', label: 'Organization', render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
    { key: 'type', label: 'Type', render: (row) => row.type === 'SHELTER' ? 'Shelter' : row.type },
    { key: 'city', label: 'City' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge label={row.status === 'Approved' ? 'Verified' : row.status} status={row.status} /> },
    { key: 'action', label: 'Action', render: (row) => <Link className="font-semibold text-forest hover:underline" to={`/admin/organizations/${row.id}`}>View</Link> },
  ]

  return (
    <>
      <AdminPageHeader title="NGOs & Shelters" subtitle="Review organization registrations and verification status." />
      <section aria-label="Organization filters" className="mb-4 grid gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:grid-cols-[minmax(12rem,1fr)_12rem_12rem]">
        <input aria-label="Search organizations" className={fieldControlClass} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, city, or contact" type="search" value={search} />
        <select aria-label="Filter by status" className={fieldControlClass} onChange={(event) => setStatus(event.target.value)} value={status}>
          {['All', 'Pending', 'Approved', 'Rejected'].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Filter by organization type" className={fieldControlClass} onChange={(event) => setType(event.target.value)} value={type}>
          <option value="All">All types</option><option value="NGO">NGO</option><option value="SHELTER">Shelter</option>
        </select>
      </section>
      <p className="mb-3 text-sm text-muted" aria-live="polite">{filteredOrganizations.length} organizations</p>
      <DataTable columns={columns} emptyMessage="No organizations match these filters." rows={filteredOrganizations} />
    </>
  )
}
