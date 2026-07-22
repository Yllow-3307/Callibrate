import { supabase } from '../../shared/lib/supabaseClient'
import type {
  AvailabilityData,
  CookingPreferencesData,
  EquipmentData,
  FullProfile,
  GoalData,
  ProfileData,
} from './types'

/**
 * Charge le profil complet d'un utilisateur depuis Supabase
 * (données collectées pendant l'onboarding, Phase 1).
 *
 * Lève une erreur explicite si une donnée obligatoire manque :
 * le moteur de règles a besoin du profil, de l'objectif, de l'équipement
 * et des disponibilités pour produire un programme cohérent.
 */
export async function loadFullProfile(userId: string): Promise<FullProfile> {
  const [profiles, goals, equipment, availability, cooking] = await Promise.all([
    supabase.from('profiles').select('age, sexe, poids, taille, niveau_sport').eq('user_id', userId).maybeSingle(),
    supabase
      .from('goals')
      .select('type_objectif, date_creation')
      .eq('user_id', userId)
      .order('date_creation', { ascending: false })
      .limit(1),
    supabase.from('equipment').select('type, details_perso, equipement_endurance').eq('user_id', userId),
    supabase
      .from('availability')
      .select('heure_reveil, heure_travail_debut, heure_travail_fin, heure_coucher, preference_horaire, duree_seance, frequence_semaine')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('cooking_preferences')
      .select('niveau_cuisine, temps_dispo, preferences, allergies, budget, lieu_repas')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const erreurs = [profiles.error, goals.error, equipment.error, availability.error, cooking.error].filter(Boolean)
  if (erreurs.length > 0) {
    throw new Error('Impossible de relire ton profil. Vérifie ta connexion puis réessaie.')
  }
  if (!profiles.data || !goals.data?.[0] || !equipment.data?.length || !availability.data?.[0]) {
    throw new Error('Ton profil est incomplet : certaines réponses du questionnaire sont introuvables.')
  }

  const profile: ProfileData = {
    age: Number(profiles.data.age),
    sexe: profiles.data.sexe,
    poids: Number(profiles.data.poids),
    taille: Number(profiles.data.taille),
    niveau_sport: profiles.data.niveau_sport,
  }
  const goal: GoalData = {
    type_objectif: goals.data[0].type_objectif,
    date_creation: goals.data[0].date_creation,
  }
  const availabilityData: AvailabilityData = availability.data[0]

  return {
    userId,
    profile,
    goal,
    equipment: equipment.data as EquipmentData[],
    availability: availabilityData,
    cooking: (cooking.data as CookingPreferencesData | null) ?? null,
  }
}
