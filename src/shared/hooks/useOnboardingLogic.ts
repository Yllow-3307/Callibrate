import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'

export type Indisponibilite = { debut: string; fin: string; label: string }

export type FormData = {
  age: string; sexe: string; poids: string; taille: string; niveauSport: string
  objectif: string; equipements: string[]; detailsPerso: string[]; detailsPersoAutre: string; endurance: string[]
  reveil: string; travailDebut: string; travailFin: string; coucher: string; preferenceHoraire: string; duree: string; frequence: string; indisponibilites: Indisponibilite[]
  niveauCuisine: string; tempsCuisine: string; preferences: string; allergies: string; budget: string; petitDejeuner: string; dejeuner: string; diner: string
}

export const initialData: FormData = {
  age: '', sexe: '', poids: '', taille: '', niveauSport: '',
  objectif: '', equipements: [], detailsPerso: [], detailsPersoAutre: '', endurance: [],
  reveil: '', travailDebut: '', travailFin: '', coucher: '', preferenceHoraire: '', duree: '', frequence: '', indisponibilites: [],
  niveauCuisine: '', tempsCuisine: '', preferences: '', allergies: '', budget: '', petitDejeuner: '', dejeuner: '', diner: '',
}

export const equipmentChoices = ['Salle de sport', 'Parc de street workout', 'Équipement personnel', 'Rien', 'Poids du corps uniquement']
export const personalEquipmentOptions = ['Kettlebell', 'Barre de traction', 'Banc', 'Haltères', 'Élastique de résistance']
export const enduranceOptions = ['Course à pied', 'Vélo', 'Corde à sauter', 'Rameur', 'Piscine']

export function useOnboardingLogic() {
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
  function prev() { setError(''); setStep((current) => current - 1) }

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

  return {
    step, data, error, saving,
    set, validStep, next, prev, save,
    toggleEquipment, togglePersonalEquipment, toggleEndurance,
    addIndisponibilite, removeIndisponibilite, updateIndisponibilite,
  }
}
