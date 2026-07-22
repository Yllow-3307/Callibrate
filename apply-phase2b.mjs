#!/usr/bin/env node
/**
 * Script d'application des corrections Phase 2b pour Callibrate.
 * Exécuter depuis la racine du projet : node apply-phase2b.mjs
 */
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()

function w(rel, content) {
  const p = join(ROOT, rel)
  mkdirSync(join(p, '..'), { recursive: true })
  writeFileSync(p, content.replace(/\r\n/g, '\n'), 'utf8')
  console.log(`  ✅ ${rel}`)
}

console.log('\n🔧 Application des corrections Phase 2b…\n')

// ─────────────────────────────────────────────
// 1. package.json
// ─────────────────────────────────────────────
console.log('[1] package.json')
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
pkg.scripts = pkg.scripts || {}
pkg.scripts.test = 'vitest run'
pkg.scripts['test:watch'] = 'vitest'
pkg.devDependencies = pkg.devDependencies || {}
pkg.devDependencies['@testing-library/jest-dom'] = '^6.9.1'
pkg.devDependencies['@testing-library/react'] = '^16.3.2'
pkg.devDependencies.jsdom = '^29.1.1'
pkg.devDependencies.vitest = '^4.1.10'
w('package.json', JSON.stringify(pkg, null, 2) + '\n')

// ─────────────────────────────────────────────
// 2. AuthPages.tsx
// ─────────────────────────────────────────────
console.log('[2] src/features/auth/AuthPages.tsx')
w('src/features/auth/AuthPages.tsx', `import { useState, type FormEvent, type ReactNode } from 'react'
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
`)

// ─────────────────────────────────────────────
// 3. OnboardingWizard.tsx
// ─────────────────────────────────────────────
console.log('[3] src/features/onboarding/OnboardingWizard.tsx')
w('src/features/onboarding/OnboardingWizard.tsx', `import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../shared/lib/supabaseClient'
import { useAuthStore } from '../auth/authStore'
import { Button } from '../../shared/components/Button'
import { Progress, StepIndicator } from '../../shared/components/Progress'
import { ThemeToggle } from '../../shared/components/ThemeToggle'

type Indisponibilite = { debut: string; fin: string; label: string }

type FormData = {
  age: string; sexe: string; poids: string; taille: string; niveauSport: string
  objectif: string; equipements: string[]; detailsPerso: string[]; detailsPersoAutre: string; endurance: string[]
  reveil: string; travailDebut: string; travailFin: string; coucher: string; preferenceHoraire: string; duree: string; frequence: string; indisponibilites: Indisponibilite[]
  niveauCuisine: string; tempsCuisine: string; preferences: string; allergies: string; budget: string; petitDejeuner: string; dejeuner: string; diner: string
}
const initialData: FormData = {
  age: '', sexe: '', poids: '', taille: '', niveauSport: '',
  objectif: '', equipements: [], detailsPerso: [], detailsPersoAutre: '', endurance: [],
  reveil: '', travailDebut: '', travailFin: '', coucher: '', preferenceHoraire: '', duree: '', frequence: '', indisponibilites: [],
  niveauCuisine: '', tempsCuisine: '', preferences: '', allergies: '', budget: '', petitDejeuner: '', dejeuner: '', diner: '',
}
const equipmentChoices = ['Salle de sport', 'Parc de street workout', 'Équipement personnel', 'Rien', 'Poids du corps uniquement']
const personalEquipmentOptions = ['Kettlebell', 'Barre de traction', 'Banc', 'Haltères', 'Élastique de résistance']
const enduranceOptions = ['Course à pied', 'Vélo', 'Corde à sauter', 'Rameur', 'Piscine']

function Choice({ value, checked, onChange, children }: { value: string; checked: boolean; onChange: () => void; children: string }) {
  return (
    <motion.label className="choice" data-checked={checked} layout whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} style={{ cursor: 'pointer' }}>
      <input type="checkbox" value={value} checked={checked} onChange={onChange} />
      <span style={{ flex: 1 }}>{children}</span>
      {checked && (
        <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ color: 'rgb(var(--color-accent-rgb))', display: 'grid' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        </motion.span>
      )}
    </motion.label>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label>
      {label}
      <select className="input-base" value={value} onChange={(e) => onChange(e.target.value)} required>
        <option value="">Choisir…</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

export function OnboardingWizard() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState(initialData)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const set = (key: keyof FormData, value: string) => setData((current) => ({ ...current, [key]: value }))
  const validStep = () => {
    if (step === 1) return Boolean(data.age && data.sexe && data.poids && data.taille && data.niveauSport)
    if (step === 2) return Boolean(data.objectif)
    if (step === 3) return data.equipements.length > 0 && data.endurance.length > 0
    if (step === 4) return Boolean(data.reveil && data.travailDebut && data.travailFin && data.coucher && data.preferenceHoraire && data.duree && data.frequence)
    return Boolean(data.niveauCuisine && data.tempsCuisine && data.budget && data.petitDejeuner && data.dejeuner && data.diner)
  }
  function next() { if (!validStep()) { setError('Merci de renseigner tous les champs obligatoires.'); return }; setError(''); setStep((current) => current + 1) }
  function toggleEquipment(value: string) { setData((current) => ({ ...current, equipements: current.equipements.includes(value) ? current.equipements.filter((item) => item !== value) : [...current.equipements, value] })) }
  function togglePersonalEquipment(value: string) { setData((current) => ({ ...current, detailsPerso: current.detailsPerso.includes(value) ? current.detailsPerso.filter((item) => item !== value) : [...current.detailsPerso, value] })) }
  function toggleEndurance(value: string) { setData((current) => ({ ...current, endurance: current.endurance.includes(value) ? current.endurance.filter((item) => item !== value) : [...current.endurance, value] })) }
  function addIndisponibilite() { setData((current) => ({ ...current, indisponibilites: [...current.indisponibilites, { debut: '', fin: '', label: '' }] })) }
  function removeIndisponibilite(index: number) { setData((current) => ({ ...current, indisponibilites: current.indisponibilites.filter((_, i) => i !== index) })) }
  function updateIndisponibilite(index: number, field: keyof Indisponibilite, value: string) {
    setData((current) => ({ ...current, indisponibilites: current.indisponibilites.map((item, i) => i === index ? { ...item, [field]: value } : item) }))
  }

  async function save() {
    if (!validStep()) { setError('Merci de renseigner tous les champs obligatoires.'); return }
    if (!user) return
    setError(''); setSaving(true)
    const user_id = user.id
    const detailsPersoFinal = [...data.detailsPerso]
    if (data.detailsPersoAutre.trim()) detailsPersoFinal.push(data.detailsPersoAutre.trim())
    const indisponibilitesValides = data.indisponibilites.filter((ind) => ind.debut && ind.fin)
    const writes = [
      supabase.from('profiles').upsert({ user_id, age: Number(data.age), sexe: data.sexe, poids: Number(data.poids), taille: Number(data.taille), niveau_sport: data.niveauSport }, { onConflict: 'user_id' }),
      supabase.from('goals').insert({ user_id, type_objectif: data.objectif, date_creation: new Date().toISOString().slice(0, 10) }),
      supabase.from('equipment').insert({ user_id, type: data.equipements, details_perso: detailsPersoFinal, equipement_endurance: data.endurance }),
      supabase.from('availability').insert({ user_id, heure_reveil: data.reveil, heure_travail_debut: data.travailDebut, heure_travail_fin: data.travailFin, heure_coucher: data.coucher, preference_horaire: data.preferenceHoraire, duree_seance: Number(data.duree), frequence_semaine: Number(data.frequence), indisponibilites: indisponibilitesValides }),
      supabase.from('cooking_preferences').upsert({ user_id, niveau_cuisine: data.niveauCuisine, temps_dispo: Number(data.tempsCuisine), preferences: data.preferences || null, allergies: data.allergies || null, budget: data.budget, lieu_repas: { petit_dejeuner: data.petitDejeuner, dejeuner: data.dejeuner, diner: data.diner } }, { onConflict: 'user_id' }),
    ]
    const results = await Promise.all(writes)
    setSaving(false)
    if (results.some(({ error: writeError }) => writeError)) { setError("L'enregistrement a échoué. Tes réponses sont conservées : vérifie ta connexion puis réessaie."); return }
    navigate('/merci', { replace: true })
  }

  return (
    <main className="wizard-page">
      <ThemeToggle />
      <motion.section className="glass-card wizard-card" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}>
        <div style={{ marginBottom: 34 }}>
          <motion.p className="eyebrow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>PERSONNALISATION</motion.p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 }}>
            <div style={{ minWidth: 200, flex: '1 1 260px' }}><Progress current={step} total={5} /></div>
            <StepIndicator current={step} total={5} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 10, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 1.01 }} transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}>
            {step === 1 && (
              <Step title="Parle-nous de toi" subtitle="Ces informations nous aideront à adapter tes futures séances." icon="👋">
                <div className="grid-2">
                  <label>Âge<input className="input-base" type="number" min="12" value={data.age} onChange={(e) => set('age', e.target.value)} placeholder="25" /></label>
                  <SelectField label="Sexe" value={data.sexe} onChange={(v) => set('sexe', v)} options={['Femme', 'Homme', 'Non précisé']} />
                  <label>Poids (kg)<input className="input-base" type="number" min="1" step="0.1" value={data.poids} onChange={(e) => set('poids', e.target.value)} placeholder="70" /></label>
                  <label>Taille (cm)<input className="input-base" type="number" min="50" value={data.taille} onChange={(e) => set('taille', e.target.value)} placeholder="175" /></label>
                </div>
                <SelectField label="Niveau en sport" value={data.niveauSport} onChange={(v) => set('niveauSport', v)} options={['Débutant', 'Intermédiaire', 'Avancé', 'Confirmé']} />
              </Step>
            )}

            {step === 2 && (
              <Step title="Quel est ton objectif ?" subtitle="Choisis l'objectif qui te ressemble le plus." icon="🎯">
                <div className="choice-list">
                  {['Sèche', 'Prise de muscle', 'Affinement musculaire sans prise de poids', 'Travail de figures de callisthénie'].map((item) => (
                    <motion.label key={item} className="choice" data-checked={data.objectif === item} whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}>
                      <input type="radio" name="objectif" checked={data.objectif === item} onChange={() => set('objectif', item)} />
                      <span style={{ flex: 1 }}>{item}</span>
                      {data.objectif === item && <span style={{ color: 'rgb(var(--color-accent-rgb))' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 6L9 17l-5-5" /></svg></span>}
                    </motion.label>
                  ))}
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step title="Ton équipement" subtitle="Tu peux sélectionner plusieurs options." icon="🏋️">
                <div className="choice-list">
                  {equipmentChoices.map((item) => (
                    <Choice key={item} value={item} checked={data.equipements.includes(item)} onChange={() => toggleEquipment(item)}>{item}</Choice>
                  ))}
                </div>
                {data.equipements.includes('Équipement personnel') && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gap: 10 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0 }}>Précise ton équipement personnel :</p>
                    <div className="choice-list">
                      {personalEquipmentOptions.map((item) => (
                        <Choice key={item} value={item} checked={data.detailsPerso.includes(item)} onChange={() => togglePersonalEquipment(item)}>{item}</Choice>
                      ))}
                    </div>
                    <label style={{ marginTop: 4 }}>
                      Autre (optionnel)
                      <input className="input-base" value={data.detailsPersoAutre} onChange={(e) => setData((current) => ({ ...current, detailsPersoAutre: e.target.value }))} placeholder="Précise si besoin…" />
                    </label>
                  </motion.div>
                )}
                <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0 }}>Équipement d'endurance disponible :</p>
                  <div className="choice-list">
                    {enduranceOptions.map((item) => (
                      <Choice key={item} value={item} checked={data.endurance.includes(item)} onChange={() => toggleEndurance(item)}>{item}</Choice>
                    ))}
                  </div>
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step title="Ton rythme de vie" subtitle="Pour faire une place réaliste au sport dans tes journées." icon="⏰">
                <div className="grid-2">
                  <label>Heure de réveil<input className="input-base" type="time" value={data.reveil} onChange={(e) => set('reveil', e.target.value)} /></label>
                  <label>Début du travail<input className="input-base" type="time" value={data.travailDebut} onChange={(e) => set('travailDebut', e.target.value)} /></label>
                  <label>Fin du travail<input className="input-base" type="time" value={data.travailFin} onChange={(e) => set('travailFin', e.target.value)} /></label>
                  <label>Heure de coucher<input className="input-base" type="time" value={data.coucher} onChange={(e) => set('coucher', e.target.value)} /></label>
                </div>
                <SelectField label="Préférence pour le sport" value={data.preferenceHoraire} onChange={(v) => set('preferenceHoraire', v)} options={['Matin', 'Soir', 'Variable selon les jours']} />
                <div className="grid-2">
                  <label>Durée souhaitée (minutes)<input className="input-base" type="number" min="1" value={data.duree} onChange={(e) => set('duree', e.target.value)} placeholder="45" /></label>
                  <label>Séances par semaine<input className="input-base" type="number" min="1" max="7" value={data.frequence} onChange={(e) => set('frequence', e.target.value)} placeholder="4" /></label>
                </div>
                <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-muted)', margin: 0 }}>Indisponibilités dans la journée (optionnel)</p>
                    <Button variant="secondary" size="sm" onClick={addIndisponibilite}>+ Ajouter</Button>
                  </div>
                  <AnimatePresence>
                    {data.indisponibilites.map((ind, index) => (
                      <motion.div key={index} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: 10, alignItems: 'end' }}>
                          <label>Début<input className="input-base" type="time" value={ind.debut} onChange={(e) => updateIndisponibilite(index, 'debut', e.target.value)} /></label>
                          <label>Fin<input className="input-base" type="time" value={ind.fin} onChange={(e) => updateIndisponibilite(index, 'fin', e.target.value)} /></label>
                          <label>Raison (optionnel)<input className="input-base" value={ind.label} onChange={(e) => updateIndisponibilite(index, 'label', e.target.value)} placeholder="Ex. devoirs" /></label>
                          <Button variant="ghost" onClick={() => removeIndisponibilite(index)} style={{ minHeight: 46, color: 'rgb(var(--color-accent-warm-rgb))' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {data.indisponibilites.length === 0 && <p className="caption">Pas d'indisponibilité déclarée. Tu pourras en ajouter plus tard.</p>}
                </div>
              </Step>
            )}

            {step === 5 && (
              <Step title="Côté cuisine" subtitle="Quelques repères pour préparer la partie nutrition." icon="🥗">
                <div className="grid-2">
                  <SelectField label="Niveau en cuisine" value={data.niveauCuisine} onChange={(v) => set('niveauCuisine', v)} options={['Débutant', 'Intermédiaire', 'Avancé', 'Pro']} />
                  <label>Temps par repas (minutes)<input className="input-base" type="number" min="1" value={data.tempsCuisine} onChange={(e) => set('tempsCuisine', e.target.value)} placeholder="20" /></label>
                </div>
                <label>Préférences alimentaires<textarea className="input-base" value={data.preferences} onChange={(e) => set('preferences', e.target.value)} placeholder="Ex. végétarien, sans porc…" /></label>
                <label>Allergies<textarea className="input-base" value={data.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Indique-les si nécessaire" /></label>
                <label>Budget<input className="input-base" value={data.budget} onChange={(e) => set('budget', e.target.value)} placeholder="Ex. serré, moyen, flexible" /></label>
                <div className="grid-3">
                  <SelectField label="Petit-déjeuner" value={data.petitDejeuner} onChange={(v) => set('petitDejeuner', v)} options={['Maison', 'Cantine', 'Restaurant']} />
                  <SelectField label="Déjeuner" value={data.dejeuner} onChange={(v) => set('dejeuner', v)} options={['Maison', 'Cantine', 'Restaurant']} />
                  <SelectField label="Dîner" value={data.diner} onChange={(v) => set('diner', v)} options={['Maison', 'Cantine', 'Restaurant']} />
                </div>
              </Step>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ marginTop: 18 }}>{error}</motion.p>}
        </AnimatePresence>

        <footer className="wizard-actions">
          {step > 1 && (
            <Button variant="secondary" onClick={() => { setError(''); setStep((current) => current - 1) }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Précédent
            </Button>
          )}
          <Button variant={step === 5 ? 'warm' : 'primary'} onClick={step === 5 ? save : next} disabled={saving} isLoading={saving} size="lg">
            {saving ? 'Enregistrement…' : step === 5 ? (<><span style={{ fontSize: '1.1em' }}>🔥</span> Enregistrer mon profil</>) : 'Suivant'}
            {step < 5 && !saving && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
          </Button>
        </footer>
      </motion.section>
    </main>
  )
}

function Step({ title, subtitle, children, icon }: { title: string; subtitle: string; children: ReactNode; icon?: string }) {
  return (
    <div className="step">
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {icon && (
          <motion.div initial={{ scale: 0.8, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
            style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(var(--color-accent-rgb), 0.14)', border: '1px solid rgba(var(--color-accent-rgb),0.20)', display: 'grid', placeItems: 'center', fontSize: '1.2rem', flexShrink: 0, backdropFilter: 'blur(8px)' }}>
            {icon}
          </motion.div>
        )}
        <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.15rem)' }}>{title}</h1>
          <p className="subtitle">{subtitle}</p>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18, duration: 0.4 }} style={{ display: 'grid', gap: 18, marginTop: 16 }}>
        {children}
      </motion.div>
    </div>
  )
}
`)

// ─────────────────────────────────────────────
// 4. index.css — patches ciblés
// ─────────────────────────────────────────────
console.log('[4] src/index.css (patch)')
let css = readFileSync(join(ROOT, 'src/index.css'), 'utf8')

// Fix mobile dans le media query 600px
const mobileFixBlock = `
  /* Fix: step header icon + title overlap on narrow mobile screens */
  .step > div:first-child { gap: 10px !important; }
  .step > div:first-child > div:last-child { overflow-wrap: break-word; word-break: break-word; }
  .step h1 { font-size: 1.3rem !important; line-height: 1.15 !important; }
  .step .subtitle { margin-top: 2px; }
  .step [style*="grid-template-columns: 1fr 1fr 1.5fr"] { grid-template-columns: 1fr !important; }`

if (!css.includes('Fix: step header icon')) {
  // Insérer avant la fermeture du media query 600px
  css = css.replace(
    /(\.wizard-actions \.btn \{\s*width:\s*100%;\s*\})/,
    `$1\n${mobileFixBlock}`
  )
}

// Media query 420px
const css420 = `
/* Fix: step header stacking on very narrow mobile (~390px) */
@media (max-width: 420px) {
  .step > div:first-child { flex-direction: column !important; align-items: center !important; text-align: center; gap: 10px !important; }
  .step h1 { font-size: 1.25rem !important; }
  .step .subtitle { font-size: 0.88rem; text-align: center; }
  .wizard-card { padding: 20px 16px !important; }
}`
if (!css.includes('max-width: 420px')) {
  css = css + '\n' + css420
}

writeFileSync(join(ROOT, 'src/index.css'), css, 'utf8')
console.log('  ✅ src/index.css')

// ─────────────────────────────────────────────
// 5. Migration SQL
// ─────────────────────────────────────────────
console.log('[5] supabase/migrations/0002_add_indisponibilites.sql')
w('supabase/migrations/0002_add_indisponibilites.sql', `-- Migration additive : ajout de la colonne indisponibilites a availability
-- et adaptation des colonnes equipment pour des structures de donnees structurees.

ALTER TABLE public.availability
  ADD COLUMN IF NOT EXISTS indisponibilites jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.equipment
  ALTER COLUMN details_perso TYPE jsonb
  USING CASE WHEN details_perso IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(details_perso) END;

ALTER TABLE public.equipment ALTER COLUMN details_perso SET DEFAULT '[]'::jsonb;

ALTER TABLE public.equipment
  ALTER COLUMN equipement_endurance TYPE jsonb
  USING CASE WHEN equipement_endurance IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(equipement_endurance) END;

ALTER TABLE public.equipment ALTER COLUMN equipement_endurance SET DEFAULT '[]'::jsonb;
`)

// ─────────────────────────────────────────────
// 6. vitest.config.ts
// ─────────────────────────────────────────────
console.log('[6] vitest.config.ts')
w('vitest.config.ts', `import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
`)

// ─────────────────────────────────────────────
// 7. Moteur de règles
// ─────────────────────────────────────────────
console.log('[7] Moteur de règles')

w('src/features/program-engine/rules/types.ts', `/** Types du moteur de regles Callibrate */
export type EquipmentType = 'Salle de sport' | 'Parc de street workout' | 'Équipement personnel' | 'Rien' | 'Poids du corps uniquement'
export type PersonalEquipment = 'Kettlebell' | 'Barre de traction' | 'Banc' | 'Haltères' | 'Élastique de résistance' | string
export type EnduranceEquipment = 'Course à pied' | 'Vélo' | 'Corde à sauter' | 'Rameur' | 'Piscine'
export type Indisponibilite = { debut: string; fin: string; label?: string }
export type UserProfile = { age: number; sexe: string; poids: number; taille: number; niveau_sport: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Confirmé'; objectif: string }
export type UserEquipment = { types: EquipmentType[]; details_perso: PersonalEquipment[]; equipement_endurance: EnduranceEquipment[] }
export type UserAvailability = { heure_reveil: string; heure_travail_debut: string; heure_travail_fin: string; heure_coucher: string; preference_horaire: 'Matin' | 'Soir' | 'Variable selon les jours'; duree_seance: number; frequence_semaine: number; indisponibilites: Indisponibilite[] }
export type Exercise = { id: string; nom: string; categorie: string; equipement_requis: string[]; niveau: string; muscle_cible: string }
export type TimeSlot = { jour: string; heure_debut: string; heure_fin: string; type: 'callisthenie' | 'endurance' }
`)

w('src/features/program-engine/rules/selectExercises.ts', `import type { Exercise, UserEquipment, UserProfile } from './types'

const NIVEAU_ORDER = ['Débutant', 'Intermédiaire', 'Avancé', 'Confirmé'] as const
function niveauIndex(niveau: string): number {
  const idx = NIVEAU_ORDER.indexOf(niveau as (typeof NIVEAU_ORDER)[number])
  return idx === -1 ? 0 : idx
}

export function hasRequiredEquipment(exercise: Exercise, userEquipment: UserEquipment): boolean {
  const requis = exercise.equipement_requis
  if (!requis || requis.length === 0) return true
  const hasFullAccess = userEquipment.types.includes('Salle de sport') || userEquipment.types.includes('Parc de street workout')
  for (const req of requis) {
    const reqLower = req.toLowerCase().trim()
    if (reqLower === 'aucun' || reqLower === 'poids du corps' || reqLower === 'poids du corps uniquement') continue
    if (hasFullAccess) continue
    if (userEquipment.details_perso.some((p) => p.toLowerCase().trim() === reqLower)) continue
    return false
  }
  return true
}

function niveauSuffisant(userNiveau: string, exerciseNiveau: string): boolean {
  return niveauIndex(userNiveau) >= niveauIndex(exerciseNiveau)
}

export function selectExercisesForProfile(exercises: Exercise[], profile: UserProfile, equipment: UserEquipment): Exercise[] {
  return exercises.filter((e) => niveauSuffisant(profile.niveau_sport, e.niveau) && hasRequiredEquipment(e, equipment))
}
`)

w('src/features/program-engine/rules/buildSchedule.ts', `import type { UserAvailability, TimeSlot, Indisponibilite } from './types'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const

export function timeToMinutes(time: string): number { const [h, m] = time.split(':').map(Number); return h * 60 + (m || 0) }
export function minutesToTime(minutes: number): string { return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0') }

function overlapsIndisponibilite(slotStart: number, slotEnd: number, indisponibilites: Indisponibilite[]): boolean {
  for (const ind of indisponibilites) { if (slotStart < timeToMinutes(ind.fin) && timeToMinutes(ind.debut) < slotEnd) return true }
  return false
}

function getCandidateWindows(a: UserAvailability): { start: number; end: number }[] {
  const reveil = timeToMinutes(a.heure_reveil); const td = timeToMinutes(a.heure_travail_debut)
  const tf = timeToMinutes(a.heure_travail_fin); const coucher = timeToMinutes(a.heure_coucher); const d = a.duree_seance
  const w: { start: number; end: number }[] = []
  if (td - reveil >= d) w.push({ start: reveil, end: td })
  if (coucher - tf >= d) w.push({ start: tf, end: coucher })
  if (a.preference_horaire === 'Matin') return w.length > 0 ? [w[0]] : []
  if (a.preference_horaire === 'Soir') return w.length > 1 ? [w[1]] : w.length > 0 ? [w[0]] : []
  return w
}

function findSlotInWindow(ws: number, we: number, d: number, indis: Indisponibilite[]): { start: number; end: number } | null {
  let c = ws
  while (c + d <= we) {
    if (!overlapsIndisponibilite(c, c + d, indis)) return { start: c, end: c + d }
    for (const ind of indis) { const is = timeToMinutes(ind.debut); const ie = timeToMinutes(ind.fin); if (c < ie && is < c + d) { c = ie; break } }
    if (c + d > we) break
  }
  return null
}

export function buildWeeklySchedule(availability: UserAvailability): TimeSlot[] {
  const { frequence_semaine: freq, duree_seance: duree, indisponibilites: indis = [] } = availability
  if (freq <= 0 || duree <= 0) return []
  const windows = getCandidateWindows(availability)
  if (windows.length === 0) return []
  const slots: TimeSlot[] = []; let ji = 0; let wi = 0; let placed = 0
  while (placed < freq && ji < JOURS.length * 2) {
    const slot = findSlotInWindow(windows[wi % windows.length].start, windows[wi % windows.length].end, duree, indis)
    if (slot) {
      slots.push({ jour: JOURS[ji % JOURS.length], heure_debut: minutesToTime(slot.start), heure_fin: minutesToTime(slot.end), type: placed % 2 === 0 ? 'callisthenie' : 'endurance' })
      placed++
    }
    ji++; if (windows.length > 1) wi++
  }
  return slots
}
`)

w('src/features/program-engine/rules/index.ts', `export { selectExercisesForProfile, hasRequiredEquipment } from './selectExercises'
export { buildWeeklySchedule, timeToMinutes, minutesToTime } from './buildSchedule'
export type { UserProfile, UserEquipment, UserAvailability, Exercise, TimeSlot, Indisponibilite, EquipmentType, PersonalEquipment, EnduranceEquipment } from './types'
`)

// ─────────────────────────────────────────────
// 8. Tests unitaires
// ─────────────────────────────────────────────
console.log('[8] Tests unitaires')
w('src/features/program-engine/rules/rules.test.ts', `import { describe, it, expect } from 'vitest'
import { selectExercisesForProfile, hasRequiredEquipment } from './selectExercises'
import { buildWeeklySchedule, timeToMinutes, minutesToTime } from './buildSchedule'
import type { Exercise, UserEquipment, UserProfile, UserAvailability } from './types'

const exercises: Exercise[] = [
  { id: '1', nom: 'Pompes', categorie: 'push', equipement_requis: [], niveau: 'Débutant', muscle_cible: 'pectoraux' },
  { id: '2', nom: 'Tractions', categorie: 'pull', equipement_requis: ['Barre de traction'], niveau: 'Intermédiaire', muscle_cible: 'dorsaux' },
  { id: '3', nom: 'Front lever', categorie: 'figures', equipement_requis: ['Barre de traction'], niveau: 'Avancé', muscle_cible: 'dorsaux' },
  { id: '4', nom: 'Squat bulgare', categorie: 'legs', equipement_requis: ['Banc'], niveau: 'Intermédiaire', muscle_cible: 'quadriceps' },
  { id: '5', nom: 'Swing kettlebell', categorie: 'full', equipement_requis: ['Kettlebell'], niveau: 'Intermédiaire', muscle_cible: 'chainep' },
  { id: '6', nom: 'Curl élastique', categorie: 'arms', equipement_requis: ['Élastique de résistance'], niveau: 'Débutant', muscle_cible: 'biceps' },
  { id: '7', nom: 'Row haltères', categorie: 'pull', equipement_requis: ['Haltères'], niveau: 'Intermédiaire', muscle_cible: 'dorsaux' },
  { id: '8', nom: 'Dev couché', categorie: 'push', equipement_requis: ['Salle de sport'], niveau: 'Avancé', muscle_cible: 'pectoraux' },
  { id: '9', nom: 'Planche', categorie: 'core', equipement_requis: [], niveau: 'Débutant', muscle_cible: 'abdos' },
  { id: '10', nom: 'Muscle-up', categorie: 'figures', equipement_requis: ['Barre de traction'], niveau: 'Confirmé', muscle_cible: 'torse' },
]
const emptyEquip: UserEquipment = { types: ['Rien'], details_perso: [], equipement_endurance: [] }
const salle: UserEquipment = { types: ['Salle de sport'], details_perso: [], equipement_endurance: [] }
const perso: UserEquipment = { types: ['Équipement personnel'], details_perso: ['Barre de traction', 'Haltères'], equipement_endurance: [] }
const parc: UserEquipment = { types: ['Parc de street workout'], details_perso: [], equipement_endurance: [] }
const profile: UserProfile = { age: 25, sexe: 'H', poids: 75, taille: 180, niveau_sport: 'Intermédiaire', objectif: 'Prise de muscle' }
const avail: UserAvailability = { heure_reveil: '07:00', heure_travail_debut: '09:00', heure_travail_fin: '17:00', heure_coucher: '23:00', preference_horaire: 'Soir', duree_seance: 45, frequence_semaine: 4, indisponibilites: [] }

describe('selectExercisesForProfile', () => {
  it('exclut les exercices dont le niveau dépasse celui de l\\'utilisateur', () => {
    const noms = selectExercisesForProfile(exercises, profile, salle).map((e) => e.nom)
    expect(noms).not.toContain('Front lever')
    expect(noms).not.toContain('Muscle-up')
    expect(noms).toContain('Pompes')
  })
  it('inclut tous les exercices pour un Confirmé avec salle', () => {
    expect(selectExercisesForProfile(exercises, { ...profile, niveau_sport: 'Confirmé' }, salle).length).toBe(exercises.length)
  })
  it('ne garde que les exercices sans équipement pour "Rien"', () => {
    const noms = selectExercisesForProfile(exercises, profile, emptyEquip).map((e) => e.nom)
    expect(noms).toContain('Pompes')
    expect(noms).toContain('Planche')
    expect(noms).not.toContain('Tractions')
    expect(noms).not.toContain('Squat bulgare')
  })
  it('inclut les exercices correspondant aux équipements personnels', () => {
    const noms = selectExercisesForProfile(exercises, profile, perso).map((e) => e.nom)
    expect(noms).toContain('Tractions')
    expect(noms).toContain('Row haltères')
    expect(noms).not.toContain('Squat bulgare')
    expect(noms).not.toContain('Swing kettlebell')
  })
  it('inclut tous les exercices avec le parc street workout', () => {
    const noms = selectExercisesForProfile(exercises, profile, parc).map((e) => e.nom)
    expect(noms).toContain('Tractions')
    expect(noms).toContain('Squat bulgare')
    expect(noms).toContain('Swing kettlebell')
  })
})

describe('hasRequiredEquipment', () => {
  it('accepte un exercice sans équipement', () => {
    expect(hasRequiredEquipment({ id: 'x', nom: 'T', categorie: '', equipement_requis: [], niveau: 'Débutant', muscle_cible: '' }, emptyEquip)).toBe(true)
  })
  it('refuse un exercice nécessitant un équipement non possédé', () => {
    expect(hasRequiredEquipment({ id: 'x', nom: 'T', categorie: '', equipement_requis: ['Kettlebell'], niveau: 'Débutant', muscle_cible: '' }, perso)).toBe(false)
  })
  it('accepte quand l\\'utilisateur a la salle', () => {
    expect(hasRequiredEquipment({ id: 'x', nom: 'T', categorie: '', equipement_requis: ['Kettlebell'], niveau: 'Débutant', muscle_cible: '' }, salle)).toBe(true)
  })
})

describe('buildWeeklySchedule', () => {
  it('génère le bon nombre de séances', () => { expect(buildWeeklySchedule(avail).length).toBe(4) })
  it('alterne callisthenie / endurance', () => {
    const slots = buildWeeklySchedule(avail)
    expect(slots[0].type).toBe('callisthenie')
    expect(slots[1].type).toBe('endurance')
  })
  it('place les séances le soir', () => {
    for (const s of buildWeeklySchedule(avail)) { expect(timeToMinutes(s.heure_debut)).toBeGreaterThanOrEqual(timeToMinutes('17:00')) }
  })
  it('place les séances le matin si préférence Matin', () => {
    for (const s of buildWeeklySchedule({ ...avail, preference_horaire: 'Matin' })) { expect(timeToMinutes(s.heure_debut)).toBeLessThan(timeToMinutes('09:00')) }
  })
  it('respecte la durée unique', () => {
    for (const s of buildWeeklySchedule(avail)) { expect(timeToMinutes(s.heure_fin) - timeToMinutes(s.heure_debut)).toBe(45) }
  })
  it('retourne [] si durée 0', () => { expect(buildWeeklySchedule({ ...avail, duree_seance: 0 }).length).toBe(0) })
})

describe('indisponibilités', () => {
  it('exclut un créneau qui tombe dans une plage d\\'indisponibilité', () => {
    const slots = buildWeeklySchedule({ ...avail, indisponibilites: [{ debut: '17:00', fin: '19:00', label: 'Devoirs' }] })
    expect(slots.length).toBe(4)
    for (const s of slots) {
      const start = timeToMinutes(s.heure_debut); const end = timeToMinutes(s.heure_fin)
      expect(start < timeToMinutes('19:00') && timeToMinutes('17:00') < end).toBe(false)
    }
  })
  it('déplace les créneaux après l\\'indisponibilité', () => {
    const slots = buildWeeklySchedule({ ...avail, indisponibilites: [{ debut: '17:00', fin: '18:30' }] })
    for (const s of slots) { expect(timeToMinutes(s.heure_debut)).toBeGreaterThanOrEqual(timeToMinutes('18:30')) }
  })
  it('gère plusieurs indisponibilités', () => {
    const indis = [{ debut: '17:00', fin: '18:00' }, { debut: '19:00', fin: '20:00' }]
    const slots = buildWeeklySchedule({ ...avail, indisponibilites: indis })
    for (const s of slots) {
      for (const ind of indis) {
        expect(timeToMinutes(s.heure_debut) < timeToMinutes(ind.fin) && timeToMinutes(ind.debut) < timeToMinutes(s.heure_fin)).toBe(false)
      }
    }
  })
  it('ne génère pas de séance si toute la plage est indisponible', () => {
    expect(buildWeeklySchedule({ ...avail, indisponibilites: [{ debut: '17:00', fin: '23:00' }] }).length).toBe(0)
  })
  it('utilise la fenêtre matin quand soirée bloquée et préférence Variable', () => {
    const slots = buildWeeklySchedule({ ...avail, preference_horaire: 'Variable selon les jours', indisponibilites: [{ debut: '17:00', fin: '23:00' }] })
    expect(slots.length).toBe(4)
    for (const s of slots) { expect(timeToMinutes(s.heure_debut)).toBeLessThan(timeToMinutes('09:00')) }
  })
})

describe('utilitaires', () => {
  it('timeToMinutes', () => { expect(timeToMinutes('07:30')).toBe(450) })
  it('minutesToTime', () => { expect(minutesToTime(450)).toBe('07:30') })
})
`)

// ─────────────────────────────────────────────
// 9. Supprimer les .gitkeep vides
// ─────────────────────────────────────────────
const { unlinkSync } = await import('fs')
const gitkeeps = [
  'src/features/program-engine/rules/.gitkeep',
  'src/features/program-engine/ai-refinement/.gitkeep',
]
for (const g of gitkeeps) {
  const p = join(ROOT, g)
  if (existsSync(p)) { try { unlinkSync(p); console.log(`[9] Supprimé ${g}`) } catch {} }
}

console.log('\n✅ Tous les fichiers ont été écrits.\n')
console.log('Étapes suivantes :')
console.log('  1. npm install')
console.log('  2. npm run build')
console.log('  3. npm run test')
console.log('')
