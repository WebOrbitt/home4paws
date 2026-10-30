import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import Button from '../../components/Button.jsx'
import { fieldControlClass } from '../../components/rescue/FormField.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'
import FeedbackMessage from '../../components/FeedbackMessage.jsx'

export default function UsersPage() {
  useDocumentTitle('Users | Home4Paws Admin')
  const { users, setUserActive } = useAdminData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [message, setMessage] = useState(null)

  async function toggleUser(user) {
    setMessage(null)
    try {
      await setUserActive(user.id, user.status !== 'Active')
      setMessage({ tone: 'success', text: `${user.name}'s account is now ${user.status === 'Active' ? 'inactive' : 'active'}.` })
    } catch (error) {
      setMessage({ tone: 'error', text: error.message || 'The account status could not be changed.' })
    }
  }

  const filteredUsers = useMemo(() => users.filter((user) => {
    const query = search.trim().toLowerCase()
    const matches = !query || [user.name, user.email, user.mobile].some((value) => value.toLowerCase().includes(query))
    return matches && (status === 'All' || user.status === status)
  }), [users, search, status])

  const columns = [
    { key: 'name', label: 'Name', render: (user) => <span className="font-semibold text-ink">{user.name}</span> },
    { key: 'email', label: 'Email' }, { key: 'mobile', label: 'Mobile' }, { key: 'accountType', label: 'Account Type' },
    { key: 'status', label: 'Status', render: (user) => <AdminStatusBadge status={user.status} /> },
    { key: 'action', label: 'Action', render: (user) => (
      <div className="flex items-center gap-3">
        <Link className="font-semibold text-forest hover:underline" to={`/admin/users/${user.id}`}>View</Link>
        <Button className="min-h-9 px-3 py-2 text-xs" onClick={() => toggleUser(user)} type="button" variant="secondary">{user.status === 'Active' ? 'Deactivate' : 'Activate'}</Button>
      </div>
    ) },
  ]

  return (
    <>
      <AdminPageHeader title="Users" subtitle="Review member accounts and their current status." />
      <section aria-label="User filters" className="mb-4 grid gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:grid-cols-[minmax(12rem,1fr)_12rem]">
        <input aria-label="Search users" className={fieldControlClass} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or mobile" type="search" value={search} />
        <select aria-label="Filter users by status" className={fieldControlClass} onChange={(event) => setStatus(event.target.value)} value={status}><option>All</option><option>Active</option><option>Inactive</option></select>
      </section>
      {message && <FeedbackMessage className="mb-4" tone={message.tone}>{message.text}</FeedbackMessage>}
      <DataTable columns={columns} emptyMessage="No users match these filters." rows={filteredUsers} />
    </>
  )
}
