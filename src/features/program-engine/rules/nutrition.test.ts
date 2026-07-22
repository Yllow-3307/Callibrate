import { describe, expect, it } from 'vitest'
import type { TypeObjectif } from '../types'
import {
  buildNutritionTargets,
  calculateBMR,
  calculateHydrationTarget,
  calculateMacroTargets,
  calculateTDEE,
} from './nutrition'

const OBJECTIFS: TypeObjectif[] = [
  'Sèche',
  'Prise de muscle',
  'Affinement musculaire sans prise de poids',
  'Travail de figures de callisthénie',
]

describe('calculateBMR (Mifflin-St Jeor)', () => {
  it('applique la formule pour un homme', () => {
    // 10 × 75 + 6,25 × 178 − 5 × 28 + 5 = 1727,5 → 1728
    expect(calculateBMR(28, 'Homme', 75, 178)).toBe(1728)
  })

  it('applique la formule pour une femme', () => {
    // 10 × 60 + 6,25 × 165 − 5 × 32 − 161 = 1310,25 → 1310
    expect(calculateBMR(32, 'Femme', 60, 165)).toBe(1310)
  })

  it('utilise la constante moyenne quand le sexe n\'est pas précisé', () => {
    expect(calculateBMR(28, 'Non précisé', 75, 178)).toBe(Math.round(10 * 75 + 6.25 * 178 - 5 * 28 - 78))
  })
})

describe('calculateTDEE', () => {
  it('applique le facteur d\'activité du niveau déclaré', () => {
    expect(calculateTDEE(1700, 'Débutant')).toBe(Math.round(1700 * 1.4))
    expect(calculateTDEE(1700, 'Confirmé')).toBe(Math.round(1700 * 1.75))
    expect(calculateTDEE(1700, 'Confirmé')).toBeGreaterThan(calculateTDEE(1700, 'Débutant'))
  })
})

describe('calculateMacroTargets', () => {
  const tdee = 2500

  it('donne des résultats différents et cohérents selon les 4 objectifs', () => {
    const parObjectif = OBJECTIFS.map((goal) => calculateMacroTargets(tdee, goal))
    // Les 4 combinaisons de macros doivent être distinctes.
    const signatures = new Set(
      parObjectif.map((m) => `${m.calories}/${m.proteines_g}/${m.glucides_g}/${m.lipides_g}`),
    )
    expect(signatures.size).toBe(4)
  })

  it('classe les calories cibles : sèche < affinement < figures < prise de muscle', () => {
    const calories = (goal: TypeObjectif) => calculateMacroTargets(tdee, goal).calories
    expect(calories('Sèche')).toBeLessThan(tdee) // déficit
    expect(calories('Affinement musculaire sans prise de poids')).toBe(tdee) // maintenance
    expect(calories('Travail de figures de callisthénie')).toBeGreaterThan(tdee)
    expect(calories('Prise de muscle')).toBeGreaterThan(calories('Travail de figures de callisthénie'))
    expect(calories('Sèche')).toBeLessThan(calories('Prise de muscle'))
  })

  it('garde des protéines élevées dans tous les cas, maximales en sèche', () => {
    const proteines = (goal: TypeObjectif) => calculateMacroTargets(tdee, goal).proteines_g
    // La sèche a le plus haut ratio protéines/calories pour protéger le muscle.
    const ratioSeche = proteines('Sèche') / calculateMacroTargets(tdee, 'Sèche').calories
    const ratioMuscle = proteines('Prise de muscle') / calculateMacroTargets(tdee, 'Prise de muscle').calories
    expect(ratioSeche).toBeGreaterThan(ratioMuscle)
    // Protéines toujours substantielles (≥ 25 % des calories à 4 kcal/g).
    for (const goal of OBJECTIFS) {
      const m = calculateMacroTargets(tdee, goal)
      expect((m.proteines_g * 4) / m.calories).toBeGreaterThanOrEqual(0.25)
    }
  })

  it('produit des valeurs physiologiquement plausibles', () => {
    for (const goal of OBJECTIFS) {
      const m = calculateMacroTargets(tdee, goal)
      expect(m.calories).toBeGreaterThan(1500)
      expect(m.calories).toBeLessThan(4000)
      expect(m.proteines_g).toBeGreaterThan(80)
      expect(m.glucides_g).toBeGreaterThan(100)
      expect(m.lipides_g).toBeGreaterThan(40)
    }
  })
})

describe('calculateHydrationTarget', () => {
  it('applique ~35 ml/kg et augmente avec le niveau d\'activité', () => {
    expect(calculateHydrationTarget(70, 'Débutant')).toBe(70 * 35 + 250)
    expect(calculateHydrationTarget(70, 'Confirmé')).toBe(70 * 35 + 1000)
    expect(calculateHydrationTarget(70, 'Confirmé')).toBeGreaterThan(calculateHydrationTarget(70, 'Débutant'))
    expect(calculateHydrationTarget(80, 'Intermédiaire')).toBeGreaterThan(calculateHydrationTarget(60, 'Intermédiaire'))
  })
})

describe('buildNutritionTargets', () => {
  it('combine macros et hydratation pour un profil complet', () => {
    const cibles = buildNutritionTargets(
      { age: 28, sexe: 'Homme', poids: 75, taille: 178, niveau_sport: 'Intermédiaire' },
      'Sèche',
    )
    expect(cibles.calories).toBeGreaterThan(0)
    expect(cibles.proteines_g).toBeGreaterThan(0)
    expect(cibles.glucides_g).toBeGreaterThan(0)
    expect(cibles.lipides_g).toBeGreaterThan(0)
    expect(cibles.hydratation_ml).toBe(75 * 35 + 500)
  })
})
