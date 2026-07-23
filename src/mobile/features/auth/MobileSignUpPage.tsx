import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../shared/lib/supabaseClient'
import MobileAuthLayout from '../../components/MobileAuthLayout'
import { Button } from '../../../shared/components/Button'

function readableAuthError(message: string) {
  const value = message.toLowerCase()
  if (value.includes('already registered') || value.includes('already been registered')) return 'Cette adresse e-mail est déjà utilisée.'
  if (value.includes('password') && (value.includes('least') || value.includes('short'))) return 'Le mot de passe doit contenir au moins 6 caractères.'
  return 'Une erreur est survenue. Vérifie tes informations et réessaie.'
}

export default function MobileSignUpPage() {
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
    <MobileAuthLayout
      title="Crée ton compte"
      subtitle="Rejoins Callibrate et commence ton parcours sur-mesure."
      footer={<>Déjà inscrit·e ? <Link to="/connexion">Se connecter</Link></>}
    >
      <form onSubmit={submit} noValidate className="stack-form">
        <label>Adresse e-mail
          <input className="input-base" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="toi@exemple.com" />
        </label>
        <label>Mot de passe
          <input className="input-base" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" placeholder="••••••••" />
          <small>6 caractères minimum, avec un peu de peps</small>
        </label>
        <AnimatePresence mode="wait">
          {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{error}</motion.p>}
          {info && <motion.p className="form-info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{info}</motion.p>}
        </AnimatePresence>
        <Button type="submit" variant="primary" size="lg" disabled={submitting} isLoading={submitting} style={{ width: '100%', marginTop: 6 }}>
          {submitting ? 'Création…' : 'Créer mon compte'}
        </Button>
      </form>
    </MobileAuthLayout>
  )
}
