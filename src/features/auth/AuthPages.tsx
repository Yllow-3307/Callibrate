import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../shared/lib/supabaseClient'
import { useAuthStore } from './authStore'

function readableAuthError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('already registered') || value.includes('already been registered')) return 'Cette adresse e-mail est déjà utilisée.'
  if (value.includes('password') && (value.includes('least') || value.includes('short'))) return 'Le mot de passe doit contenir au moins 6 caractères.'
  if (value.includes('invalid login credentials')) return 'Adresse e-mail ou mot de passe incorrect.'
  if (value.includes('email not confirmed')) return 'Confirme ton adresse e-mail avant de te connecter.'
  return 'Une erreur est survenue. Vérifie tes informations et réessaie.'
}

function AuthLayout({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">CALLIBRATE</p><h1>{title}</h1>{children}<p className="auth-footer">{footer}</p></section></main>
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

  return <AuthLayout title="Crée ton compte" footer={<>Déjà inscrit·e ? <Link to="/connexion">Se connecter</Link></>}>
    <form onSubmit={submit} noValidate className="stack-form">
      <label>Adresse e-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
      <label>Mot de passe<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" /><small>6 caractères minimum</small></label>
      {error && <p className="form-error" role="alert">{error}</p>}{info && <p className="form-info">{info}</p>}
      <button disabled={submitting}>{submitting ? 'Création…' : 'Créer mon compte'}</button>
    </form>
  </AuthLayout>
}

export function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (user) return <Navigate to={(location.state as { from?: string } | null)?.from || '/onboarding'} replace />

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)
    if (signInError) { setError(readableAuthError(signInError.message)); return }
    navigate((location.state as { from?: string } | null)?.from || '/onboarding', { replace: true })
  }

  return <AuthLayout title="Bon retour" footer={<>Pas encore de compte ? <Link to="/inscription">S'inscrire</Link></>}>
    <form onSubmit={submit} noValidate className="stack-form">
      <label>Adresse e-mail<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
      <label>Mot de passe<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button disabled={submitting}>{submitting ? 'Connexion…' : 'Se connecter'}</button>
    </form>
  </AuthLayout>
}
