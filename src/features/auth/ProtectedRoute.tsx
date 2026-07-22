import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './authStore'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return <div className="page-loader">Chargement…</div>
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
