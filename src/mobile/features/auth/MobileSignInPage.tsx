import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../shared/lib/supabaseClient'
import { useAuthStore } from '../../../shared/store/authStore'
import { hasCompletedProfile } from '../../../shared/hooks/useProfileStatus'
import MobileAuthLayout from '../../components/MobileAuthLayout'
import { Button } from '../../../shared/components/Button'

function readableAuthError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('already registered') || value.includes('already been registered')) return 'Cette adresse e-mail est déjà utilisée.'
  if (value.includes('password') && (value.includes('least') || value.includes('short'))) return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (value.includes('invalid login credentials')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (value.includes('email not confirmed')) return 'Confirme ton adresse e-mail avant de te connecter.'
  return 'Une erreur est survenue. Vérifie tes informations et réessaie.'
}

export default function MobileSignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    // Redirection via un useEffect asynchrone dans le composant racine ;
    // ici on redirige immédiatement vers l'onboarding si pas de "from"
    const from = (location.state as { from?: string } | null)?.from
    if (from) return <Navigate to={from} replace />
    return <Navigate to="/onboarding" replace />
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSubmitting(true)
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) { setError(readableAuthError(signInError.message)); return }
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
    <MobileAuthLayout
      title="Bon retour"
      subtitle="Content de te revoir. On reprend là où tu t'étais arrêté·e."
      footer={<>Pas encore de compte ? <Link to="/inscription">S'inscrire</Link></>}
    >
      <form onSubmit={submit} noValidate className="stack-form">
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
    </MobileAuthLayout>
  )
}
