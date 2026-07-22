import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { SignInPage, SignUpPage } from './features/auth/AuthPages'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { useAuth } from './features/auth/useAuth'
import { OnboardingWizard } from './features/onboarding/OnboardingWizard'
import { ThemeToggle } from './shared/components/ThemeToggle'
import { motion } from 'framer-motion'
import { Button } from './shared/components'

function ThankYouPage() {
  const navigate = useNavigate()
  return (
    <main className="center-page">
      <ThemeToggle />
      <motion.section
        className="glass-card message-card"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(var(--color-accent-rgb), 0.14)',
            border: '1px solid rgba(var(--color-accent-rgb), 0.28)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 22px',
            color: 'rgb(var(--color-accent-rgb))',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>
        <p className="eyebrow">C'EST PARTI</p>
        <h1 className="text-balance" style={{ marginBottom: 12 }}>Merci !</h1>
        <p className="subtitle" style={{ marginBottom: 28 }}>
          Ton profil est enregistré, ton programme est en cours de préparation.
          <br />
          <span style={{ color: 'rgb(var(--color-accent-warm-rgb))', fontWeight: 650 }}>On s'occupe du reste.</span>
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/tableau-de-bord')}>
          Continuer
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </motion.section>
    </main>
  )
}

function DashboardPlaceholder() {
  const navigate = useNavigate()
  return (
    <main className="center-page">
      <ThemeToggle />
      <motion.section
        className="glass-card message-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="eyebrow">CALLIBRATE</p>
        <h1>Tableau de bord</h1>
        <p className="subtitle" style={{ margin: '12px 0 28px' }}>
          À venir. Ton espace d'entraînement et de suivi arrive bientôt.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => navigate('/onboarding')}>
            Revoir mon onboarding
          </Button>
          <Button variant="primary" onClick={() => navigate('/merci')}>
            Voir la page merci
          </Button>
        </div>
      </motion.section>
    </main>
  )
}

function App() {
  useAuth()
  return (
    <>
      <Routes>
        <Route path="/inscription" element={<SignUpPage />} />
        <Route path="/connexion" element={<SignInPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingWizard /></ProtectedRoute>} />
        <Route path="/merci" element={<ProtectedRoute><ThankYouPage /></ProtectedRoute>} />
        <Route path="/tableau-de-bord" element={<ProtectedRoute><DashboardPlaceholder /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/inscription" replace />} />
      </Routes>
    </>
  )
}

export default App
