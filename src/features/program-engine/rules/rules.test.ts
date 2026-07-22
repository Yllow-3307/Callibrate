import { describe, it, expect } from 'vitest'
import { selectExercisesForProfile, hasRequiredEquipment } from './selectExercises'
import { buildWeeklySchedule, timeToMinutes, minutesToTime } from './buildSchedule'
import type { Exercise, UserEquipment, UserProfile, UserAvailability } from './types'

const exercises: Exercise[] = [
  { id: '1', nom: 'Pompes', categorie: 'push', equipement_requis: [], niveau: 'Débutant', muscle_cible: 'pectoraux' },
  { id: '2', nom: 'Tractions', categorie: 'pull', equipement_requis: ['Barre de traction'], niveau: 'Intermédiaire', muscle_cible: 'dorsaux' },
  { id: '3', nom: 'Front lever', categorie: 'figures', equipement_requis: ['Barre de traction'], niveau: 'Avancé', muscle_cible: 'dorsaux' },
  { id: '4', nom: 'Squat bulgare', categorie: 'legs', equipement_requis: ['Banc'], niveau: 'Intermédiaire', muscle_cible: 'quadriceps' },
  { id: '5', nom: 'Swing kettlebell', categorie: 'full', equipement_requis: ['Kettlebell'], niveau: 'Intermédiaire', muscle_cible: 'chainep' },
  { id: '6', nom: 'Curl élastique', categorie: 'arms', equipement_requis: ['Élastique de résistance'], niveau: 'Débutant', muscle_cible: 'biceps' },
  { id: '7', nom: 'Row haltères', categorie: 'pull', equipement_requis: ['Haltères'], niveau: 'Intermédiaire', muscle_cible: 'dorsaux' },
  { id: '8', nom: 'Dev couché', categorie: 'push', equipement_requis: ['Salle de sport'], niveau: 'Avancé', muscle_cible: 'pectoraux' },
  { id: '9', nom: 'Planche', categorie: 'core', equipement_requis: [], niveau: 'Débutant', muscle_cible: 'abdos' },
  { id: '10', nom: 'Muscle-up', categorie: 'figures', equipement_requis: ['Barre de traction'], niveau: 'Confirmé', muscle_cible: 'torse' },
]
const emptyEquip: UserEquipment = { types: ['Rien'], details_perso: [], equipement_endurance: [] }
const salle: UserEquipment = { types: ['Salle de sport'], details_perso: [], equipement_endurance: [] }
const perso: UserEquipment = { types: ['Équipement personnel'], details_perso: ['Barre de traction', 'Haltères'], equipement_endurance: [] }
const parc: UserEquipment = { types: ['Parc de street workout'], details_perso: [], equipement_endurance: [] }
const profile: UserProfile = { age: 25, sexe: 'H', poids: 75, taille: 180, niveau_sport: 'Intermédiaire', objectif: 'Prise de muscle' }
const avail: UserAvailability = { heure_reveil: '07:00', heure_travail_debut: '09:00', heure_travail_fin: '17:00', heure_coucher: '23:00', preference_horaire: 'Soir', duree_seance: 45, frequence_semaine: 4, indisponibilites: [] }

describe('selectExercisesForProfile', () => {
  it('exclut les exercices dont le niveau dépasse celui de l\'utilisateur', () => {
    const noms = selectExercisesForProfile(exercises, profile, salle).map((e) => e.nom)
    expect(noms).not.toContain('Front lever')
    expect(noms).not.toContain('Muscle-up')
    expect(noms).toContain('Pompes')
  })
  it('inclut tous les exercices pour un Confirmé avec salle', () => {
    expect(selectExercisesForProfile(exercises, { ...profile, niveau_sport: 'Confirmé' }, salle).length).toBe(exercises.length)
  })
  it('ne garde que les exercices sans équipement pour "Rien"', () => {
    const noms = selectExercisesForProfile(exercises, profile, emptyEquip).map((e) => e.nom)
    expect(noms).toContain('Pompes')
    expect(noms).toContain('Planche')
    expect(noms).not.toContain('Tractions')
    expect(noms).not.toContain('Squat bulgare')
  })
  it('inclut les exercices correspondant aux équipements personnels', () => {
    const noms = selectExercisesForProfile(exercises, profile, perso).map((e) => e.nom)
    expect(noms).toContain('Tractions')
    expect(noms).toContain('Row haltères')
    expect(noms).not.toContain('Squat bulgare')
    expect(noms).not.toContain('Swing kettlebell')
  })
  it('inclut tous les exercices avec le parc street workout', () => {
    const noms = selectExercisesForProfile(exercises, profile, parc).map((e) => e.nom)
    expect(noms).toContain('Tractions')
    expect(noms).toContain('Squat bulgare')
    expect(noms).toContain('Swing kettlebell')
  })
})

describe('hasRequiredEquipment', () => {
  it('accepte un exercice sans équipement', () => {
    expect(hasRequiredEquipment({ id: 'x', nom: 'T', categorie: '', equipement_requis: [], niveau: 'Débutant', muscle_cible: '' }, emptyEquip)).toBe(true)
  })
  it('refuse un exercice nécessitant un équipement non possédé', () => {
    expect(hasRequiredEquipment({ id: 'x', nom: 'T', categorie: '', equipement_requis: ['Kettlebell'], niveau: 'Débutant', muscle_cible: '' }, perso)).toBe(false)
  })
  it('accepte quand l\'utilisateur a la salle', () => {
    expect(hasRequiredEquipment({ id: 'x', nom: 'T', categorie: '', equipement_requis: ['Kettlebell'], niveau: 'Débutant', muscle_cible: '' }, salle)).toBe(true)
  })
})

describe('buildWeeklySchedule', () => {
  it('génère le bon nombre de séances', () => { expect(buildWeeklySchedule(avail).length).toBe(4) })
  it('alterne callisthenie / endurance', () => {
    const slots = buildWeeklySchedule(avail)
    expect(slots[0].type).toBe('callisthenie')
    expect(slots[1].type).toBe('endurance')
  })
  it('place les séances le soir', () => {
    for (const s of buildWeeklySchedule(avail)) { expect(timeToMinutes(s.heure_debut)).toBeGreaterThanOrEqual(timeToMinutes('17:00')) }
  })
  it('place les séances le matin si préférence Matin', () => {
    for (const s of buildWeeklySchedule({ ...avail, preference_horaire: 'Matin' })) { expect(timeToMinutes(s.heure_debut)).toBeLessThan(timeToMinutes('09:00')) }
  })
  it('respecte la durée unique', () => {
    for (const s of buildWeeklySchedule(avail)) { expect(timeToMinutes(s.heure_fin) - timeToMinutes(s.heure_debut)).toBe(45) }
  })
  it('retourne [] si durée 0', () => { expect(buildWeeklySchedule({ ...avail, duree_seance: 0 }).length).toBe(0) })
})

describe('indisponibilités', () => {
  it('exclut un créneau qui tombe dans une plage d\'indisponibilité', () => {
    const slots = buildWeeklySchedule({ ...avail, indisponibilites: [{ debut: '17:00', fin: '19:00', label: 'Devoirs' }] })
    expect(slots.length).toBe(4)
    for (const s of slots) {
      const start = timeToMinutes(s.heure_debut); const end = timeToMinutes(s.heure_fin)
      expect(start < timeToMinutes('19:00') && timeToMinutes('17:00') < end).toBe(false)
    }
  })
  it('déplace les créneaux après l\'indisponibilité', () => {
    const slots = buildWeeklySchedule({ ...avail, indisponibilites: [{ debut: '17:00', fin: '18:30' }] })
    for (const s of slots) { expect(timeToMinutes(s.heure_debut)).toBeGreaterThanOrEqual(timeToMinutes('18:30')) }
  })
  it('gère plusieurs indisponibilités', () => {
    const indis = [{ debut: '17:00', fin: '18:00' }, { debut: '19:00', fin: '20:00' }]
    const slots = buildWeeklySchedule({ ...avail, indisponibilites: indis })
    for (const s of slots) {
      for (const ind of indis) {
        expect(timeToMinutes(s.heure_debut) < timeToMinutes(ind.fin) && timeToMinutes(ind.debut) < timeToMinutes(s.heure_fin)).toBe(false)
      }
    }
  })
  it('ne génère pas de séance si toute la plage est indisponible', () => {
    expect(buildWeeklySchedule({ ...avail, indisponibilites: [{ debut: '17:00', fin: '23:00' }] }).length).toBe(0)
  })
  it('utilise la fenêtre matin quand soirée bloquée et préférence Variable', () => {
    const slots = buildWeeklySchedule({ ...avail, preference_horaire: 'Variable selon les jours', indisponibilites: [{ debut: '17:00', fin: '23:00' }] })
    expect(slots.length).toBe(4)
    for (const s of slots) { expect(timeToMinutes(s.heure_debut)).toBeLessThan(timeToMinutes('09:00')) }
  })
})

describe('utilitaires', () => {
  it('timeToMinutes', () => { expect(timeToMinutes('07:30')).toBe(450) })
  it('minutesToTime', () => { expect(minutesToTime(450)).toBe('07:30') })
})
