import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '../../shared/components/ThemeToggle'

export default function DesktopAuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="auth-page desktop-auth">
      <ThemeToggle />
      <div className="desktop-auth-grid">
        <aside className="desktop-auth-hero">
          <h1>Callibrate</h1>
          <p>Personnalise ton parcours d'entraînement et de nutrition sur-mesure.</p>
        </aside>
        <motion.section className="glass-card auth-card desktop-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2>{title}</h2>
          {subtitle && <p className="subtitle">{subtitle}</p>}
          <div>{children}</div>
          <p className="auth-footer">{footer}</p>
        </motion.section>
      </div>
    </main>
  )
}
