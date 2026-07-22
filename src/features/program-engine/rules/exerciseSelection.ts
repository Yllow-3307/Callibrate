import type {
  EquipmentData,
  EnduranceEquipment,
  ExerciseDefinition,
  NiveauSport,
  ProfileData,
  TypeObjectif,
} from '../types'
import { exercisesLibrary } from '../data/exercisesLibrary'

/**
 * Sélection des exercices compatibles avec un profil.
 * Règles pures : aucune dépendance à React ou Supabase.
 */

/** Ordre de progression des niveaux, du plus accessible au plus exigeant. */
const ORDRE_NIVEAUX: Record<NiveauSport, number> = {
  Débutant: 0,
  Intermédiaire: 1,
  Avancé: 2,
  Confirmé: 3,
}

/**
 * L'endurance « course à pied / marche » ne demande aucun matériel :
 * elle reste disponible même quand l'utilisateur déclare « Aucun » ou « Autre ».
 */
const ENDURANCE_SANS_MATERIEL: EnduranceEquipment = 'Course à pied'

/** Mots-clés recherchés dans details_perso pour autoriser les exercices « Équipement personnel ». */
const MOTS_CLES_EQUIPEMENT_PERSO = [
  'élastique',
  'elastique',
  'bande',
  'haltère',
  'haltere',
  'haltères',
  'halteres',
  'kettlebell',
  'poids',
  'barre',
  'trx',
  'sangles',
]

function niveauAutorise(exercice: ExerciseDefinition, niveau: NiveauSport): boolean {
  return ORDRE_NIVEAUX[exercice.niveau] <= ORDRE_NIVEAUX[niveau]
}

function detailsPersoAutorisent(exercice: ExerciseDefinition, details: string | null): boolean {
  if (!details || details.trim() === '') {
    // Case « Équipement personnel » cochée sans précision : on autorise
    // les exercices élastiques (matériel le plus courant), pas le reste.
    return exercice.nom.toLowerCase().includes('élastique')
  }
  const detailsNormalises = details.toLowerCase()
  return MOTS_CLES_EQUIPEMENT_PERSO.some((motCle) => detailsNormalises.includes(motCle))
}

/**
 * Indique si l'exercice est réalisable avec l'équipement déclaré.
 *
 * Correspondances par colonne (cf. table equipment) :
 * - force     → equipment.type ('Salle de sport', 'Parc de street workout',
 *               'Équipement personnel', 'Rien', 'Poids du corps uniquement')
 * - endurance → equipment.equipement_endurance ('Course à pied', 'Vélo',
 *               'Corde à sauter', 'Aucun', 'Autre')
 */
export function exerciceDisponible(
  exercice: ExerciseDefinition,
  equipment: EquipmentData[],
): boolean {
  if (exercice.categorie === 'endurance') {
    // Un rameur n'existe qu'en salle de sport dans cette bibliothèque.
    if (exercice.equipement_requis === 'Salle de sport') {
      return equipment.some((item) => item.type === 'Salle de sport')
    }
    const enduranceDeclaree = new Set(
      equipment
        .map((item) => item.equipement_endurance)
        .filter((valeur): valeur is EnduranceEquipment => valeur !== null),
    )
    if (exercice.equipement_requis === ENDURANCE_SANS_MATERIEL) return true
    return enduranceDeclaree.has(exercice.equipement_requis as EnduranceEquipment)
  }

  if (exercice.equipement_requis === 'Poids du corps uniquement') return true

  return equipment.some((item) => {
    if (item.type === 'Rien') return false
    // La salle de sport fournit aussi barres et parallèles : elle couvre le parc.
    if (exercice.equipement_requis === 'Parc de street workout') {
      return item.type === 'Parc de street workout' || item.type === 'Salle de sport'
    }
    if (exercice.equipement_requis === 'Équipement personnel' && item.type === 'Équipement personnel') {
      return detailsPersoAutorisent(exercice, item.details_perso)
    }
    return item.type === exercice.equipement_requis
  })
}

/**
 * Pondération des catégories selon l'objectif : plus le score est bas,
 * plus la catégorie est prioritaire dans les séances.
 */
export function scoreCategoriePourObjectif(
  exercice: ExerciseDefinition,
  goal: TypeObjectif,
): number {
  const scores: Record<ExerciseDefinition['categorie'], number> = (() => {
    switch (goal) {
      case 'Travail de figures de callisthénie':
        return {
          callisthenie_barre: 0,
          callisthenie_poids_du_corps: 1,
          equipement_personnel: 2,
          callisthenie_salle: 3,
          endurance: 4,
        }
      case 'Prise de muscle':
        return {
          callisthenie_salle: 0,
          callisthenie_barre: 1,
          callisthenie_poids_du_corps: 1,
          equipement_personnel: 2,
          endurance: 3,
        }
      case 'Affinement musculaire sans prise de poids':
        return {
          callisthenie_poids_du_corps: 0,
          equipement_personnel: 1,
          callisthenie_barre: 1,
          callisthenie_salle: 2,
          endurance: 2,
        }
      case 'Sèche':
        return {
          callisthenie_poids_du_corps: 0,
          endurance: 1,
          callisthenie_barre: 2,
          equipement_personnel: 2,
          callisthenie_salle: 2,
        }
    }
  })()
  return scores[exercice.categorie]
}

/**
 * Filtre la bibliothèque d'exercices pour un profil donné.
 *
 * Exclut tout exercice nécessitant un équipement non possédé et tout
 * exercice au-dessus du niveau déclaré, puis trie par pertinence pour
 * l'objectif (catégorie, puis niveau croissant).
 *
 * L'argument `profile` est conservé tel quel (signature de la spécification) :
 * il porte l'historique du profil complet si la sélection devait tenir compte
 * d'autres champs que le niveau à l'avenir.
 */
export function selectExercisesForProfile(
  profile: ProfileData,
  goal: TypeObjectif,
  equipment: EquipmentData[],
  level: NiveauSport,
): ExerciseDefinition[] {
  void profile // voir note ci-dessus : le niveau est explicitement fourni.
  const eligibles = exercisesLibrary.filter(
    (exercice) => niveauAutorise(exercice, level) && exerciceDisponible(exercice, equipment),
  )
  return eligibles
    .map((exercice, index) => ({ exercice, index, score: scoreCategoriePourObjectif(exercice, goal) }))
    .sort((a, b) =>
      a.score - b.score
      || ORDRE_NIVEAUX[a.exercice.niveau] - ORDRE_NIVEAUX[b.exercice.niveau]
      || a.index - b.index,
    )
    .map(({ exercice }) => exercice)
}
