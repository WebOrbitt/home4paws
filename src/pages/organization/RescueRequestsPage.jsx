import { Link } from 'react-router-dom'
import useCurrentOrganization from '../../organization/useCurrentOrganization.js'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

function formatDate(value) {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return value
}

export default function RescueRequestsPage() {
  useDocumentTitle('Rescue Requests | Home4Paws')
  const { rescueRequests } = useCurrentOrganization()
  const columns = [
    { key: 'id', label: 'Report ID', render: (report) => <span className="font-semibold text-ink">{report.id}</span> },
    { key: 'animalType', label: 'Animal' },
    { key: 'city', label: 'Location', render: (report) => report.city || report.address },
    { key: 'condition', label: 'Condition' },
    { key: 'dateFound', label: 'Date', render: (report) => formatDate(report.reportedAt || report.dateFound) },
    { key: 'status', label: 'Status', render: (report) => <AdminStatusBadge status={report.status} /> },
    { key: 'action', label: 'Action', render: (report) => <Link className="font-semibold text-forest hover:underline" to={`/organization/rescue-requests/${report.id}`}>View</Link> },
  ]
  return <>
    <AdminPageHeader subtitle="Only rescue requests assigned to your organization appear here." title="Rescue Requests" />
    <DataTable columns={columns} emptyMessage="There are no rescue requests at the moment." rows={rescueRequests} />
  </>
}
