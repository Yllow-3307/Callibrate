import type {
  ExerciseDefinition,
  NiveauSport,
  SessionExercisePlan,
  SessionFocus,
  SessionPlan,
  SessionType,
  SkillDefinition,
  TypeObjectif,
} from '../types'
import { exercisesByNom } from '../data/exercisesLibrary'

/**
 * Construction d'une séance complète (exercices + séries + répétitions + repos).
 * Règles pures : aucune dépendance à React ou Supabase.
 *
 * Séance retournée sans date : c'est generateProgram (rules/programGenerator.ts)
 * qui planifie chaque séance construite ici.
 */

/** Séance construite, non encore planifiée dans le calendrier. */
export type SessionDraft = Omit<SessionPlan, 'date' | 'heureSuggeree'>

/* ------------------------------------------------------------------ */
/* Paramètres par objectif                                             */
/* ------------------------------------------------------------------ */

interface ParametresSeance {
  series: number
  repsDynamiques: string
  repsIsometriques: string
  repos: number
  /** Exercice cardio ajouté en fin de séance (objectif sèche). */
  finisher: boolean
}

const ORDRE_NIVEAUX: Record<NiveauSport, number> = {
  Débutant: 0,
  Intermédiaire: 1,
  Avancé: 2,
  Confirmé: 3,
}

function parametresPour(goal: TypeObjectif, level: NiveauSport): ParametresSeance {
  const base: ParametresSeance = (() => {
    switch (goal) {
      case 'Sèche':
        // Volume élevé, repos courts, finisher cardio systématique.
        return { series: 4, repsDynamiques: '12-15', repsIsometriques: '40 s', repos: 45, finisher: true }
      case 'Prise de muscle':
        // Charge progressive : plage hypertrophie basse, repos longs.
        return { series: 4, repsDynamiques: '8-10', repsIsometriques: '30 s', repos: 150, finisher: false }
      case 'Affinement musculaire sans prise de poids':
        // Volume modéré, tempo contrôlé (excentrique lente).
        return { series: 3, repsDynamiques: '10-12 (tempo 3-1-1)', repsIsometriques: '45 s', repos: 75, finisher: false }
      case 'Travail de figures de callisthénie':
        // Force spécifique : répétitions basses / maintiens, repos complets.
        return { series: 5, repsDynamiques: '4-6', repsIsometriques: '8-12 s', repos: 150, finisher: false }
    }
  })()

  // Ajustement par niveau : les débutants allègent, les confirmés ajoutent du volume.
  if (level === 'Débutant') {
    return { ...base, series: Math.max(2, base.series - 1) }
  }
  if (level === 'Confirmé' && goal !== 'Travail de figures de callisthénie') {
    return { ...base, series: base.series + 1 }
  }
  return base
}

/* ------------------------------------------------------------------ */
/* Classification des exercices                                        */
/* ------------------------------------------------------------------ */

/** Exercices tenus en isométrie : les répétitions deviennent des durées. */
function estIsometrique(exercice: ExerciseDefinition): boolean {
  const nom = exercice.nom.toLowerCase()
  const termes = [
    'gainage', 'hollow body', 'suspension', 'l-sit', 'v-sit', 'chaise au mur',
    'superman', 'tuck front lever', 'wall sit',
  ]
  return termes.some((terme) => nom.includes(terme))
}

const MUSCLES_PAR_FOCUS: Record<Exclude<SessionFocus, 'full_body' | 'skill'>, string[]> = {
  haut_du_corps: ['pectoraux', 'dos', 'épaules', 'triceps', 'biceps'],
  bas_du_corps: ['jambes', 'fessiers', 'ischios', 'mollets'],
  gainage: ['abdominaux', 'obliques'],
}

/* ------------------------------------------------------------------ */
/* Exercices de renforcement spécifiques à chaque figure               */
/* ------------------------------------------------------------------ */

const RENFORCEMENT_PAR_SKILL: Record<string, string[]> = {
  'L-sit': ['L-sit suspendu à la barre', 'L-sit aux parallèles', 'Gainage planche', 'Relevés de jambes au sol', 'Dips entre deux appuis'],
  'Planche (tuck planche)': ['Pompes pseudo-planche', 'Pike push-ups', 'Gainage planche', 'Hollow body hold', 'Pompes classiques'],
  'Planche complète': ['Pompes pseudo-planche', 'Pompes archer', 'Gainage planche', 'Pike push-ups'],
  'Front lever (tuck)': ['Tuck front lever', 'Tractions pronation', 'Tractions australiennes (barre basse)', 'Relevés de jambes suspendu'],
  'Back lever (tuck)': ['Suspension active à la barre', 'Tractions négatives', 'Relevés de jambes au sol', 'Superman hold'],
  'Muscle-up strict': ['Tractions pronation', 'Tractions négatives', 'Dips aux barres parallèles', 'Suspension active à la barre', 'Tractions archer'],
  'Drapeau (human flag, tuck)': ['Gainage latéral', 'Tractions pronation', 'Gainage planche', 'Tirage élastique'],
  'Équilibre sur les mains (handstand)': ['Pike push-ups', 'Pompes en poirier contre un mur', 'Gainage planche', 'Gainage dynamique (shoulder taps)'],
  'Pompes en poirier (HSPU)': ['Pike push-ups', 'Pompes en poirier contre un mur', 'Pompes déclinées', 'Gainage planche'],
  'Pistol squat': ['Pistol squat assisté', 'Squat bulgare', 'Squat poids du corps', 'Chaise au mur (wall sit)'],
  'V-sit': ['L-sit suspendu à la barre', 'Relevés de jambes au sol', 'Hollow body hold', 'Gainage planche'],
  'Traction à un bras': ['Tractions archer', 'Tractions pronation', 'Tractions négatives', 'Suspension active à la barre'],
}

/** Finishers cardio, du plus préférable au plus basique (le premier disponible gagne). */
const FINISHERS = ['Corde à sauter', 'Burpees', 'Mountain climbers', 'Jumping jacks']

/* ------------------------------------------------------------------ */
/* Sélection déterministe dans le pool                                 */
/* ------------------------------------------------------------------*/

function prendreParMuscle(
  pool: ExerciseDefinition[],
  muscles: string[],
  combien: number,
  dejaPris: Set<string>,
): ExerciseDefinition[] {
  const selection: ExerciseDefinition[] = []
  for (const muscle of muscles) {
    for (const exercice of pool) {
      if (selection.length >= combien) return selection
      if (exercice.muscle_cible !== muscle || dejaPris.has(exercice.id)) continue
      selection.push(exercice)
      dejaPris.add(exercice.id)
    }
  }
  return selection
}

function completerSelection(
  pool: ExerciseDefinition[],
  selection: ExerciseDefinition[],
  combien: number,
  dejaPris: Set<string>,
): ExerciseDefinition[] {
  if (selection.length >= combien) return selection
  const complete = [...selection]
  for (const exercice of pool) {
    if (complete.length >= combien) break
    if (exercice.categorie === 'endurance' || dejaPris.has(exercice.id)) continue
    complete.push(exercice)
    dejaPris.add(exercice.id)
  }
  return complete
}

function versPlan(
  exercice: ExerciseDefinition,
  params: ParametresSeance,
  estFinisher = false,
): SessionExercisePlan {
  const isometrique = estIsometrique(exercice)
  return {
    exerciseId: exercice.id,
    nom: exercice.nom,
    // Le finisher est court et dense : 3 rounds avec peu de repos.
    series: estFinisher ? 3 : params.series,
    reps: estFinisher ? '30 s' : isometrique ? params.repsIsometriques : params.repsDynamiques,
    tempsRepos: estFinisher ? 30 : params.repos,
    estFinisher,
  }
}

/* ------------------------------------------------------------------ */
/* Construction de la séance                                           */
/* ------------------------------------------------------------------*/

export interface GenerateSessionOptions {
  focus?: SessionFocus
  /** Figure travaillée (obligatoire quand focus = 'skill'). */
  skill?: SkillDefinition
}

/**
 * Construit une séance complète à partir d'un pool d'exercices déjà
 * filtré pour le profil (voir selectExercisesForProfile).
 *
 * La logique diffère selon l'objectif (voir parametresPour) :
 * - « Sèche » → volume élevé, repos courts, finisher cardio en fin de séance,
 * - « Prise de muscle » → plages de répétitions basses, repos longs,
 * - « Affinement musculaire sans prise de poids » → volume modéré, tempo contrôlé,
 * - « Figures de callisthénie » → renforcement spécifique de la figure,
 *   répétitions basses / maintiens, repos complets.
 */
export function generateSession(
  type: SessionType,
  exercises: ExerciseDefinition[],
  goal: TypeObjectif,
  level: NiveauSport,
  options: GenerateSessionOptions = {},
): SessionDraft {
  const params = parametresPour(goal, level)

  if (type === 'endurance') {
    return construireSeanceEndurance(exercises, goal, level, params)
  }

  const focus = options.focus ?? 'full_body'
  const poolForce = exercises.filter((exercice) => exercice.categorie !== 'endurance')
  const dejaPris = new Set<string>()

  let selection: ExerciseDefinition[] = []
  if (focus === 'skill') {
    const noms = options.skill ? RENFORCEMENT_PAR_SKILL[options.skill.nom_figure] ?? [] : []
    for (const nom of noms) {
      const exercice = exercisesByNom.get(nom)
      if (!exercice || dejaPris.has(exercice.id)) continue
      // Uniquement si l'exercice est réellement disponible pour ce profil.
      if (poolForce.some((candidat) => candidat.id === exercice.id)) {
        selection.push(exercice)
        dejaPris.add(exercice.id)
      }
    }
    selection = completerSelection(poolForce, selection, 5, dejaPris)
  } else if (focus === 'full_body') {
    selection = [
      ...prendreParMuscle(poolForce, MUSCLES_PAR_FOCUS.haut_du_corps, 2, dejaPris),
      ...prendreParMuscle(poolForce, MUSCLES_PAR_FOCUS.bas_du_corps, 2, dejaPris),
      ...prendreParMuscle(poolForce, MUSCLES_PAR_FOCUS.gainage, 2, dejaPris),
    ]
    selection = completerSelection(poolForce, selection, 6, dejaPris)
  } else {
    selection = prendreParMuscle(poolForce, MUSCLES_PAR_FOCUS[focus], 5, dejaPris)
    selection = completerSelection(poolForce, selection, 5, dejaPris)
  }

  const planExercices = selection.map((exercice) => versPlan(exercice, params))

  if (params.finisher) {
    const finisher = FINISHERS.map((nom) => exercisesByNom.get(nom))
      .find((candidat): candidat is ExerciseDefinition =>
        Boolean(candidat) && exercises.some((dispo) => dispo.id === candidat!.id) && !dejaPris.has(candidat!.id),
      )
    if (finisher) planExercices.push(versPlan(finisher, params, true))
  }

  return {
    type: 'callisthenie',
    focus,
    dureeMinutes: 45,
    exercises: planExercices,
  }
}

function construireSeanceEndurance(
  exercises: ExerciseDefinition[],
  goal: TypeObjectif,
  level: NiveauSport,
  params: ParametresSeance,
): SessionDraft {
  const poolEndurance = exercises.filter((exercice) => exercice.categorie === 'endurance')
  // Le pool est déjà trié par pertinence : le premier exercice correspond
  // au meilleur équipement d'endurance du profil.
  const exercice = poolEndurance[0] ?? exercisesByNom.get('Footing léger')!

  // Fractionné réservé aux profils autonomes et aux objectifs brûleurs.
  const fractionnePossible = ORDRE_NIVEAUX[level] >= ORDRE_NIVEAUX.Intermédiaire
    && (goal === 'Sèche' || goal === 'Prise de muscle')

  let planExercice: SessionExercisePlan
  if (fractionnePossible && goal === 'Sèche') {
    planExercice = {
      exerciseId: exercice.id,
      nom: `${exercice.nom} — fractionné`,
      series: 8,
      reps: '1 min rapide / 1 min lent',
      tempsRepos: 0,
      estFinisher: false,
    }
  } else {
    const durees: Record<TypeObjectif, number> = {
      'Sèche': 35,
      'Prise de muscle': 25,
      'Affinement musculaire sans prise de poids': 40,
      'Travail de figures de callisthénie': 20,
    }
    const duree = level === 'Débutant' ? Math.min(durees[goal], 25) : durees[goal]
    planExercice = {
      exerciseId: exercice.id,
      nom: exercice.nom,
      series: 1,
      reps: `${duree} min allure modérée`,
      tempsRepos: 0,
      estFinisher: false,
    }
  }

  void params
  return {
    type: 'endurance',
    focus: 'full_body',
    dureeMinutes: goal === 'Sèche' ? 40 : 35,
    exercises: [planExercice],
  }
}
