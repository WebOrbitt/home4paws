import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { withAdoptionRelations } from '../../adoption/adoptionUtils.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

export default function AdopterApplicationsPage() {
  useDocumentTitle('My Applications | Home4Paws')
  const { user } = useAuth()
  const { adoptionRequests, pets, organizations } = useAdminData()
  const applications = adoptionRequests
    .filter((request) => request.adopterId === user?.id)
    .map((request) => withAdoptionRelations(request, pets, organizations))
  const columns = [
    { key: 'id', label: 'Application ID', render: (request) => <span className="font-semibold text-ink">{request.id}</span> },
    { key: 'pet', label: 'Pet' },
    { key: 'organization', label: 'Organization' },
    { key: 'date', label: 'Submitted' },
    { key: 'status', label: 'Status', render: (request) => <AdminStatusBadge status={request.status} /> },
    { key: 'action', label: 'Action', render: (request) => <Link className="font-semibold text-forest hover:underline" to={`/adopter/applications/${request.id}`}>View</Link> },
  ]

  return <>
    <AdminPageHeader subtitle="Review the status of your adoption applications." title="My Applications" />
    <DataTable columns={columns} emptyMessage="You have not submitted any adoption applications yet." rows={applications} />
  </>
}
