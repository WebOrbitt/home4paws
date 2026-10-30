import { AuthStatus, useAuth } from '../../auth/AuthContext.jsx'
import { useAdminData } from '../../admin/AdminDataContext.jsx'
import AuthLayout from '../auth/AuthLayout.jsx'
import Button from '../Button.jsx'
import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import { Link } from 'react-router-dom'
import useDocumentTitle from '../../hooks/useDocumentTitle.js'

function OrganizationStatusMessage({ title, children, reason }) {
  return (
    <AuthLayout>
      <section className="rounded-3xl border border-ink/5 bg-white p-6 text-center shadow-card sm:p-9">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{children}</p>
        {reason && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">Rejection reason: {reason}</p>}
        <Button className="mt-6 w-full sm:w-auto" to="/">Back to Home</Button>
      </section>
    </AuthLayout>
  )
}

export default function OrganizationAccessRoute({ children }) {
  const { status, organization: sessionOrganization } = useAuth()
  const { organizations } = useAdminData()
  const organization = sessionOrganization
    ? organizations.find((item) => item.id === sessionOrganization.id) || organizations.find((item) => item.name === sessionOrganization.name) || sessionOrganization
    : null
  const verificationStatus = organization?.status || organization?.verificationStatus || (status === AuthStatus.VERIFIED_ORGANIZATION ? 'Approved' : 'Pending')

  useDocumentTitle(verificationStatus === 'Approved' ? 'Organization Dashboard | Home4Paws' : `${verificationStatus} | Home4Paws`)
  if (!organization) return <ProtectedRoute allowedRoles={['NGO', 'SHELTER']}>{children}</ProtectedRoute>
  if (verificationStatus === 'Rejected') {
    return <OrganizationStatusMessage reason={organization.rejectionReason} title="Registration Not Approved">Your organization registration was not approved.</OrganizationStatusMessage>
  }
  if (verificationStatus !== 'Approved' || status === AuthStatus.PENDING_ORGANIZATION) {
    return <OrganizationStatusMessage title="Verification Pending">Your organization is currently under review. You will be able to manage pets and adoption activities after verification.</OrganizationStatusMessage>
  }
  return children
}
