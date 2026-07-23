/**
 * Tests d'invariants pour les corrections A1/A2/A3.
 * On n'importe pas les modules (le supabaseClient s'initialise au chargement)
 * — on lit les fichiers et on vérifie que les bonnes choses sont câblées.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'

function read(rel: string) {
  return readFileSync(rel, 'utf8')
}

describe('A1 — useOnboardingLogic exporte les sélecteurs nécessaires', () => {
  it('déclare equipmentChoices, personalEquipmentOptions, enduranceOptions', () => {
    const src = read('src/shared/hooks/useOnboardingLogic.ts')
    expect(src).toMatch(/export const equipmentChoices = \[/)
    expect(src).toMatch(/export const personalEquipmentOptions = \[/)
    expect(src).toMatch(/export const enduranceOptions = \[/)
    expect(src).toContain("'Kettlebell'")
    expect(src).toContain("'Barre de traction'")
    expect(src).toContain("'Banc'")
    expect(src).toContain("'Haltères'")
    expect(src).toContain("'Élastique de résistance'")
    expect(src).toContain("'Course à pied'")
    expect(src).toContain("'Vélo'")
    expect(src).toContain("'Piscine'")
    expect(src).toContain("'Rameur'")
    expect(src).toContain("'Corde à sauter'")
  })

  it('Équipement personnel fait partie des equipmentChoices principales', () => {
    const src = read('src/shared/hooks/useOnboardingLogic.ts')
    expect(src).toContain("'Équipement personnel'")
  })

  it('expose togglePersonalEquipment et toggleEndurance', () => {
    const src = read('src/shared/hooks/useOnboardingLogic.ts')
    expect(src).toMatch(/function togglePersonalEquipment\(/)
    expect(src).toMatch(/function toggleEndurance\(/)
  })

  it('validStep exige au moins une sélection d\'endurance', () => {
    const src = read('src/shared/hooks/useOnboardingLogic.ts')
    expect(src).toMatch(/step === 3.*endurance\.length > 0/s)
  })
})

describe('A2 — la sidebar desktop est stylée (pas de puces navigateur)', () => {
  it('DesktopOnboardingWizard utilise la classe .desktop-sidebar-list', () => {
    const src = read('src/desktop/features/onboarding/DesktopOnboardingWizard.tsx')
    expect(src).toContain('desktop-sidebar-list')
  })

  it('CSS supprime list-style et marges sur .desktop-sidebar-list', () => {
    const css = read('src/index.css')
    expect(css).toMatch(/\.desktop-sidebar-list\s*\{[^}]*list-style:\s*none/s)
    expect(css).toMatch(/\.desktop-sidebar-list\s*\{[^}]*padding:\s*0/s)
    expect(css).toMatch(/\.desktop-sidebar-list\s*\{[^}]*margin:\s*0/s)
  })

  it('CSS définit .wizard-subsection pour le sous-bloc équipement perso / endurance', () => {
    const css = read('src/index.css')
    expect(css).toContain('.wizard-subsection')
  })
})

describe('A3 — bug 1 : pas de redirection synchrone au render vers /onboarding', () => {
  it('MobileSignInPage ne renvoie plus <Navigate to="/onboarding" /> au render', () => {
    const src = read('src/mobile/features/auth/MobileSignInPage.tsx')
    expect(src).not.toMatch(/if\s*\(\s*user\s*\)\s*\{?\s*return\s+<Navigate[^>]*to="\/onboarding"/)
  })

  it('DesktopSignInPage ne renvoie plus <Navigate to="/onboarding" /> au render', () => {
    const src = read('src/desktop/features/auth/DesktopSignInPage.tsx')
    expect(src).not.toMatch(/if\s*\(\s*user\s*\)\s*\{?\s*return\s+<Navigate[^>]*to="\/onboarding"/)
  })

  it('Les deux pages délèguent la redirection à un useEffect via hasCompletedProfile', () => {
    const mobile = read('src/mobile/features/auth/MobileSignInPage.tsx')
    const desktop = read('src/desktop/features/auth/DesktopSignInPage.tsx')
    expect(mobile).toContain('hasCompletedProfile')
    expect(desktop).toContain('hasCompletedProfile')
    expect(mobile).toMatch(/useEffect/)
    expect(desktop).toMatch(/useEffect/)
  })
})

describe('A4 — bug 2 : les wizards câblent la sous-sélection équipement', () => {
  it('MobileOnboardingWizard importe personalEquipmentOptions et enduranceOptions', () => {
    const src = read('src/mobile/features/onboarding/MobileOnboardingWizard.tsx')
    expect(src).toContain('personalEquipmentOptions')
    expect(src).toContain('enduranceOptions')
    expect(src).toContain('togglePersonalEquipment')
    expect(src).toContain('toggleEndurance')
    expect(src).toContain('detailsPersoAutre')
  })

  it('DesktopOnboardingWizard importe personalEquipmentOptions et enduranceOptions', () => {
    const src = read('src/desktop/features/onboarding/DesktopOnboardingWizard.tsx')
    expect(src).toContain('personalEquipmentOptions')
    expect(src).toContain('enduranceOptions')
    expect(src).toContain('togglePersonalEquipment')
    expect(src).toContain('toggleEndurance')
    expect(src).toContain('detailsPersoAutre')
  })
})
