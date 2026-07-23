import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '../../../shared/components/ThemeToggle'
import { BottomNavigation } from '../../components/BottomNavigation'
import { Button } from '../../../shared/components/Button'

// Noms abrégés des jours
const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

interface WeekDay {
  name: string
  dateStr: string
  dateObj: Date
  isToday: boolean
  isWorkoutPlanned: boolean
  isRestPlanned: boolean
  isCompleted: boolean
}

export default function MobileDashboardPlaceholder() {
  // --- États persistés pour Streak et Séances ---
  const [streak, setStreak] = useState(3)
  const [completedSessions, setCompletedSessions] = useState(2)
  const weeklyTarget = 4

  // --- Initialisation du Calendrier Hebdomadaire dynamique ---
  const [weekDays, setWeekDays] = useState<WeekDay[]>([])

  useEffect(() => {
    // Récupérer streak / completed de localStorage si présents
    const savedStreak = localStorage.getItem('dashboard_streak')
    if (savedStreak) setStreak(Number(savedStreak))
    else localStorage.setItem('dashboard_streak', '3')

    const savedCompleted = localStorage.getItem('dashboard_completed_sessions')
    if (savedCompleted) setCompletedSessions(Number(savedCompleted))
    else localStorage.setItem('dashboard_completed_sessions', '2')

    // On calcule les jours de la semaine courante (du Lundi au Dimanche)
    const today = new Date()
    const currentDay = today.getDay() // 0 = Dim, 1 = Lun, etc.
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay

    const monday = new Date(today)
    monday.setDate(today.getDate() + distanceToMonday)

    // On récupère les états cochés/validés depuis le localStorage pour chaque jour
    const formattedDays: WeekDay[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)

      const dateStr = d.toISOString().slice(0, 10)
      const isToday = d.toDateString() === today.toDateString()

      // Définition d'un motif fictif régulier :
      // Lundi (1), Mercredi (3), Vendredi (5), Samedi (6) = Entraînement
      // Mardi (2), Jeudi (4), Dimanche (0) = Repos
      const dayOfWeek = d.getDay()
      const isWorkoutPlanned = [1, 3, 5, 6].includes(dayOfWeek)
      const isRestPlanned = !isWorkoutPlanned

      // Vérification dans localStorage si complété
      const savedCompletedState = localStorage.getItem(`day_completed_${dateStr}`)
      const isCompleted = savedCompletedState ? savedCompletedState === 'true' : (dayOfWeek === 1 || dayOfWeek === 3) // Lundi & Mercredi complétés par défaut pour la démo

      return {
        name: DAYS_SHORT[dayOfWeek],
        dateStr,
        dateObj: d,
        isToday,
        isWorkoutPlanned,
        isRestPlanned,
        isCompleted,
      }
    })

    setWeekDays(formattedDays)
  }, [completedSessions])

  // --- Interaction : Pouvoir cliquer sur un jour pour valider/annuler une séance ---
  const handleToggleDay = (day: WeekDay) => {
    const nextCompleted = !day.isCompleted
    localStorage.setItem(`day_completed_${day.dateStr}`, String(nextCompleted))

    // Mettre à jour l'état local du jour
    setWeekDays((curr) =>
      curr.map((d) => (d.dateStr === day.dateStr ? { ...d, isCompleted: nextCompleted } : d))
    )

    // Ajuster le nombre de séances réalisées cette semaine de manière logique
    const diff = nextCompleted ? 1 : -1
    const newCompleted = Math.max(0, completedSessions + diff)
    setCompletedSessions(newCompleted)
    localStorage.setItem('dashboard_completed_sessions', String(newCompleted))

    // Simulation intelligente de la flamme/streak
    if (nextCompleted && day.isToday) {
      const newStreak = streak + 1
      setStreak(newStreak)
      localStorage.setItem('dashboard_streak', String(newStreak))
    } else if (!nextCompleted && day.isToday) {
      const newStreak = Math.max(0, streak - 1)
      setStreak(newStreak)
      localStorage.setItem('dashboard_streak', String(newStreak))
    }
  }

  // --- Widget Musique ---
  // On détermine le type de séance aujourd'hui :
  // Si aujourd'hui est un jour d'entraînement => Callisthénie, sinon Cardio
  const todayOfWeek = new Date().getDay()
  const isWorkoutDay = [1, 3, 5, 6].includes(todayOfWeek)
  const sessionType = isWorkoutDay ? 'callisthénie' : 'cardio'

  const handleMusicClick = () => {
    // Charger la playlist personnalisée ou par défaut
    const customPlaylist = localStorage.getItem(`playlist_${sessionType}`)
    const defaultPlaylist = 'https://open.spotify.com/playlist/37i9dQZF1DX76t638V6eg8' // Spotify Workout
    const targetUrl = customPlaylist || defaultPlaylist
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24 text-[var(--color-text)]">
      {/* Header avec bouton ThemeToggle */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-md sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Callibrate</h1>
          <p className="text-[11px] text-[var(--color-text-muted)] font-medium">Tableau de bord</p>
        </div>
        <ThemeToggle />
      </header>

      <main className="px-5 py-6 max-w-md mx-auto flex flex-col gap-5">
        {/* Streak & Sessions de la semaine */}
        <section className="grid grid-cols-2 gap-4">
          <motion.div
            className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className="text-3xl" role="img" aria-label="streak">🔥</span>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold leading-none">{streak} jours</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold">Série en cours</span>
            </div>
          </motion.div>

          <motion.div
            className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1.5"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <span className="text-3xl" role="img" aria-label="workouts">🏋️</span>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold leading-none">{completedSessions} / {weeklyTarget}</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-bold">Séances cette semaine</span>
            </div>
          </motion.div>
        </section>

        {/* Jauge de progression animée */}
        <section className="glass-card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold">Progression du Programme</span>
              <span className="text-base font-extrabold">Début de parcours</span>
            </div>
            <span className="text-lg font-black text-[rgb(var(--color-accent-rgb))]">15 %</span>
          </div>

          {/* Track de la jauge */}
          <div className="h-3.5 w-full bg-[var(--color-surface)] rounded-full overflow-hidden border border-[var(--color-border)] p-0.5 relative">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--color-accent-rgb))] to-[rgba(var(--color-accent-rgb),0.85)] shadow-[0_0_12px_rgba(var(--color-accent-rgb),0.45)]"
              initial={{ width: '0%' }}
              animate={{ width: '15%' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </section>

        {/* Calendrier de la semaine courante */}
        <section className="glass-card p-5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold">Ta semaine courante</span>
            <span className="text-[10px] text-[var(--color-text-muted)] italic">Clique sur un jour pour valider</span>
          </div>

          <div className="flex justify-between gap-1.5">
            {weekDays.map((day) => {
              const isWorkout = day.isWorkoutPlanned
              const isCompleted = day.isCompleted

              return (
                <button
                  key={day.dateStr}
                  onClick={() => handleToggleDay(day)}
                  className={`flex flex-col items-center flex-1 py-3 rounded-2xl border transition-all relative overflow-hidden ${
                    day.isToday
                      ? 'bg-[rgb(var(--color-accent-rgb))]/10 border-[rgb(var(--color-accent-rgb))] scale-105 shadow-md z-10'
                      : 'bg-[var(--color-surface)]/20 border-[var(--color-border)] hover:bg-[var(--color-surface)]/40'
                  }`}
                  style={{ minHeight: '80px' }}
                >
                  <span className="text-[10px] font-bold opacity-60 uppercase mb-1">{day.name}</span>
                  <span className="text-xs font-black mb-2">{day.dateObj.getDate()}</span>

                  {/* Marqueur d'état */}
                  <div className="mt-auto flex items-center justify-center">
                    {isCompleted ? (
                      <span className="text-xs text-[rgb(var(--color-accent-rgb))] font-extrabold" role="img" aria-label="done">✓</span>
                    ) : isWorkout ? (
                      <span className="w-2 h-2 rounded-full bg-[rgb(var(--color-accent-warm-rgb))]" />
                    ) : (
                      <span className="text-[9px] text-[var(--color-text-muted)] font-medium">Repos</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Widget Musique */}
        <section className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden">
          {/* Background décoratif musical abstrait */}
          <div className="absolute right-2 -bottom-2 opacity-5 pointer-events-none transform rotate-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-bold">Musique & Ambiance</span>
            <h3 className="text-lg font-extrabold tracking-tight">Motiver ta séance du jour</h3>
          </div>

          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            Boost tes performances en lançant ta playlist dynamique adaptée aux entraînements de <strong className="text-[rgb(var(--color-accent-rgb))]">{sessionType}</strong> !
          </p>

          <Button
            onClick={handleMusicClick}
            variant="warm"
            size="md"
            style={{ width: '100%', gap: '10px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Écouter ma playlist du jour
          </Button>
        </section>
      </main>

      {/* Barre de navigation fixe en bas */}
      <BottomNavigation />
    </div>
  )
}
