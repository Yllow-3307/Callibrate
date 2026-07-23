import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '../../../shared/components/ThemeToggle'
import { Button } from '../../../shared/components/Button'

export default function DesktopDashboardPlaceholder() {
  const navigate = useNavigate()
  return (
    <main className="center-page desktop-dashboard">
      <ThemeToggle />
      <div className="desktop-dashboard-grid">
        <aside className="desktop-sidebar">
          <h2>Tableau de bord</h2>
          <p>À venir. Ton espace d'entraînement et de suivi arrive bientôt.</p>
        </aside>
        <motion.section className="glass-card message-card desktop-message" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1>Tableau de bord</h1>
          <p>À venir. Ton espace d'entraînement et de suivi arrive bientôt.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => navigate('/onboarding')}>Revoir mon onboarding</Button>
            <Button variant="primary" onClick={() => navigate('/merci')}>Voir la page merci</Button>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
