import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const statusFilters = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected', 'Completed']

export default function OrganizationAdoptionRequestsPage() {
  useDocumentTitle('Adoption Requests | Home4Paws')
  const { adoptionRequests } = useCurrentOrganization()
  const [status, setStatus] = useState('All')
  const [petSearch, setPetSearch] = useState('')
  const rows = useMemo(() => adoptionRequests.filter((request) => {
    const requestStatus = request.status === 'Submitted' ? 'Pending' : request.status
    const matchesStatus = status === 'All' || requestStatus === status
    const matchesPet = !petSearch.trim() || request.pet.toLowerCase().includes(petSearch.trim().toLowerCase())
    return matchesStatus && matchesPet
  }), [adoptionRequests, petSearch, status])
  const columns = [
    { key: 'applicantName', label: 'Applicant' },
    { key: 'pet', label: 'Pet' },
    { key: 'date', label: 'Submitted' },
    { key: 'status', label: 'Status', render: (request) => <AdminStatusBadge status={request.status} /> },
    { key: 'action', label: 'Action', render: (request) => <Link className="font-semibold text-forest hover:underline" to={`/organization/adoption-requests/${request.id}`}>View</Link> },
  ]
  return <>
    <AdminPageHeader subtitle="Review applications for pets listed by your organization." title="Adoption Requests" />
    <section aria-label="Adoption request filters" className="mb-4 grid gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:grid-cols-[minmax(12rem,1fr)_12rem]">
      <input aria-label="Search by pet name" className={fieldControlClass} onChange={(event) => setPetSearch(event.target.value)} placeholder="Search by pet name" type="search" value={petSearch} />
      <select aria-label="Filter applications by status" className={fieldControlClass} onChange={(event) => setStatus(event.target.value)} value={status}>{statusFilters.map((item) => <option key={item}>{item}</option>)}</select>
    </section>
    <DataTable columns={columns} emptyMessage={status === 'All' && !petSearch.trim() ? 'There are no adoption applications to review.' : 'No adoption applications match these filters.'} rows={rows} />
  </>
}
