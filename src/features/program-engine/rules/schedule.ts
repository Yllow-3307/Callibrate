import type { AvailabilityData, WeeklySlot } from '../types'

/**
 * Répartition des séances dans la semaine à partir des disponibilités.
 * Règles pures : aucune dépendance à React ou Supabase.
 *
 * Jours au format ISO : 1 = lundi … 7 = dimanche.
 * Les motifs privilégient l'espacement des séances (récupération) :
 * aucun motif ne place deux séances deux jours de suite quand c'est évitable.
 */

/** Motifs de jours par fréquence hebdomadaire déclarée. */
const MOTIFS_FREQUENCE: Record<number, number[]> = {
  1: [2],
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 7],
  7: [1, 2, 3, 4, 5, 6, 7],
}

/** Ajoute des minutes à une heure 'HH:mm' et borne le résultat à une heure max. */
function decalerHeure(heure: string, minutes: number, borneMax?: string): string {
  const [h, m] = heure.split(':').map(Number)
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59)
  const max = borneMax ? Number(borneMax.split(':')[0]) * 60 + Number(borneMax.split(':')[1]) : 23 * 60 + 59
  const bornees = Math.min(total, max)
  const hh = String(Math.floor(bornees / 60)).padStart(2, '0')
  const mm = String(bornees % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

/**
 * Déduit les créneaux hebdomadaires d'entraînement.
 *
 * - `availability.frequence_semaine` détermine le nombre de créneaux
 *   (borné entre 1 et 7, les valeurs hors limites sont corrigées).
 * - `availability.preference_horaire` déduit l'heure suggérée :
 *   « Matin » → 1 h après le réveil,
 *   « Soir »  → 1 h après la fin du travail (bornée à 2 h avant le coucher),
 *   « Variable selon les jours » → alternance matin / soir selon le créneau.
 *
 * L'heure suggérée est indicative : la table sessions ne stocke que la date
 * (date_prevue), l'heure sert aux écrans futurs.
 */
export function buildWeeklySchedule(availability: AvailabilityData): WeeklySlot[] {
  const frequence = Math.min(Math.max(Math.round(availability.frequence_semaine) || 1, 1), 7)
  const jours = MOTIFS_FREQUENCE[frequence]

  const heureMatin = decalerHeure(availability.heure_reveil, 60)
  // Le soir, la séance doit laisser au moins 2 h avant le coucher.
  const finTravail = availability.heure_travail_fin
  const coucherMoins2h = decalerHeure(availability.heure_coucher, -120)
  const heureSoir = decalerHeure(finTravail, 60, coucherMoins2h)

  return jours.map((jourSemaine, index) => {
    let heureSuggeree: string
    if (availability.preference_horaire === 'Matin') heureSuggeree = heureMatin
    else if (availability.preference_horaire === 'Soir') heureSuggeree = heureSoir
    else heureSuggeree = index % 2 === 0 ? heureMatin : heureSoir
    return { jourSemaine, heureSuggeree }
  })
}
