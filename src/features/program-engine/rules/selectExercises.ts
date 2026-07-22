import type { Exercise, UserEquipment, UserProfile } from './types'

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
