import { describe, expect, it } from 'vitest'
import type { EquipmentData, ProfileData } from '../types'
import { exercisesLibrary } from '../data/exercisesLibrary'
import { exerciceDisponible, selectExercisesForProfile } from './exerciseSelection'

const profilBase: ProfileData = {
  age: 28,
  sexe: 'Homme',
  poids: 75,
  taille: 178,
  niveau_sport: 'Intermédiaire',
}

const EQUIPEMENTS_MATERIEL = ['Salle de sport', 'Parc de street workout', 'Équipement personnel', 'Vélo', 'Corde à sauter']

describe('selectExercisesForProfile', () => {
  it('un utilisateur avec équipement « Rien » ne reçoit jamais d\'exercice nécessitant du matériel', () => {
    const equipment: EquipmentData[] = [{ type: 'Rien', details_perso: null, equipement_endurance: 'Aucun' }]
    const selection = selectExercisesForProfile(profilBase, 'Sèche', equipment, 'Intermédiaire')

    expect(selection.length).toBeGreaterThan(0)
    for (const exercice of selection) {
      // Seuls le poids du corps et la course à pied (sans matériel) sont autorisés.
      expect(EQUIPEMENTS_MATERIEL).not.toContain(exercice.equipement_requis)
      expect(['Poids du corps uniquement', 'Course à pied']).toContain(exercice.equipement_requis)
    }
  })

  it('« Poids du corps uniquement » se comporte comme « Rien »', () => {
    const equipment: EquipmentData[] = [{ type: 'Poids du corps uniquement', details_perso: null, equipement_endurance: 'Aucun' }]
    const selection = selectExercisesForProfile(profilBase, 'Prise de muscle', equipment, 'Avancé')
    expect(selection.length).toBeGreaterThan(0)
    expect(selection.every((e) => ['Poids du corps uniquement', 'Course à pied'].includes(e.equipement_requis))).toBe(true)
  })

  it('un utilisateur avec « Salle de sport » accède aux exercices salle ET parc', () => {
    const equipment: EquipmentData[] = [{ type: 'Salle de sport', details_perso: null, equipement_endurance: 'Aucun' }]
    const selection = selectExercisesForProfile(profilBase, 'Prise de muscle', equipment, 'Intermédiaire')
    expect(selection.some((e) => e.equipement_requis === 'Salle de sport')).toBe(true)
    expect(selection.some((e) => e.equipement_requis === 'Parc de street workout')).toBe(true)
  })

  it('un débutant ne reçoit jamais d\'exercice avancé ou confirmé', () => {
    const equipment: EquipmentData[] = [
      { type: 'Salle de sport', details_perso: null, equipement_endurance: 'Course à pied' },
    ]
    const selection = selectExercisesForProfile(profilBase, 'Sèche', equipment, 'Débutant')
    expect(selection.length).toBeGreaterThan(0)
    expect(selection.every((e) => e.niveau === 'Débutant')).toBe(true)
  })

  it('exclut le matériel d\'endurance non déclaré (vélo, corde)', () => {
    const equipment: EquipmentData[] = [{ type: 'Rien', details_perso: null, equipement_endurance: 'Course à pied' }]
    const selection = selectExercisesForProfile(profilBase, 'Sèche', equipment, 'Confirmé')
    const endurance = selection.filter((e) => e.categorie === 'endurance')
    expect(endurance.length).toBeGreaterThan(0)
    expect(endurance.every((e) => e.equipement_requis === 'Course à pied')).toBe(true)
  })

  it('l\'équipement personnel élastique débloque le tirage élastique, pas la salle', () => {
    const equipment: EquipmentData[] = [
      { type: 'Équipement personnel', details_perso: 'élastiques', equipement_endurance: 'Aucun' },
    ]
    const selection = selectExercisesForProfile(profilBase, 'Affinement musculaire sans prise de poids', equipment, 'Intermédiaire')
    expect(selection.some((e) => e.nom === 'Tirage élastique')).toBe(true)
    expect(selection.every((e) => e.equipement_requis !== 'Salle de sport')).toBe(true)
  })

  it('le tri privilégie le poids du corps pour la sèche et la salle pour la prise de muscle', () => {
    const equipment: EquipmentData[] = [
      { type: 'Salle de sport', details_perso: null, equipement_endurance: 'Course à pied' },
      { type: 'Parc de street workout', details_perso: null, equipement_endurance: 'Course à pied' },
    ]
    const seche = selectExercisesForProfile(profilBase, 'Sèche', equipment, 'Intermédiaire')
    const muscle = selectExercisesForProfile(profilBase, 'Prise de muscle', equipment, 'Intermédiaire')
    expect(seche[0].categorie).toBe('callisthenie_poids_du_corps')
    expect(muscle[0].categorie).toBe('callisthenie_salle')
  })
})

describe('exerciceDisponible', () => {
  it('couvre chaque exercice : disponible uniquement avec le bon équipement', () => {
    const rien: EquipmentData[] = [{ type: 'Rien', details_perso: null, equipement_endurance: 'Aucun' }]
    for (const exercice of exercisesLibrary) {
      if (exercice.equipement_requis === 'Poids du corps uniquement' || exercice.equipement_requis === 'Course à pied') {
        expect(exerciceDisponible(exercice, rien)).toBe(true)
      } else {
        expect(exerciceDisponible(exercice, rien)).toBe(false)
      }
    }
  })
})
