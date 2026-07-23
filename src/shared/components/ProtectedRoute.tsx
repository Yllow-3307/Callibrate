import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return (
    <div className="page-loader">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', alignItems: 'center', gap: 12 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 22,
            height: 22,
            border: '2px solid var(--color-border-strong)',
            borderTopColor: 'rgb(var(--color-accent-rgb))',
            borderRadius: '50%',
          }}
        />
        Chargement…
      </motion.div>
    </div>
  )
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
