import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ThemeToggle } from '../../shared/components/ThemeToggle'

export default function MobileAuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="auth-page mobile-auth">
      <ThemeToggle />
      <motion.section className="glass-card auth-card mobile-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        <div>{children}</div>
        <p className="auth-footer">{footer}</p>
      </motion.section>
    </main>
  )
}
