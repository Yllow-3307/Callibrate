import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '../../../shared/components/ThemeToggle'
import { useAuthStore } from '../../../shared/store/authStore'
import { generateAndSaveProgram } from '../../../features/program-engine/generateAndSaveProgram'
import { Button } from '../../../shared/components/Button'

export default function DesktopThankYouPage() {
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
      .then(() => { if (actif) setStatut('pret') })
      .catch((erreur: unknown) => { if (actif) { setStatut('erreur'); setMessageErreur(erreur instanceof Error ? erreur.message : 'Une erreur est survenue pendant la génération.') } })
    return () => { actif = false }
  }, [user, tentative])

  useEffect(() => {
    if (statut !== 'pret') return
    const timer = window.setTimeout(() => navigate('/tableau-de-bord', { replace: true }), 1600)
    return () => window.clearTimeout(timer)
  }, [statut, navigate])

  return (
    <main className="center-page desktop-thank-you">
      <ThemeToggle />
      <div className="desktop-thank-layout">
        <motion.section className="glass-card message-card desktop-message" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1>Merci !</h1>
          <p>Ton profil est enregistré. On construit ton programme.</p>
          {statut === 'pret' && <p>Redirection vers ton tableau de bord…</p>}
          {statut === 'erreur' && (
            <>
              <p className="form-error">{messageErreur}</p>
              <Button variant="primary" onClick={() => setTentative((t) => t + 1)}>Réessayer</Button>
            </>
          )}
        </motion.section>
      </div>
    </main>
  )
}
