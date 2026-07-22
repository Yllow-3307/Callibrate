import { loadFullProfile } from './loadFullProfile'
import { generateProgram } from './rules/programGenerator'
import { hasActiveProgram, saveGeneratedProgram, type SaveResult } from './persistence'

/**
 * Pipeline complet déclenché après l'enregistrement du profil onboarding :
 *
 *   profil complet (Supabase) → programme généré (règles pures)
 *   → écriture en base (programs, program_phases, sessions,
 *     session_exercises, nutrition_targets)
 *
 * Idempotent : si l'utilisateur possède déjà un programme actif
 * (par exemple en revenant sur la page de transition), aucune nouvelle
 * génération n'est lancée.
 */
export interface GenerationResult {
  created: boolean
  save?: SaveResult
}

export async function generateAndSaveProgram(userId: string): Promise<GenerationResult> {
  if (await hasActiveProgram(userId)) {
    return { created: false }
  }
  const fullProfile = await loadFullProfile(userId)
  const program = generateProgram(fullProfile)
  const save = await saveGeneratedProgram(userId, program)
  return { created: true, save }
}
