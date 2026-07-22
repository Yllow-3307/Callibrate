/**
 * Types partagés du moteur de programme.
 *
 * Aucune dépendance à React ou Supabase : ces structures sont utilisables
 * dans les règles pures (rules/) comme dans la persistance (persistence.ts).
 *
 * IMPORTANT : les libellés `EquipmentType`, `EnduranceEquipment`, `TypeObjectif`,
 * `NiveauSport`, `PreferenceHoraire` reprennent exactement les valeurs saisies
 * pendant l'onboarding (features/onboarding/OnboardingWizard.tsx) afin de
 * rester alignés avec ce qui est réellement stocké en base.
 */

/** Valeurs possibles de profiles.sexe (onboarding, étape 1). */
export type Sexe = 'Femme' | 'Homme' | 'Non précisé'

/** Valeurs possibles de profiles.niveau_sport (onboarding, étape 1). */
export type NiveauSport = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Confirmé'

/** Valeurs possibles de goals.type_objectif (onboarding, étape 2). */
export type TypeObjectif =
  | 'Sèche'
  | 'Prise de muscle'
  | 'Affinement musculaire sans prise de poids'
  | 'Travail de figures de callisthénie'

/** Valeurs possibles de equipment.type (onboarding, étape 3, multi-sélection). */
export type EquipmentType =
  | 'Salle de sport'
  | 'Parc de street workout'
  | 'Équipement personnel'
  | 'Rien'
  | 'Poids du corps uniquement'

/** Valeurs possibles de equipment.equipement_endurance (onboarding, étape 3). */
export type EnduranceEquipment =
  | 'Course à pied'
  | 'Vélo'
  | 'Corde à sauter'
  | 'Aucun'
  | 'Autre'

/** Valeurs possibles de availability.preference_horaire (onboarding, étape 4). */
export type PreferenceHoraire = 'Matin' | 'Soir' | 'Variable selon les jours'

/** Valeurs autorisées par la contrainte CHECK de sessions.type. */
export type SessionType = 'callisthenie' | 'endurance'

/* ------------------------------------------------------------------ */
/* Données du profil utilisateur, telles que lues depuis Supabase      */
/* ------------------------------------------------------------------ */

export interface ProfileData {
  age: number
  sexe: Sexe
  poids: number
  taille: number
  niveau_sport: NiveauSport
}

export interface GoalData {
  type_objectif: TypeObjectif
  date_creation: string
}

export interface EquipmentData {
  type: EquipmentType
  details_perso: string | null
  equipement_endurance: EnduranceEquipment | null
}

export interface AvailabilityData {
  heure_reveil: string
  heure_travail_debut: string
  heure_travail_fin: string
  heure_coucher: string
  preference_horaire: PreferenceHoraire
  duree_seance: number
  frequence_semaine: number
}

export interface CookingPreferencesData {
  niveau_cuisine: string | null
  temps_dispo: number | null
  preferences: string | null
  allergies: string | null
  budget: string | null
  lieu_repas: Record<string, string> | null
}

/** Profil complet agrégé, entrée unique de generateProgram(). */
export interface FullProfile {
  userId: string
  profile: ProfileData
  goal: GoalData
  equipment: EquipmentData[]
  availability: AvailabilityData
  cooking: CookingPreferencesData | null
}

/* ------------------------------------------------------------------ */
/* Bibliothèques de référence (data/)                                  */
/* ------------------------------------------------------------------ */

/** Catégorie d'exercice (colonne exercises_library.categorie). */
export type ExerciseCategorie =
  | 'callisthenie_poids_du_corps'
  | 'callisthenie_barre'
  | 'callisthenie_salle'
  | 'equipement_personnel'
  | 'endurance'

/**
 * Définition d'un exercice de référence.
 *
 * `equipement_requis` reprend exactement une valeur de la table equipment :
 * - une valeur d'equipment.type pour la force (colonnes type),
 * - une valeur d'equipment.equipement_endurance pour l'endurance.
 * 'Poids du corps uniquement' signifie « faisable sans aucun matériel ».
 *
 * `variante_sans_equipement` est le `nom` d'un autre exercice de la bibliothèque
 * faisable au poids du corps, utilisé par les règles quand le matériel manque.
 * Ce champ n'existe pas en base (la table exercises_library n'a pas de colonne
 * dédiée) : il vit uniquement côté code.
 */
export interface ExerciseDefinition {
  id: string
  nom: string
  categorie: ExerciseCategorie
  equipement_requis: EquipmentType | EnduranceEquipment
  niveau: NiveauSport
  muscle_cible: string
  variante_sans_equipement?: string
}

/** Structure stockée dans skills.criteres_test (jsonb). */
export interface SkillCriteresTest {
  niveau: NiveauSport
  description: string
  prerequis: string[]
  test: {
    consigne: string
    type: 'maintien' | 'repetitions'
    seuil: number
    unite: 's' | 'reps'
  }
}

/** Définition d'une figure/skill de callisthénie (table skills). */
export interface SkillDefinition {
  id: string
  nom_figure: string
  criteres_test: SkillCriteresTest
}

/* ------------------------------------------------------------------ */
/* Structures produites par le moteur de règles                        */
/* ------------------------------------------------------------------*/

/** Un créneau hebdomadaire déduit des disponibilités déclarées. */
export interface WeeklySlot {
  /** Jour de la semaine au format ISO : 1 = lundi … 7 = dimanche. */
  jourSemaine: number
  /** Heure suggérée ('HH:mm'), déduite de la préférence horaire. */
  heureSuggeree: string
}

/** Emplacement d'une séance dans la semaine. */
export type SessionFocus =
  | 'haut_du_corps'
  | 'bas_du_corps'
  | 'full_body'
  | 'gainage'
  | 'skill'

/** Un exercice planifié dans une séance (= une ligne session_exercises). */
export interface SessionExercisePlan {
  exerciseId: string
  nom: string
  series: number
  reps: string
  tempsRepos: number
  estFinisher: boolean
}

/** Une séance complète (= une ligne sessions + ses session_exercises). */
export interface SessionPlan {
  date: string
  type: SessionType
  focus: SessionFocus
  heureSuggeree: string
  dureeMinutes: number
  exercises: SessionExercisePlan[]
  /** Skill testé en fin de séance (objectif figures uniquement). */
  skillTestId?: string
}

/** Une phase du programme (= une ligne program_phases). */
export interface ProgramPhasePlan {
  ordre: number
  nomPhase: string
  dureeSemaines: number
  criteresProgression: Record<string, unknown>
  sessions: SessionPlan[]
}

/** Cibles nutritionnelles journalières calculées par rules/nutrition.ts. */
export interface NutritionTargets {
  calories: number
  proteines_g: number
  glucides_g: number
  lipides_g: number
  hydratation_ml: number
}

/** Programme complet généré, prêt à être persisté en base. */
export interface GeneratedProgram {
  phases: ProgramPhasePlan[]
  nutritionTargets: NutritionTargets
  meta: {
    objectif: TypeObjectif
    niveau: NiveauSport
    frequenceSemaine: number
    dureeTotaleSemaines: number
    dateDebut: string
  }
}
