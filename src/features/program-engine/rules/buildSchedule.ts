import type { UserAvailability, TimeSlot, Indisponibilite } from './types'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'] as const

export function timeToMinutes(time: string): number { const [h, m] = time.split(':').map(Number); return h * 60 + (m || 0) }
export function minutesToTime(minutes: number): string { return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0') }

function overlapsIndisponibilite(slotStart: number, slotEnd: number, indisponibilites: Indisponibilite[]): boolean {
  for (const ind of indisponibilites) { if (slotStart < timeToMinutes(ind.fin) && timeToMinutes(ind.debut) < slotEnd) return true }
  return false
}

function getCandidateWindows(a: UserAvailability): { start: number; end: number }[] {
  const reveil = timeToMinutes(a.heure_reveil); const td = timeToMinutes(a.heure_travail_debut)
  const tf = timeToMinutes(a.heure_travail_fin); const coucher = timeToMinutes(a.heure_coucher); const d = a.duree_seance
  const w: { start: number; end: number }[] = []
  if (td - reveil >= d) w.push({ start: reveil, end: td })
  if (coucher - tf >= d) w.push({ start: tf, end: coucher })
  if (a.preference_horaire === 'Matin') return w.length > 0 ? [w[0]] : []
  if (a.preference_horaire === 'Soir') return w.length > 1 ? [w[1]] : w.length > 0 ? [w[0]] : []
  return w
}

function findSlotInWindow(ws: number, we: number, d: number, indis: Indisponibilite[]): { start: number; end: number } | null {
  let c = ws
  while (c + d <= we) {
    if (!overlapsIndisponibilite(c, c + d, indis)) return { start: c, end: c + d }
    for (const ind of indis) { const is = timeToMinutes(ind.debut); const ie = timeToMinutes(ind.fin); if (c < ie && is < c + d) { c = ie; break } }
    if (c + d > we) break
  }
  return null
}

export function buildWeeklySchedule(availability: UserAvailability): TimeSlot[] {
  const { frequence_semaine: freq, duree_seance: duree, indisponibilites: indis = [] } = availability
  if (freq <= 0 || duree <= 0) return []
  const windows = getCandidateWindows(availability)
  if (windows.length === 0) return []
  const slots: TimeSlot[] = []; let ji = 0; let wi = 0; let placed = 0
  while (placed < freq && ji < JOURS.length * 2) {
    const slot = findSlotInWindow(windows[wi % windows.length].start, windows[wi % windows.length].end, duree, indis)
    if (slot) {
      slots.push({ jour: JOURS[ji % JOURS.length], heure_debut: minutesToTime(slot.start), heure_fin: minutesToTime(slot.end), type: placed % 2 === 0 ? 'callisthenie' : 'endurance' })
      placed++
    }
    ji++; if (windows.length > 1) wi++
  }
  return slots
}
