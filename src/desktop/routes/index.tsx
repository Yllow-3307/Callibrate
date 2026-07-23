import { Route, Routes, Navigate } from 'react-router-dom'
import DesktopSignInPage from '../features/auth/DesktopSignInPage'
import DesktopSignUpPage from '../features/auth/DesktopSignUpPage'
import DesktopOnboardingWizard from '../features/onboarding/DesktopOnboardingWizard'
import DesktopThankYouPage from '../features/onboarding/DesktopThankYouPage'
import DesktopDashboardPlaceholder from '../features/dashboard/DesktopDashboardPlaceholder'
import { ProtectedRoute } from '../../shared/components/ProtectedRoute'
import { ProfileRedirect } from '../../shared/components/ProfileRedirect'

export default function DesktopRoutes() {
  return (
    <Routes>
      <Route path="/inscription" element={<DesktopSignUpPage />} />
      <Route path="/connexion" element={<DesktopSignInPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><ProfileRedirect target="/onboarding"><DesktopOnboardingWizard /></ProfileRedirect></ProtectedRoute>} />
      <Route path="/merci" element={<ProtectedRoute><DesktopThankYouPage /></ProtectedRoute>} />
      <Route path="/tableau-de-bord" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><DesktopDashboardPlaceholder /></ProfileRedirect></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/inscription" replace />} />
    </Routes>
  )
}
