import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '../../../shared/components/ThemeToggle'
import { Button } from '../../../shared/components/Button'

export default function MobileDashboardPlaceholder() {
  const navigate = useNavigate()
  return (
    <main className="center-page mobile-dashboard">
      <ThemeToggle />
      <motion.section className="glass-card message-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h1>Tableau de bord</h1>
        <p>À venir. Ton espace d'entraînement et de suivi arrive bientôt.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => navigate('/onboarding')}>Revoir mon onboarding</Button>
          <Button variant="primary" onClick={() => navigate('/merci')}>Voir la page merci</Button>
        </div>
      </motion.section>
    </main>
  )
}
