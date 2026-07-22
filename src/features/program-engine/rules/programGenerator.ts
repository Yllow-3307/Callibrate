import type {
  FullProfile,
  GeneratedProgram,
  ProgramPhasePlan,
  SessionFocus,
  SessionType,
  SkillDefinition,
  TypeObjectif,
  WeeklySlot,
} from '../types'
import { skillsLibrary } from '../data/skillsLibrary'
import { selectExercisesForProfile } from './exerciseSelection'
import { buildWeeklySchedule } from './schedule'
import { generateSession, type SessionDraft } from './sessionBuilder'
import { buildNutritionTargets } from './nutrition'

/**
 * Orchestration complète : profil → programme structuré (phases, séances,
 * cibles nutritionnelles). Règles pures : aucune dépendance à React ou
 * Supabase, sortie déterministe pour une même entrée (dates comprises).
 */

/** Durée d'une phase en semaines. 3 phases × 4 semaines = 12 semaines. */
const SEMAINES_PAR_PHASE = 4

interface PhaseDefinition {
  nom: string
  description: string
  /** Ajustements appliqués aux séances de la phase. */
  ajustements: { seriesDelta: number; reposDelta: number }
}

const PHASES: PhaseDefinition[] = [
  {
    nom: 'Adaptation',
    description: 'Apprendre les mouvements avec une marge technique confortable.',
    ajustements: { seriesDelta: -1, reposDelta: 15 },
  },
  {
    nom: 'Développement',
    description: 'Atteindre le haut des plages de répétitions sur chaque exercice.',
    ajustements: { seriesDelta: 0, reposDelta: 0 },
  },
  {
    nom: 'Intensification',
    description: 'Densifier le travail : plus de séries, temps de repos réduits.',
    ajustements: { seriesDelta: 1, reposDelta: -15 },
  },
]

/** Nombre maximal de semaines du programme généré. */
const DUREE_TOTALE_SEMAINES = PHASES.length * SEMAINES_PAR_PHASE

/* ------------------------------------------------------------------ */
/* Répartition des types de séances et des focus                       */
/* ------------------------------------------------------------------*/

/** Type de séance selon l'objectif : les objectifs brûleurs tournent plus souvent vers l'endurance. */
function typePourSeance(
  goal: TypeObjectif,
  indexDansSemaine: number,
  enduranceDisponible: boolean,
): SessionType {
  if (!enduranceDisponible) return 'callisthenie'
  switch (goal) {
    case 'Sèche':
      return indexDansSemaine % 3 === 2 ? 'endurance' : 'callisthenie'
    case 'Prise de muscle':
      // Une seule endurance par semaine (dernière séance), pour préserver le muscle.
      return indexDansSemaine % 4 === 3 ? 'endurance' : 'callisthenie'
    case 'Affinement musculaire sans prise de poids':
      return indexDansSemaine % 3 === 1 ? 'endurance' : 'callisthenie'
    case 'Travail de figures de callisthénie':
      // Endurance rare : une séance de récupération active toutes les 6 séances.
      return indexDansSemaine % 6 === 5 ? 'endurance' : 'callisthenie'
  }
}

/** Rotation des focus de callisthénie : tous les muscles sont couverts chaque semaine. */
function focusPourSeance(goal: TypeObjectif, indexCallisthenie: number): SessionFocus {
  const rotation: SessionFocus[] = goal === 'Travail de figures de callisthénie'
    ? ['skill', 'haut_du_corps', 'bas_du_corps', 'skill', 'gainage']
    : ['haut_du_corps', 'bas_du_corps', 'gainage', 'full_body']
  return rotation[indexCallisthenie % rotation.length]
}

/** Figures travaillées en rotation, filtrées pour rester accessibles au niveau déclaré. */
function skillsPourNiveau(niveau: FullProfile['profile']['niveau_sport']): SkillDefinition[] {
  const ordre = ['Débutant', 'Intermédiaire', 'Avancé', 'Confirmé']
  const plafond = ordre.indexOf(niveau) + 1 // on autorise un cran au-dessus pour progresser
  const accessibles = skillsLibrary.filter((skill) => ordre.indexOf(skill.criteres_test.niveau) <= plafond)
  return accessibles.length > 0 ? accessibles : skillsLibrary.slice(0, 3)
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------*/

/** Ajoute des jours à une date ISO 'YYYY-MM-DD' (UTC, sans dérive horaire). */
function ajouterJours(dateIso: string, jours: number): string {
  const date = new Date(`${dateIso}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + jours)
  return date.toISOString().slice(0, 10)
}

/** Jour de la semaine ISO (1 = lundi … 7 = dimanche) d'une date 'YYYY-MM-DD'. */
function jourSemaineIso(dateIso: string): number {
  const date = new Date(`${dateIso}T00:00:00Z`)
  return ((date.getUTCDay() + 6) % 7) + 1
}

/* ------------------------------------------------------------------ */
/* Application des ajustements de phase à une séance construite        */
/* ------------------------------------------------------------------*/

function appliquerAjustements(draft: SessionDraft, phase: PhaseDefinition, duree: number): SessionDraft {
  return {
    ...draft,
    dureeMinutes: duree,
    exercises: draft.exercises.map((exercice) => ({
      ...exercice,
      series: Math.max(exercice.estFinisher ? 2 : 2, exercice.series + phase.ajustements.seriesDelta),
      tempsRepos: Math.max(20, exercice.tempsRepos + (exercice.estFinisher ? 0 : phase.ajustements.reposDelta)),
    })),
  }
}

/* ------------------------------------------------------------------ */
/* Fonction principale                                                 */
/* ------------------------------------------------------------------*/

export interface GenerateProgramOptions {
  /** Date de démarrage du programme ('YYYY-MM-DD'). Défaut : aujourd'hui. */
  startDate?: string
}

/**
 * Génère un programme complet à partir du profil utilisateur.
 *
 * Sortie : 3 phases progressives (Adaptation → Développement → Intensification),
 * chacune couvrant 4 semaines, avec autant de séances par semaine que la
 * fréquence déclarée, plus les cibles nutritionnelles calculées.
 *
 * Lève une erreur si le profil est incomplet (aucun exercice disponible, etc.).
 */
export function generateProgram(
  fullProfile: FullProfile,
  options: GenerateProgramOptions = {},
): GeneratedProgram {
  const { profile, goal, equipment, availability } = fullProfile
  const objectif = goal.type_objectif
  const niveau = profile.niveau_sport
  const startDate = options.startDate ?? new Date().toISOString().slice(0, 10)

  const creneaux: WeeklySlot[] = buildWeeklySchedule(availability)
  if (creneaux.length === 0) {
    throw new Error('Impossible de générer un programme : aucune disponibilité déclarée.')
  }

  const pool = selectExercisesForProfile(profile, objectif, equipment, niveau)
  const poolForce = pool.filter((exercice) => exercice.categorie !== 'endurance')
  if (poolForce.length === 0) {
    throw new Error("Impossible de générer un programme : aucun exercice compatible avec l'équipement déclaré.")
  }
  const enduranceDisponible = pool.some((exercice) => exercice.categorie === 'endurance')
  const skills = objectif === 'Travail de figures de callisthénie' ? skillsPourNiveau(niveau) : []

  const duree = Number.isFinite(availability.duree_seance) && availability.duree_seance > 0
    ? availability.duree_seance
    : 45

  // Enumerateur : une séance par créneau, semaine après semaine.
  const joursParCreneau = new Map<number, WeeklySlot>(creneaux.map((c) => [c.jourSemaine, c]))
  const joursProgrammes = new Set(joursParCreneau.keys())

  const phases: ProgramPhasePlan[] = PHASES.map((phaseDef, phaseIndex) => ({
    ordre: phaseIndex + 1,
    nomPhase: phaseDef.nom,
    dureeSemaines: SEMAINES_PAR_PHASE,
    criteresProgression: {
      description: phaseDef.description,
      ajustements: phaseDef.ajustements,
      fin_de_phase: phaseIndex === PHASES.length - 1
        ? 'Réaliser les tests de figures en fin de parcours'
        : `Valider l'ensemble des séances de la phase « ${phaseDef.nom} » pour passer à la suivante`,
    },
    sessions: [],
  }))

  let indexGlobalSeance = 0
  let indexCallisthenie = 0
  let indexSkill = 0

  for (let semaine = 0; semaine < DUREE_TOTALE_SEMAINES; semaine += 1) {
    const phaseIndex = Math.floor(semaine / SEMAINES_PAR_PHASE)
    const phaseDef = PHASES[phaseIndex]
    const phase = phases[phaseIndex]

    // Créneaux de la semaine triés chronologiquement : chaque bloc de 7 jours
    // contient exactement une occurrence de chaque jour programmé.
    const creneauxSemaine = [...joursProgrammes]
      .map((jour) => {
        let date = ajouterJours(startDate, semaine * 7)
        while (jourSemaineIso(date) !== jour) {
          date = ajouterJours(date, 1)
        }
        return { jour, date, creneau: joursParCreneau.get(jour)! }
      })
      .sort((a, b) => a.date.localeCompare(b.date))

    for (const { date, creneau } of creneauxSemaine) {
      const type = typePourSeance(objectif, indexGlobalSeance, enduranceDisponible)
      let draft: SessionDraft
      if (type === 'endurance') {
        draft = generateSession('endurance', pool, objectif, niveau)
      } else {
        const focus = focusPourSeance(objectif, indexCallisthenie)
        indexCallisthenie += 1
        if (focus === 'skill') {
          const skill = skills[indexSkill % skills.length]
          indexSkill += 1
          draft = generateSession('callisthenie', pool, objectif, niveau, { focus, skill })
          // Dernière semaine de chaque phase : on teste la figure travaillée.
          if (semaine % SEMAINES_PAR_PHASE === SEMAINES_PAR_PHASE - 1) {
            draft = { ...draft, skillTestId: skill.id }
          }
        } else {
          draft = generateSession('callisthenie', pool, objectif, niveau, { focus })
        }
      }

      const session = appliquerAjustements(draft, phaseDef, duree)
      phase.sessions.push({
        ...session,
        date,
        heureSuggeree: creneau.heureSuggeree,
      })
      indexGlobalSeance += 1
    }
  }

  return {
    phases,
    nutritionTargets: buildNutritionTargets(profile, objectif),
    meta: {
      objectif,
      niveau,
      frequenceSemaine: creneaux.length,
      dureeTotaleSemaines: DUREE_TOTALE_SEMAINES,
      dateDebut: startDate,
    },
  }
}
