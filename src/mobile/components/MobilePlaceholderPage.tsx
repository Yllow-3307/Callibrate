import { motion } from 'framer-motion'
import { ThemeToggle } from '../../shared/components/ThemeToggle'
import { BottomNavigation } from './BottomNavigation'

interface PlaceholderProps {
  title: string
  description?: string
}

export function MobilePlaceholderPage({ title, description = "Cet espace arrive très bientôt." }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24 text-[var(--color-text)]">
      <header className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]/40 backdrop-blur-md sticky top-0 z-30">
        <h1 className="text-xl font-bold">{title}</h1>
        <ThemeToggle />
      </header>

      <main className="px-6 py-12 flex flex-col items-center justify-center text-center">
        <motion.div
          className="glass-card max-w-md p-8 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 rounded-full bg-[rgb(var(--color-accent-rgb))]/10 flex items-center justify-center text-[rgb(var(--color-accent-rgb))]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold">{title}</h2>
          <p className="text-[var(--color-text-muted)] leading-relaxed">{description}</p>
        </motion.div>
      </main>

      <BottomNavigation />
    </div>
  )
}
