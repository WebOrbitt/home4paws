import { Link } from 'react-router-dom'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

const stats = [
  ['Applications', (applications) => applications.length],
  ['Under Review', (applications) => applications.filter((item) => ['Submitted', 'Pending', 'Under Review'].includes(item.status)).length],
  ['Approved', (applications) => applications.filter((item) => item.status === 'Approved').length],
  ['Completed', (applications) => applications.filter((item) => item.status === 'Completed').length],
]

export default function AdopterDashboardPage() {
  useDocumentTitle('My Adoption Activity | Home4Paws')
  const { user } = useAuth()
  const { adoptionRequests } = useAdminData()
  const applications = adoptionRequests.filter((item) => item.adopterId === user?.id)

  return <>
    <AdminPageHeader subtitle="A simple overview of your adoption applications." title="My Adoption Activity" />
    <section aria-label="Adoption application summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {stats.map(([label, getValue]) => <article className="rounded-2xl border border-ink/5 bg-white p-4 shadow-card sm:p-5" key={label}>
        <p className="text-sm font-medium text-muted">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-ink">{getValue(applications)}</p>
      </article>)}
    </section>
    {applications.length === 0 && <section className="mt-5 rounded-2xl border border-ink/5 bg-white p-5 sm:p-6">
      <p className="text-sm leading-6 text-muted">You have not submitted any adoption applications yet. Browse pets to find a companion.</p>
      <Link className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white" to="/pets">Find Pets</Link>
    </section>}
  </>
}
