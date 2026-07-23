import { Route, Routes, Navigate } from 'react-router-dom'
import MobileSignInPage from '../features/auth/MobileSignInPage'
import MobileSignUpPage from '../features/auth/MobileSignUpPage'
import MobileOnboardingWizard from '../features/onboarding/MobileOnboardingWizard'
import MobileThankYouPage from '../features/onboarding/MobileThankYouPage'
import MobileDashboardPlaceholder from '../features/dashboard/MobileDashboardPlaceholder'
import { ProtectedRoute } from '../../shared/components/ProtectedRoute'
import { ProfileRedirect } from '../../shared/components/ProfileRedirect'

export default function MobileRoutes() {
  return (
    <Routes>
      <Route path="/inscription" element={<MobileSignUpPage />} />
      <Route path="/connexion" element={<MobileSignInPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><ProfileRedirect target="/onboarding"><MobileOnboardingWizard /></ProfileRedirect></ProtectedRoute>} />
      <Route path="/merci" element={<ProtectedRoute><MobileThankYouPage /></ProtectedRoute>} />
      <Route path="/tableau-de-bord" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><MobileDashboardPlaceholder /></ProfileRedirect></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/inscription" replace />} />
    </Routes>
  )
}
