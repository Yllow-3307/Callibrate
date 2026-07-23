import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../shared/lib/supabaseClient'
import { useAuthStore } from '../../../shared/store/authStore'
import { hasCompletedProfile } from '../../../shared/hooks/useProfileStatus'
import DesktopAuthLayout from '../../components/DesktopAuthLayout'
import { Button } from '../../../shared/components/Button'

function readableAuthError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('already registered') || value.includes('already been registered')) return 'Cette adresse e-mail est déjà utilisée.'
  if (value.includes('password') && (value.includes('least') || value.includes('short'))) return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (value.includes('invalid login credentials')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (value.includes('email not confirmed')) return 'Confirme ton adresse e-mail avant de te connecter.'
  return 'Une erreur est survenue. Vérifie tes informations et réessaie.'
}

function PageLoader() {
  return (
    <div className="page-loader">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid var(--color-border-strong)', borderTopColor: 'rgb(var(--color-accent-rgb))', borderRadius: '50%' }} />
        Chargement…
      </motion.div>
    </div>
  )
}

export default function DesktopSignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Quand une session devient active (rafraîchissement de page, retour
  // d'onglet, ou mise à jour du store pendant submit), on redirige
  // intelligemment en interrogeant Supabase. Cela remplace l'ancien
  // "if (user) return <Navigate to=/onboarding />" qui court-circuitait
  // ProfileRedirect et renvoyait aveuglément vers l'onboarding.
  useEffect(() => {
    if (loading || !user) return
    const from = (location.state as { from?: string } | null)?.from
    if (from) { navigate(from, { replace: true }); return }
    let active = true
    hasCompletedProfile(user.id).then((complete) => {
      if (active) navigate(complete ? '/tableau-de-bord' : '/onboarding', { replace: true })
    })
    return () => { active = false }
  }, [user, loading, location.state, navigate])

  // Pendant l'initialisation de la session ou quand une redirection est en
  // cours, on affiche un loader plutôt que le formulaire.
  if (loading || user) {
    return (
      <main className="auth-page desktop-auth">
        <PageLoader />
      </main>
    )
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSubmitting(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setSubmitting(false)
      setError(readableAuthError(signInError.message))
      return
    }
    const from = (location.state as { from?: string } | null)?.from
    if (from) { navigate(from, { replace: true }); return }
    if (data.user) {
      const complete = await hasCompletedProfile(data.user.id)
      navigate(complete ? '/tableau-de-bord' : '/onboarding', { replace: true })
      return
    }
    navigate('/onboarding', { replace: true })
  }

  return (
    <DesktopAuthLayout
      title="Bon retour"
      subtitle="Content de te revoir. On reprend là où tu t'étais arrêté·e."
      footer={<>Pas encore de compte ? <Link to="/inscription">S'inscrire</Link></>}
    >
      <form onSubmit={submit} noValidate className="stack-form desktop-form">
        <label>Adresse e-mail
          <input className="input-base" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="toi@exemple.com" />
        </label>
        <label>Mot de passe
          <input className="input-base" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
        </label>
        <AnimatePresence>
          {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{error}</motion.p>}
        </AnimatePresence>
        <Button type="submit" variant="primary" size="lg" disabled={submitting} isLoading={submitting} style={{ width: '100%', marginTop: 6 }}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </DesktopAuthLayout>
  )
}
