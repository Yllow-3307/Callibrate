import { useState, type ReactNode } from 'react'
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
