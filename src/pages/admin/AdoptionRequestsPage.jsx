import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import { withAdoptionRelations } from '../../adoption/adoptionUtils.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

export default function AdoptionRequestsPage() {
  useDocumentTitle('Adoption Requests | Home4Paws Admin')
  const { adoptionRequests, pets, organizations } = useAdminData()
  const applications = adoptionRequests.map((request) => withAdoptionRelations(request, pets, organizations))
  const columns = [
    { key: 'id', label: 'Application ID', render: (request) => <span className="font-semibold text-ink">{request.id}</span> },
    { key: 'pet', label: 'Pet' },
    { key: 'applicant', label: 'Applicant' },
    { key: 'organization', label: 'Organization' },
    { key: 'date', label: 'Date' },
    { key: 'status', label: 'Status', render: (request) => <AdminStatusBadge status={request.status} /> },
    { key: 'action', label: 'Action', render: (request) => <Link className="font-semibold text-forest hover:underline" to={`/admin/adoption-requests/${request.id}`}>View</Link> },
  ]
  return <>
    <AdminPageHeader title="Adoption Requests" subtitle="Monitor applications across the portal. Adoption decisions are handled by each organization." />
    <DataTable columns={columns} emptyMessage="There are no adoption applications to monitor." rows={applications} />
  </>
}
