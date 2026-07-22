import type { NutritionTargets, NiveauSport, ProfileData, Sexe, TypeObjectif } from '../types'

/**
 * Calculs nutritionnels et hydratation.
 * Règles pures : aucune dépendance à React ou Supabase.
 *
 * Les résultats de ces fonctions sont écrits dans la table nutrition_targets
 * (colonnes macros_cibles / hydratation_cible) au moment de la génération
 * du programme — voir persistence.ts.
 */

/**
 * Métabolisme de base (kcal/jour) — formule de Mifflin-St Jeor.
 *
 * - Homme : 10 × poids + 6,25 × taille − 5 × âge + 5
 * - Femme : 10 × poids + 6,25 × taille − 5 × âge − 161
 * - « Non précisé » : moyenne des deux constantes (−78).
 */
export function calculateBMR(age: number, sexe: Sexe, poids: number, taille: number): number {
  const base = 10 * poids + 6.25 * taille - 5 * age
  const constante = sexe === 'Homme' ? 5 : sexe === 'Femme' ? -161 : -78
  return Math.round(base + constante)
}

/**
 * Facteur d'activité déduit du niveau sportif déclaré (onboarding étape 1) :
 * c'est la seule donnée d'activité disponible à ce stade du produit.
 */
const FACTEURS_ACTIVITE: Record<NiveauSport, number> = {
  Débutant: 1.4,
  Intermédiaire: 1.55,
  Avancé: 1.65,
  Confirmé: 1.75,
}

/** Dépense énergétique totale journalière (kcal/jour). */
export function calculateTDEE(bmr: number, niveauActivite: NiveauSport): number {
  return Math.round(bmr * FACTEURS_ACTIVITE[niveauActivite])
}

/** Ajustement calorique de l'objectif, appliqué à la TDEE. */
const AJUSTEMENT_CALORIQUE: Record<TypeObjectif, number> = {
  'Sèche': -0.20, // déficit modéré : −20 %
  'Prise de muscle': 0.10, // surplus modéré : +10 %
  'Affinement musculaire sans prise de poids': 0, // maintenance
  'Travail de figures de callisthénie': 0.05, // léger surplus pour soutenir la force
}

/** Répartition en % des calories : protéines / glucides / lipides. */
const REPARTITION_MACROS: Record<TypeObjectif, { proteines: number; glucides: number; lipides: number }> = {
  // Protéines élevées dans tous les cas ; la sèche les maximise (satiété + muscle).
  'Sèche': { proteines: 0.35, glucides: 0.35, lipides: 0.30 },
  'Prise de muscle': { proteines: 0.30, glucides: 0.45, lipides: 0.25 },
  'Affinement musculaire sans prise de poids': { proteines: 0.30, glucides: 0.40, lipides: 0.30 },
  'Travail de figures de callisthénie': { proteines: 0.30, glucides: 0.45, lipides: 0.25 },
}

const KCAL_PAR_GRAME = { proteines: 4, glucides: 4, lipides: 9 } as const

/**
 * Cibles caloriques et macronutriments (en grammes/jour) selon l'objectif.
 *
 * - Sèche → déficit modéré, protéines élevées.
 * - Prise de muscle → surplus modéré, glucides élevés pour performance.
 * - Affinement → maintenance, répartition équilibrée.
 * - Figures → léger surplus, glucides élevés (travail de force).
 */
export function calculateMacroTargets(
  tdee: number,
  goal: TypeObjectif,
): Omit<NutritionTargets, 'hydratation_ml'> {
  const calories = Math.round(tdee * (1 + AJUSTEMENT_CALORIQUE[goal]))
  const repartition = REPARTITION_MACROS[goal]
  return {
    calories,
    proteines_g: Math.round((calories * repartition.proteines) / KCAL_PAR_GRAME.proteines),
    glucides_g: Math.round((calories * repartition.glucides) / KCAL_PAR_GRAME.glucides),
    lipides_g: Math.round((calories * repartition.lipides) / KCAL_PAR_GRAME.lipides),
  }
}

/** Bonus d'hydratation lié à l'activité (ml/jour), ajouté à la base de 35 ml/kg. */
const BONUS_HYDRATATION: Record<NiveauSport, number> = {
  Débutant: 250,
  Intermédiaire: 500,
  Avancé: 750,
  Confirmé: 1000,
}

/**
 * Cible d'hydratation quotidienne (ml/jour).
 * Formule standard : ~35 ml par kg de poids de corps, ajustée au niveau
 * d'activité (les séances régulières augmentent les pertes hydriques).
 */
export function calculateHydrationTarget(poids: number, niveauActivite: NiveauSport): number {
  return Math.round(poids * 35 + BONUS_HYDRATATION[niveauActivite])
}

/**
 * Orchestre les calculs pour un profil complet : BMR → TDEE → macros + hydratation.
 * C'est cette structure qui est persistée dans nutrition_targets.
 */
export function buildNutritionTargets(profile: ProfileData, goal: TypeObjectif): NutritionTargets {
  const bmr = calculateBMR(profile.age, profile.sexe, profile.poids, profile.taille)
  const tdee = calculateTDEE(bmr, profile.niveau_sport)
  const macros = calculateMacroTargets(tdee, goal)
  const hydratation_ml = calculateHydrationTarget(profile.poids, profile.niveau_sport)
  return { ...macros, hydratation_ml }
}
