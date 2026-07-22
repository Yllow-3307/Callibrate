import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { SignInPage, SignUpPage } from './features/auth/AuthPages'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { useAuth } from './features/auth/useAuth'
import { useAuthStore } from './features/auth/authStore'
import { OnboardingWizard } from './features/onboarding/OnboardingWizard'
import { generateAndSaveProgram } from './features/program-engine/generateAndSaveProgram'
import { ThemeToggle } from './shared/components/ThemeToggle'
import { motion } from 'framer-motion'
import { Button } from './shared/components'

/**
 * Écran de transition post-onboarding : lance la génération du programme
 * (moteur de règles déterministe), écrit le résultat en base, puis redirige
 * vers le tableau de bord.
 */
function ThankYouPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [statut, setStatut] = useState<'generation' | 'pret' | 'erreur'>('generation')
  const [messageErreur, setMessageErreur] = useState('')
  const [tentative, setTentative] = useState(0)

  useEffect(() => {
    if (!user) return
    let actif = true
    setStatut('generation')
    setMessageErreur('')

    generateAndSaveProgram(user.id)
      .then(() => {
        if (!actif) return
        setStatut('pret')
      })
      .catch((erreur: unknown) => {
        if (!actif) return
        setStatut('erreur')
        setMessageErreur(erreur instanceof Error ? erreur.message : 'Une erreur est survenue pendant la génération.')
      })

    return () => { actif = false }
  }, [user, tentative])

  useEffect(() => {
    if (statut !== 'pret') return
    const timer = window.setTimeout(() => navigate('/tableau-de-bord', { replace: true }), 1600)
    return () => window.clearTimeout(timer)
  }, [statut, navigate])

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
          {statut === 'generation' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 26,
                height: 26,
                border: '3px solid var(--color-border-strong)',
                borderTopColor: 'rgb(var(--color-accent-rgb))',
                borderRadius: '50%',
              }}
            />
          )}
          {statut !== 'generation' && (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {statut === 'pret' ? <path d="M20 6L9 17l-5-5" /> : <path d="M12 8v5M12 16.5v.5M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />}
            </svg>
          )}
        </motion.div>
        <p className="eyebrow">{statut === 'pret' ? "C'EST PRÊT" : "C'EST PARTI"}</p>
        <h1 className="text-balance" style={{ marginBottom: 12 }}>Merci !</h1>
        {statut === 'generation' && (
          <p className="subtitle" style={{ marginBottom: 28 }}>
            Ton profil est enregistré. On construit ton programme : séances, phases,
            cibles nutritionnelles et hydratation.
            <br />
            <span style={{ color: 'rgb(var(--color-accent-warm-rgb))', fontWeight: 650 }}>On s'occupe du reste.</span>
          </p>
        )}
        {statut === 'pret' && (
          <p className="subtitle" style={{ marginBottom: 28 }}>
            Ton programme est généré et enregistré. Redirection vers ton tableau de bord…
            <br />
            <span style={{ color: 'rgb(var(--color-accent-warm-rgb))', fontWeight: 650 }}>À tout de suite.</span>
          </p>
        )}
        {statut === 'erreur' && (
          <>
            <p className="subtitle" style={{ marginBottom: 12 }}>
              La génération de ton programme n'a pas abouti.
            </p>
            <p className="form-error" role="alert" style={{ marginBottom: 28 }}>{messageErreur}</p>
          </>
        )}
        {statut === 'erreur' && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={() => setTentative((valeur) => valeur + 1)}>
              Réessayer
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/tableau-de-bord')}>
              Continuer sans programme
            </Button>
          </div>
        )}
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
