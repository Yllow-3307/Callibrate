import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  DumbbellIcon,
  AppleIcon,
  TrendingUpIcon,
  SettingsIcon,
  ActivityIcon,
  CalendarIcon
} from './Icons'

// Les menus principaux demandés : Accueil/Tableau de bord, Séances, Nutrition, Programme, Progrès, Mesures, Paramètres
const NAV_ITEMS = [
  { path: '/tableau-de-bord', label: 'Accueil', icon: HomeIcon },
  { path: '/seances', label: 'Séances', icon: DumbbellIcon },
  { path: '/nutrition', label: 'Nutrition', icon: AppleIcon },
  { path: '/programme', label: 'Programme', icon: CalendarIcon },
  { path: '/progres', label: 'Progrès', icon: TrendingUpIcon },
  { path: '/mesures', label: 'Mesures', icon: ActivityIcon },
  { path: '/parametres', label: 'Paramètres', icon: SettingsIcon },
]

export function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/80 backdrop-blur-lg border-t border-[var(--color-border-strong)] px-2 pb-safe shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center flex-1 h-full relative focus:outline-none transition-colors"
              style={{ color: isActive ? 'rgb(var(--color-accent-rgb))' : 'var(--color-text-muted)' }}
              aria-label={item.label}
            >
              {isActive && (
                <motion.span
                  layoutId="activeNavBackground"
                  className="absolute inset-x-1 inset-y-1 rounded-xl bg-white/10 z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <Icon className="w-5 h-5 transition-transform duration-200" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }} />
                <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
