import { Route, Routes, Navigate } from 'react-router-dom'
import MobileSignInPage from '../features/auth/MobileSignInPage'
import MobileSignUpPage from '../features/auth/MobileSignUpPage'
import MobileOnboardingWizard from '../features/onboarding/MobileOnboardingWizard'
import MobileThankYouPage from '../features/onboarding/MobileThankYouPage'
import MobileDashboardPlaceholder from '../features/dashboard/MobileDashboardPlaceholder'
import { MobileSettingsPage } from '../features/dashboard/MobileSettingsPage'
import { MobilePlaceholderPage } from '../components/MobilePlaceholderPage'
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

      {/* Nouvelles routes pour l'application mobile une fois connecté */}
      <Route path="/seances" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><MobilePlaceholderPage title="Séances" description="Retrouve ici tes séances quotidiennes personnalisées, tes exercices et le chronomètre." /></ProfileRedirect></ProtectedRoute>} />
      <Route path="/nutrition" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><MobilePlaceholderPage title="Nutrition" description="Suis tes macronutriments, ton plan alimentaire et accède à des recettes saines adaptées à ton profil." /></ProfileRedirect></ProtectedRoute>} />
      <Route path="/programme" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><MobilePlaceholderPage title="Programme" description="Consulte ton plan d'entraînement sur le long terme et ta planification hebdomadaire." /></ProfileRedirect></ProtectedRoute>} />
      <Route path="/progres" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><MobilePlaceholderPage title="Progrès" description="Visualise tes performances, ton historique d'entraînements et tes records personnels." /></ProfileRedirect></ProtectedRoute>} />
      <Route path="/mesures" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><MobilePlaceholderPage title="Mesures" description="Suis l'évolution de ton poids, de tes mensurations et tes photos de progression." /></ProfileRedirect></ProtectedRoute>} />
      <Route path="/parametres" element={<ProtectedRoute><ProfileRedirect target="/tableau-de-bord"><MobileSettingsPage /></ProfileRedirect></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/inscription" replace />} />
    </Routes>
  )
}
