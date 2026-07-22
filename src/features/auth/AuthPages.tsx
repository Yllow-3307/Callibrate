import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../shared/lib/supabaseClient'
import { useAuthStore } from './authStore'
import { Button, CardHeader } from '../../shared/components'
import { ThemeToggle } from '../../shared/components/ThemeToggle'

function readableAuthError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('already registered') || value.includes('already been registered')) return 'Cette adresse e-mail est déjà utilisée.'
  if (value.includes('password') && (value.includes('least') || value.includes('short'))) return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (value.includes('invalid login credentials')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (value.includes('email not confirmed')) return 'Confirme ton adresse e-mail avant de te connecter.'
  return 'Une erreur est survenue. Vérifie tes informations et réessaie.'
}

function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="auth-page">
      <ThemeToggle />
      <motion.section
        className="glass-card auth-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <CardHeader>
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
            CALLIBRATE
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p className="subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22, duration: 0.45 }}>
              {subtitle}
            </motion.p>
          )}
        </CardHeader>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.45 }}>
          {children}
        </motion.div>

        <motion.p className="auth-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}>
          {footer}
        </motion.p>
      </motion.section>

      <div
        aria-hidden
        style={{
          position: 'fixed', bottom: '6%', left: '8%', width: 140, height: 140,
          background: 'radial-gradient(circle, rgba(var(--color-accent-warm-rgb),0.22), transparent 70%)',
          filter: 'blur(18px)', pointerEvents: 'none', zIndex: -1,
        }}
      />
    </main>
  )
}

export function SignUpPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError(''); setInfo('')
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return }
    setSubmitting(true)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    setSubmitting(false)
    if (signUpError) { setError(readableAuthError(signUpError.message)); return }
    if (data.session) { navigate('/onboarding', { replace: true }); return }
    setInfo('Ton compte a été créé. Consulte tes e-mails pour le confirmer, puis connecte-toi.')
  }

  return (
    <AuthLayout
      title="Crée ton compte"
      subtitle="Rejoins Callibrate et commence ton parcours sur-mesure."
      footer={<>Déjà inscrit·e ? <Link to="/connexion">Se connecter</Link></>}
    >
      <form onSubmit={submit} noValidate className="stack-form">
        <div style={{ display: 'grid', gap: 14 }}>
          <label>
            Adresse e-mail
            <input className="input-base" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="toi@exemple.com" />
          </label>
          <label>
            Mot de passe
            <input className="input-base" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" placeholder="••••••••" />
            <small>6 caractères minimum, avec un peu de peps</small>
          </label>
        </div>
        <AnimatePresence mode="wait">
          {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.28 }}>{error}</motion.p>}
          {info && <motion.p className="form-info" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{info}</motion.p>}
        </AnimatePresence>
        <Button type="submit" variant="primary" size="lg" disabled={submitting} isLoading={submitting} style={{ width: '100%', marginTop: 6 }}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </Button>
      </form>
    </AuthLayout>
  )
}

/** Vérifie si l'utilisateur a déjà un profil complet et un programme généré. */
async function hasCompletedProfile(userId: string): Promise<boolean> {
  const [profileResult, programResult] = await Promise.all([
    supabase.from('profiles').select('id').eq('user_id', userId).limit(1).maybeSingle(),
    supabase.from('programs').select('id').eq('user_id', userId).limit(1).maybeSingle(),
  ])
  return Boolean(profileResult.data && programResult.data)
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
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
    <AuthLayout
      title="Bon retour"
      subtitle="Content de te revoir. On reprend là où tu t'étais arrêté·e."
      footer={<>Pas encore de compte ? <Link to="/inscription">S'inscrire</Link></>}
    >
      <form onSubmit={submit} noValidate className="stack-form">
        <div style={{ display: 'grid', gap: 14 }}>
          <label>
            Adresse e-mail
            <input className="input-base" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="toi@exemple.com" />
          </label>
          <label>
            Mot de passe
            <input className="input-base" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" />
          </label>
        </div>
        <AnimatePresence>
          {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}</motion.p>}
        </AnimatePresence>
        <Button type="submit" variant="primary" size="lg" disabled={submitting} isLoading={submitting} style={{ width: '100%', marginTop: 6 }}>
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthLayout>
  )
}
