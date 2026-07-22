import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../shared/lib/supabaseClient'
import { useAuthStore } from '../auth/authStore'

type FormData = {
  age: string; sexe: string; poids: string; taille: string; niveauSport: string
  objectif: string; equipements: string[]; detailsPerso: string; endurance: string
  reveil: string; travailDebut: string; travailFin: string; coucher: string; preferenceHoraire: string; duree: string; frequence: string
  niveauCuisine: string; tempsCuisine: string; preferences: string; allergies: string; budget: string; petitDejeuner: string; dejeuner: string; diner: string
}
const initialData: FormData = { age: '', sexe: '', poids: '', taille: '', niveauSport: '', objectif: '', equipements: [], detailsPerso: '', endurance: '', reveil: '', travailDebut: '', travailFin: '', coucher: '', preferenceHoraire: '', duree: '', frequence: '', niveauCuisine: '', tempsCuisine: '', preferences: '', allergies: '', budget: '', petitDejeuner: '', dejeuner: '', diner: '' }
const equipmentChoices = ['Salle de sport', 'Parc de street workout', 'Équipement personnel', 'Rien', 'Poids du corps uniquement']

function Choice({ value, checked, onChange, children }: { value: string; checked: boolean; onChange: () => void; children: string }) {
  return <label className="choice"><input type="checkbox" value={value} checked={checked} onChange={onChange} />{children}</label>
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)} required><option value="">Choisir…</option>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
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
    if (step === 3) return data.equipements.length > 0 && Boolean(data.endurance)
    if (step === 4) return Boolean(data.reveil && data.travailDebut && data.travailFin && data.coucher && data.preferenceHoraire && data.duree && data.frequence)
    return Boolean(data.niveauCuisine && data.tempsCuisine && data.budget && data.petitDejeuner && data.dejeuner && data.diner)
  }
  function next() { if (!validStep()) { setError('Merci de renseigner tous les champs obligatoires.'); return }; setError(''); setStep((current) => current + 1) }
  function toggleEquipment(value: string) { setData((current) => ({ ...current, equipements: current.equipements.includes(value) ? current.equipements.filter((item) => item !== value) : [...current.equipements, value] })) }

  async function save() {
    if (!validStep()) { setError('Merci de renseigner tous les champs obligatoires.'); return }
    if (!user) return
    setError(''); setSaving(true)
    const user_id = user.id
    const writes = [
      supabase.from('profiles').upsert({ user_id, age: Number(data.age), sexe: data.sexe, poids: Number(data.poids), taille: Number(data.taille), niveau_sport: data.niveauSport }, { onConflict: 'user_id' }),
      supabase.from('goals').insert({ user_id, type_objectif: data.objectif, date_creation: new Date().toISOString().slice(0, 10) }),
      supabase.from('equipment').insert(data.equipements.map((type) => ({ user_id, type, details_perso: type === 'Équipement personnel' ? data.detailsPerso : null, equipement_endurance: data.endurance }))),
      supabase.from('availability').insert({ user_id, heure_reveil: data.reveil, heure_travail_debut: data.travailDebut, heure_travail_fin: data.travailFin, heure_coucher: data.coucher, preference_horaire: data.preferenceHoraire, duree_seance: Number(data.duree), frequence_semaine: Number(data.frequence) }),
      supabase.from('cooking_preferences').upsert({ user_id, niveau_cuisine: data.niveauCuisine, temps_dispo: Number(data.tempsCuisine), preferences: data.preferences || null, allergies: data.allergies || null, budget: data.budget, lieu_repas: { petit_dejeuner: data.petitDejeuner, dejeuner: data.dejeuner, diner: data.diner } }, { onConflict: 'user_id' }),
    ]
    const results = await Promise.all(writes)
    setSaving(false)
    if (results.some(({ error: writeError }) => writeError)) { setError("L'enregistrement a échoué. Tes réponses sont conservées : vérifie ta connexion puis réessaie."); return }
    navigate('/merci', { replace: true })
  }

  return <main className="wizard-page"><section className="wizard-card"><p className="eyebrow">PERSONNALISATION</p><div className="progress"><span>Étape {step} sur 5</span><div><i style={{ width: `${step * 20}%` }} /></div></div>
    {step === 1 && <Step title="Parle-nous de toi" subtitle="Ces informations nous aideront à adapter tes futures séances."><div className="grid-2"><label>Âge<input type="number" min="12" value={data.age} onChange={(e) => set('age', e.target.value)} /></label><Select label="Sexe" value={data.sexe} onChange={(v) => set('sexe', v)} options={['Femme', 'Homme', 'Non précisé']} /><label>Poids (kg)<input type="number" min="1" step="0.1" value={data.poids} onChange={(e) => set('poids', e.target.value)} /></label><label>Taille (cm)<input type="number" min="50" value={data.taille} onChange={(e) => set('taille', e.target.value)} /></label></div><Select label="Niveau en sport" value={data.niveauSport} onChange={(v) => set('niveauSport', v)} options={['Débutant', 'Intermédiaire', 'Avancé', 'Confirmé']} /></Step>}
    {step === 2 && <Step title="Quel est ton objectif ?" subtitle="Choisis l'objectif qui te ressemble le plus."><div className="choice-list">{['Sèche', 'Prise de muscle', 'Affinement musculaire sans prise de poids', 'Travail de figures de callisthénie'].map((item) => <label className="choice" key={item}><input type="radio" name="objectif" checked={data.objectif === item} onChange={() => set('objectif', item)} />{item}</label>)}</div></Step>}
    {step === 3 && <Step title="Ton équipement" subtitle="Tu peux sélectionner plusieurs options."><div className="choice-list">{equipmentChoices.map((item) => <Choice key={item} value={item} checked={data.equipements.includes(item)} onChange={() => toggleEquipment(item)}>{item}</Choice>)}</div>{data.equipements.includes('Équipement personnel') && <label>Précise ton équipement personnel<input value={data.detailsPerso} onChange={(e) => set('detailsPerso', e.target.value)} placeholder="Ex. haltères, élastiques…" /></label>}<Select label="Équipement d'endurance disponible" value={data.endurance} onChange={(v) => set('endurance', v)} options={['Course à pied', 'Vélo', 'Corde à sauter', 'Aucun', 'Autre']} /></Step>}
    {step === 4 && <Step title="Ton rythme de vie" subtitle="Pour faire une place réaliste au sport dans tes journées."><div className="grid-2"><label>Heure de réveil<input type="time" value={data.reveil} onChange={(e) => set('reveil', e.target.value)} /></label><label>Début du travail<input type="time" value={data.travailDebut} onChange={(e) => set('travailDebut', e.target.value)} /></label><label>Fin du travail<input type="time" value={data.travailFin} onChange={(e) => set('travailFin', e.target.value)} /></label><label>Heure de coucher<input type="time" value={data.coucher} onChange={(e) => set('coucher', e.target.value)} /></label></div><Select label="Préférence pour le sport" value={data.preferenceHoraire} onChange={(v) => set('preferenceHoraire', v)} options={['Matin', 'Soir', 'Variable selon les jours']} /><div className="grid-2"><label>Durée souhaitée (minutes)<input type="number" min="1" value={data.duree} onChange={(e) => set('duree', e.target.value)} /></label><label>Séances par semaine<input type="number" min="1" max="7" value={data.frequence} onChange={(e) => set('frequence', e.target.value)} /></label></div></Step>}
    {step === 5 && <Step title="Côté cuisine" subtitle="Quelques repères pour préparer la partie nutrition."><div className="grid-2"><Select label="Niveau en cuisine" value={data.niveauCuisine} onChange={(v) => set('niveauCuisine', v)} options={['Débutant', 'Intermédiaire', 'Avancé', 'Pro']} /><label>Temps par repas (minutes)<input type="number" min="1" value={data.tempsCuisine} onChange={(e) => set('tempsCuisine', e.target.value)} /></label></div><label>Préférences alimentaires<textarea value={data.preferences} onChange={(e) => set('preferences', e.target.value)} placeholder="Ex. végétarien, sans porc…" /></label><label>Allergies<textarea value={data.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Indique-les si nécessaire" /></label><label>Budget<input value={data.budget} onChange={(e) => set('budget', e.target.value)} placeholder="Ex. serré, moyen, flexible" /></label><div className="grid-3"><Select label="Petit-déjeuner" value={data.petitDejeuner} onChange={(v) => set('petitDejeuner', v)} options={['Maison', 'Cantine', 'Restaurant']} /><Select label="Déjeuner" value={data.dejeuner} onChange={(v) => set('dejeuner', v)} options={['Maison', 'Cantine', 'Restaurant']} /><Select label="Dîner" value={data.diner} onChange={(v) => set('diner', v)} options={['Maison', 'Cantine', 'Restaurant']} /></div></Step>}
    {error && <p className="form-error" role="alert">{error}</p>}<footer className="wizard-actions">{step > 1 && <button className="secondary" onClick={() => { setError(''); setStep((current) => current - 1) }}>Précédent</button>}<button onClick={step === 5 ? save : next} disabled={saving}>{saving ? 'Enregistrement…' : step === 5 ? 'Enregistrer mon profil' : 'Suivant'}</button></footer>
  </section></main>
}
function Step({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <div className="step"><h1>{title}</h1><p className="subtitle">{subtitle}</p>{children}</div> }
