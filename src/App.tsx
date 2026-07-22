import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { SignInPage, SignUpPage } from './features/auth/AuthPages'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { useAuth } from './features/auth/useAuth'
import { OnboardingWizard } from './features/onboarding/OnboardingWizard'

function ThankYouPage() {
  const navigate = useNavigate()
  return <main className="center-page"><section className="message-card"><p className="eyebrow">C'EST PARTI</p><h1>Merci !</h1><p>Ton profil est enregistré, ton programme est en cours de préparation.</p><button onClick={() => navigate('/tableau-de-bord')}>Continuer</button></section></main>
}
function DashboardPlaceholder() { return <main className="center-page"><section className="message-card"><p className="eyebrow">CALLIBRATE</p><h1>Tableau de bord</h1><p>À venir.</p></section></main> }

function App() {
  useAuth()
  return <Routes>
    <Route path="/inscription" element={<SignUpPage />} />
    <Route path="/connexion" element={<SignInPage />} />
    <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
    <Route path="/merci" element={<ProtectedRoute><ThankYouPage /></ProtectedRoute>} />
    <Route path="/tableau-de-bord" element={<ProtectedRoute><DashboardPlaceholder /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/inscription" replace />} />
  </Routes>
}
export default App
