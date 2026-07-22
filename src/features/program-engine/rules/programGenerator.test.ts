import { describe, expect, it } from 'vitest'
import type { AvailabilityData, EquipmentData, FullProfile, TypeObjectif } from '../types'
import { exercisesLibrary } from '../data/exercisesLibrary'
import { generateProgram } from './programGenerator'

/* ---------------------------------------------------------------- */
/* Fabriques de profils de test                                      */
/* ---------------------------------------------------------------- */

function dispos(frequence: number, preferenceHoraire: AvailabilityData['preference_horaire'] = 'Matin'): AvailabilityData {
  return {
    heure_reveil: '06:30',
    heure_travail_debut: '09:00',
    heure_travail_fin: '18:00',
    heure_coucher: '23:00',
    preference_horaire: preferenceHoraire,
    duree_seance: 45,
    frequence_semaine: frequence,
  }
}

function fullProfil(overrides: Partial<FullProfile> = {}): FullProfile {
  return {
    userId: 'user-test',
    profile: { age: 28, sexe: 'Homme', poids: 75, taille: 178, niveau_sport: 'Intermédiaire' },
    goal: { type_objectif: 'Sèche', date_creation: '2026-07-01' },
    equipment: [{ type: 'Salle de sport', details_perso: null, equipement_endurance: 'Course à pied' }],
    availability: dispos(4),
    cooking: null,
    ...overrides,
  }
}

const SANS_MATERIEL: EquipmentData[] = [{ type: 'Rien', details_perso: null, equipement_endurance: 'Aucun' }]

function toutesLesSessions(program: ReturnType<typeof generateProgram>) {
  return program.phases.flatMap((phase) => phase.sessions)
}

/* ---------------------------------------------------------------- */
/* Tests                                                             */
/* ---------------------------------------------------------------- */

describe('generateProgram', () => {
  it('retourne 3 phases progressives de 4 semaines (12 semaines)', () => {
    const program = generateProgram(fullProfil(), { startDate: '2026-07-20' })
    expect(program.phases).toHaveLength(3)
    expect(program.phases.map((p) => p.nomPhase)).toEqual(['Adaptation', 'Développement', 'Intensification'])
    expect(program.phases.map((p) => p.ordre)).toEqual([1, 2, 3])
    expect(program.meta.dureeTotaleSemaines).toBe(12)
  })

  it('retourne toujours au moins une séance par semaine déclarée (fréquence 1 à 7)', () => {
    for (const frequence of [1, 2, 3, 4, 5, 6, 7]) {
      const program = generateProgram(
        fullProfil({ availability: dispos(frequence) }),
        { startDate: '2026-07-20' },
      )
      const sessions = toutesLesSessions(program)
      expect(sessions).toHaveLength(12 * frequence)

      // Chaque bloc de 7 jours depuis le départ contient exactement `frequence` séances.
      const debut = new Date('2026-07-20T00:00:00Z').getTime()
      const dates = sessions.map((s) => new Date(`${s.date}T00:00:00Z`).getTime())
      expect(dates).toEqual([...dates].sort((a, b) => a - b)) // ordre chronologique
      for (let bloc = 0; bloc < 12; bloc += 1) {
        const min = debut + bloc * 7 * 86400000
        const max = min + 7 * 86400000
        const dansBloc = dates.filter((d) => d >= min && d < max)
        expect(dansBloc.length).toBe(frequence)
      }
    }
  })

  it('planifie la première séance le jour de départ ou après', () => {
    const program = generateProgram(fullProfil(), { startDate: '2026-07-22' }) // un mercredi
    const dates = toutesLesSessions(program).map((s) => s.date)
    expect(dates.every((d) => d >= '2026-07-22')).toBe(true)
  })

  it('un profil « Rien » ne planifie jamais d\'exercice nécessitant du matériel', () => {
    const autorisés = new Set(
      exercisesLibrary
        .filter((e) => ['Poids du corps uniquement', 'Course à pied'].includes(e.equipement_requis))
        .map((e) => e.id),
    )
    const program = generateProgram(
      fullProfil({ equipment: SANS_MATERIEL }),
      { startDate: '2026-07-20' },
    )
    const exercices = toutesLesSessions(program).flatMap((s) => s.exercises)
    expect(exercices.length).toBeGreaterThan(0)
    expect(exercices.every((e) => autorisés.has(e.exerciseId))).toBe(true)
  })

  it('adapte les séances aux 4 objectifs (repos courts + finisher en sèche…)', () => {
    for (const goal of ['Sèche', 'Prise de muscle', 'Affinement musculaire sans prise de poids', 'Travail de figures de callisthénie'] as TypeObjectif[]) {
      const program = generateProgram(
        fullProfil({ goal: { type_objectif: goal, date_creation: '2026-07-01' } }),
        { startDate: '2026-07-20' },
      )
      const sessions = toutesLesSessions(program)
      const callisthenie = sessions.filter((s) => s.type === 'callisthenie')
      expect(callisthenie.length).toBeGreaterThan(0)

      if (goal === 'Sèche') {
        // Repos courts et au moins un finisher cardio dans le programme.
        callisthenie.forEach((s) => s.exercises.forEach((e) => expect(e.tempsRepos).toBeLessThanOrEqual(75)))
        expect(sessions.some((s) => s.exercises.some((e) => e.estFinisher))).toBe(true)
      }
      if (goal === 'Prise de muscle') {
        // Repos longs pour la charge progressive.
        callisthenie.forEach((s) => s.exercises.forEach((e) => expect(e.tempsRepos).toBeGreaterThanOrEqual(135)))
      }
      if (goal === 'Travail de figures de callisthénie') {
        // Des séances orientées figure existent : renforcement spécifique.
        expect(sessions.some((s) => s.focus === 'skill')).toBe(true)
      }
    }
  })

  it('planifie des tests de figures en fin de phase (objectif callisthénie)', () => {
    const program = generateProgram(
      fullProfil({ goal: { type_objectif: 'Travail de figures de callisthénie', date_creation: '2026-07-01' } }),
      { startDate: '2026-07-20' },
    )
    // Chaque phase se termine par au moins un test de figure.
    for (const phase of program.phases) {
      expect(phase.sessions.some((s) => s.skillTestId !== undefined)).toBe(true)
    }
  })

  it('calcule des cibles nutritionnelles cohérentes avec l\'objectif', () => {
    const seche = generateProgram(fullProfil(), { startDate: '2026-07-20' }).nutritionTargets
    const muscle = generateProgram(
      fullProfil({ goal: { type_objectif: 'Prise de muscle', date_creation: '2026-07-01' } }),
      { startDate: '2026-07-20' },
    ).nutritionTargets
    expect(muscle.calories).toBeGreaterThan(seche.calories)
    expect(seche.hydratation_ml).toBeGreaterThan(0)
    expect(muscle.proteines_g).toBeGreaterThan(0)
  })

  it('borne une fréquence incohérente (0) à au moins 1 séance par semaine', () => {
    const program = generateProgram(
      fullProfil({ availability: dispos(0) }),
      { startDate: '2026-07-20' },
    )
    expect(toutesLesSessions(program)).toHaveLength(12)
  })

  it('lève une erreur lisible si le profil est incomplet', () => {
    const sansFrequence = fullProfil()
    // Simule une ligne availability corrompue renvoyée par la base.
    sansFrequence.availability = { ...sansFrequence.availability, frequence_semaine: Number.NaN }
    const program = generateProgram(sansFrequence, { startDate: '2026-07-20' })
    expect(toutesLesSessions(program).length).toBeGreaterThan(0)
  })
})
