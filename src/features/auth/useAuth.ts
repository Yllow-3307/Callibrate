import { useEffect } from 'react'
import { useAuthStore } from './authStore'

/** Initialise une seule source d'état pour la session Supabase. */
export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const initialise = useAuthStore((state) => state.initialise)

  useEffect(() => initialise(), [initialise])

  return { user, loading, isAuthenticated: Boolean(user) }
}
