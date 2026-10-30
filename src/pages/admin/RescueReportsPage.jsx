import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const statuses = ['Pending Review', 'Under Review', 'NGO Assigned', 'Rescue Accepted', 'Rescue In Progress', 'Animal Rescued', 'Pet Profile Created', 'Closed']
const animalTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other']
const conditions = ['Healthy', 'Injured', 'Sick', 'Abandoned', 'Lost', 'In Danger', 'Unknown']

function formatDate(value) {
  if (!value) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  return value
}

export default function RescueReportsPage() {
  useDocumentTitle('Rescue Reports | Home4Paws Admin')
  const { rescueReports } = useAdminData()
  const [animalType, setAnimalType] = useState('All')
  const [condition, setCondition] = useState('All')
  const [status, setStatus] = useState('All')
  const filteredReports = useMemo(() => rescueReports.filter((report) =>
    (animalType === 'All' || report.animalType === animalType) &&
    (condition === 'All' || report.condition.toLowerCase() === condition.toLowerCase()) &&
    (status === 'All' || report.status === status)
  ), [rescueReports, animalType, condition, status])

  const columns = [
    { key: 'id', label: 'Report ID', render: (report) => <span className="font-semibold text-ink">{report.id}</span> },
    { key: 'animalType', label: 'Animal' },
    { key: 'city', label: 'Location' },
    { key: 'condition', label: 'Condition' },
    { key: 'reportedAt', label: 'Reported Date', render: (report) => formatDate(report.reportedAt || report.dateFound) },
    { key: 'status', label: 'Status', render: (report) => <AdminStatusBadge status={report.status} /> },
    { key: 'assignedOrganizationName', label: 'Assigned Organization', render: (report) => report.assignedOrganizationName || 'Not Assigned' },
    { key: 'action', label: 'Action', render: (report) => <Link className="font-semibold text-forest hover:underline" to={`/admin/rescue-reports/${report.id}`}>View</Link> },
  ]

  return (
    <>
      <AdminPageHeader title="Rescue Reports" subtitle="Review reports, assign verified organizations, and track rescue progress." />
      <section aria-label="Rescue report filters" className="mb-4 grid gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:grid-cols-3">
        <select aria-label="Filter by animal type" className={fieldControlClass} onChange={(event) => setAnimalType(event.target.value)} value={animalType}><option>All</option>{animalTypes.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter by condition" className={fieldControlClass} onChange={(event) => setCondition(event.target.value)} value={condition}><option>All</option>{conditions.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Filter by report status" className={fieldControlClass} onChange={(event) => setStatus(event.target.value)} value={status}><option>All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
      </section>
      <DataTable columns={columns} emptyMessage={animalType === 'All' && condition === 'All' && status === 'All' ? 'No rescue reports have been submitted yet.' : 'No rescue reports match these filters.'} rows={filteredReports} />
    </>
  )
}
