import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useProfileStatus } from '../hooks/useProfileStatus'
import type { ReactNode } from 'react'

export function ProfileRedirect({ children, target }: { children?: ReactNode; target?: string }) {
  const user = useAuthStore((state) => state.user)
  const { complete, loading } = useProfileStatus(user?.id)

  if (loading) return (
    <div className="page-loader">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 22, height: 22, border: '2px solid var(--color-border-strong)', borderTopColor: 'rgb(var(--color-accent-rgb))', borderRadius: '50%' }} />
        Chargement…
      </motion.div>
    </div>
  )
  if (target === '/tableau-de-bord' && complete === false) return <Navigate to="/onboarding" replace />
  if (target === '/onboarding' && complete === true) return <Navigate to="/tableau-de-bord" replace />
  return <>{children}</>
}
