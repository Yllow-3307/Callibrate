import { supabase } from '../../shared/lib/supabaseClient'
import type { GeneratedProgram } from './types'

/**
 * Persiste un programme généré dans Supabase.
 *
 * Ordre d'écriture (respect des clés étrangères) :
 *   programs → program_phases → sessions → session_exercises
 * puis upsert dans nutrition_targets (user_id unique).
 *
 * En cas d'échec en cours de route, le programme partiellement écrit est
 * supprimé (la cascade programs → phases/sessions → session_exercises
 * nettoie le reste), puis l'erreur est relancée.
 */

export interface SaveResult {
  programId: string
  sessionsCount: number
  exercisesCount: number
}

/** Indique si l'utilisateur possède déjà un programme actif. */
export async function hasActiveProgram(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', userId)
    .eq('statut', 'actif')
    .limit(1)
  if (error) throw new Error('Impossible de vérifier tes programmes existants.')
  return (data?.length ?? 0) > 0
}

/**
 * Écrit le programme en base. Idempotence gérée par l'appelant
 * (generateAndSaveProgram.ts vérifie d'abord hasActiveProgram).
 */
export async function saveGeneratedProgram(userId: string, program: GeneratedProgram): Promise<SaveResult> {
  // 1. Versioning : un nouvel enregistrement = version suivante ; les anciens
  //    programmes éventuels passent en « archive ».
  const { count } = await supabase
    .from('programs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
  const version = (count ?? 0) + 1

  await supabase.from('programs').update({ statut: 'archive' }).eq('user_id', userId).eq('statut', 'actif')

  const { data: programRow, error: programError } = await supabase
    .from('programs')
    .insert({ user_id: userId, version, statut: 'actif' })
    .select('id')
    .single()
  if (programError || !programRow) {
    throw new Error("L'enregistrement du programme a échoué. Réessaie dans un instant.")
  }
  const programId = programRow.id as string

  try {
    let sessionsCount = 0
    let exercisesCount = 0

    // 2. Phases, puis leurs séances, puis les exercices de chaque séance.
    for (const phase of program.phases) {
      const { data: phaseRow, error: phaseError } = await supabase
        .from('program_phases')
        .insert({
          program_id: programId,
          ordre: phase.ordre,
          nom_phase: phase.nomPhase,
          criteres_progression: phase.criteresProgression,
        })
        .select('id')
        .single()
      if (phaseError || !phaseRow) throw new Error("L'enregistrement des phases du programme a échoué.")
      const phaseId = phaseRow.id as string

      for (const session of phase.sessions) {
        const { data: sessionRow, error: sessionError } = await supabase
          .from('sessions')
          .insert({
            program_id: programId,
            phase_id: phaseId,
            date_prevue: session.date,
            type: session.type,
          })
          .select('id')
          .single()
        if (sessionError || !sessionRow) throw new Error("L'enregistrement des séances a échoué.")
        const sessionId = sessionRow.id as string
        sessionsCount += 1

        const lignes = session.exercises.map((exercice) => ({
          session_id: sessionId,
          exercise_id: exercice.exerciseId,
          series: exercice.series,
          reps: exercice.reps,
          temps_repos: exercice.tempsRepos,
        }))
        if (lignes.length > 0) {
          const { error: exercicesError } = await supabase.from('session_exercises').insert(lignes)
          if (exercicesError) throw new Error("L'enregistrement des exercices des séances a échoué.")
          exercisesCount += lignes.length
        }
      }
    }

    // 3. Cibles nutritionnelles : une ligne unique par utilisateur.
    const { error: nutritionError } = await supabase
      .from('nutrition_targets')
      .upsert(
        {
          user_id: userId,
          macros_cibles: {
            calories: program.nutritionTargets.calories,
            proteines_g: program.nutritionTargets.proteines_g,
            glucides_g: program.nutritionTargets.glucides_g,
            lipides_g: program.nutritionTargets.lipides_g,
          },
          hydratation_cible: program.nutritionTargets.hydratation_ml,
        },
        { onConflict: 'user_id' },
      )
    if (nutritionError) throw new Error("L'enregistrement des cibles nutritionnelles a échoué.")

    return { programId, sessionsCount, exercisesCount }
  } catch (error) {
    // Nettoyage du programme partiellement écrit.
    await supabase.from('programs').delete().eq('id', programId)
    throw error
  }
}
