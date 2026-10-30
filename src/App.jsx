import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import PetDetailsPage from './pages/PetDetailsPage.jsx'
import PetsPage from './pages/PetsPage.jsx'
import HowItWorksPage from './pages/HowItWorksPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ReportRescuePage from './pages/ReportRescuePage.jsx'
import RescueReportStatusPage from './pages/RescueReportStatusPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import OrganizationRegistrationPage from './pages/OrganizationRegistrationPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import OrganizationsPage from './pages/admin/OrganizationsPage.jsx'
import OrganizationDetailsPage from './pages/admin/OrganizationDetailsPage.jsx'
import UsersPage from './pages/admin/UsersPage.jsx'
import UserDetailsPage from './pages/admin/UserDetailsPage.jsx'
import AdminPetsPage from './pages/admin/PetsPage.jsx'
import AdminPetDetailsPage from './pages/admin/PetDetailsPage.jsx'
import RescueReportsPage from './pages/admin/RescueReportsPage.jsx'
import RescueReportDetailsPage from './pages/admin/RescueReportDetailsPage.jsx'
import AdoptionRequestsPage from './pages/admin/AdoptionRequestsPage.jsx'
import AdoptionRequestDetailsPage from './pages/admin/AdoptionRequestDetailsPage.jsx'
import OrganizationAccessRoute from './components/organization/OrganizationAccessRoute.jsx'
import OrganizationLayout from './components/organization/OrganizationLayout.jsx'
import OrganizationDashboardPage from './pages/organization/OrganizationDashboardPage.jsx'
import OrganizationPetsPage from './pages/organization/OrganizationPetsPage.jsx'
import OrganizationPetDetailsPage from './pages/organization/OrganizationPetDetailsPage.jsx'
import AddPetPage from './pages/organization/AddPetPage.jsx'
import EditPetPage from './pages/organization/EditPetPage.jsx'
import RescueRequestsPage from './pages/organization/RescueRequestsPage.jsx'
import RescueRequestDetailsPage from './pages/organization/RescueRequestDetailsPage.jsx'
import OrganizationAdoptionRequestsPage from './pages/organization/AdoptionRequestsPage.jsx'
import OrganizationAdoptionRequestDetailsPage from './pages/organization/AdoptionRequestDetailsPage.jsx'
import OrganizationProfilePage from './pages/organization/OrganizationProfilePage.jsx'
import AdoptionApplicationPage from './pages/AdoptionApplicationPage.jsx'
import AdopterLayout from './components/adopter/AdopterLayout.jsx'
import AdopterDashboardPage from './pages/adopter/AdopterDashboardPage.jsx'
import AdopterApplicationsPage from './pages/adopter/AdopterApplicationsPage.jsx'
import AdopterApplicationDetailsPage from './pages/adopter/AdopterApplicationDetailsPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pets" element={<PetsPage />} />
      <Route path="/pets/:id" element={<PetDetailsPage />} />
      <Route path="/adoption/apply/:petId" element={<AdoptionApplicationPage />} />
      <Route path="/report-rescue" element={<ReportRescuePage />} />
      <Route path="/rescue-report/:id" element={<RescueReportStatusPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/organization" element={<OrganizationRegistrationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'NGO', 'SHELTER']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="organizations" element={<OrganizationsPage />} />
        <Route path="organizations/:id" element={<OrganizationDetailsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailsPage />} />
        <Route path="pets" element={<AdminPetsPage />} />
        <Route path="pets/:id" element={<AdminPetDetailsPage />} />
        <Route path="rescue-reports" element={<RescueReportsPage />} />
        <Route path="rescue-reports/:id" element={<RescueReportDetailsPage />} />
        <Route path="adoption-requests" element={<AdoptionRequestsPage />} />
        <Route path="adoption-requests/:id" element={<AdoptionRequestDetailsPage />} />
      </Route>
      <Route path="/organization" element={<OrganizationAccessRoute><OrganizationLayout /></OrganizationAccessRoute>}>
        <Route index element={<OrganizationDashboardPage />} />
        <Route path="pets" element={<OrganizationPetsPage />} />
        <Route path="pets/add" element={<AddPetPage />} />
        <Route path="pets/:id/edit" element={<EditPetPage />} />
        <Route path="pets/:id" element={<OrganizationPetDetailsPage />} />
        <Route path="rescue-requests" element={<RescueRequestsPage />} />
        <Route path="rescue-requests/:id" element={<RescueRequestDetailsPage />} />
        <Route path="adoption-requests" element={<OrganizationAdoptionRequestsPage />} />
        <Route path="adoption-requests/:id" element={<OrganizationAdoptionRequestDetailsPage />} />
        <Route path="profile" element={<OrganizationProfilePage />} />
      </Route>
      <Route path="/adopter" element={<ProtectedRoute allowedRoles={['USER']}><AdopterLayout /></ProtectedRoute>}>
        <Route index element={<AdopterDashboardPage />} />
        <Route path="applications" element={<AdopterApplicationsPage />} />
        <Route path="applications/:id" element={<AdopterApplicationDetailsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
