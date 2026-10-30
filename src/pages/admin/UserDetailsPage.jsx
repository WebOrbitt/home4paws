import { Link, useParams } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import AdminStatusBadge from '../../components/admin/AdminStatusBadge.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

export default function UserDetailsPage() {
  const { id } = useParams()
  const { users } = useAdminData()
  const user = users.find((item) => item.id === id)
  useDocumentTitle(user ? `${user.name} | Home4Paws Admin` : 'User Not Found | Home4Paws Admin')

  if (!user) return <section className="rounded-2xl bg-white p-6"><h1 className="text-xl font-semibold text-ink">User not found</h1><Link className="mt-4 inline-block text-sm font-semibold text-forest" to="/admin/users">Back to Users</Link></section>

  const rows = [
    ['Name', user.name], ['Email', user.email], ['Mobile', user.mobile], ['Account Type', user.accountType],
    ['Account Status', <AdminStatusBadge status={user.status} />], ['Registration Date', user.registeredAt],
  ]
  return (
    <>
      <AdminPageHeader action={<Link className="text-sm font-semibold text-forest hover:underline" to="/admin/users">← Back to Users</Link>} title={user.name} subtitle="Account details" />
      <section className="max-w-3xl rounded-2xl border border-ink/5 bg-white p-5 shadow-card sm:p-7">
        <dl className="divide-y divide-ink/10">{rows.map(([label, value]) => <div className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-4" key={label}><dt className="text-sm text-muted">{label}</dt><dd className="break-words text-sm font-medium text-ink">{value}</dd></div>)}</dl>
      </section>
    </>
  )
}
