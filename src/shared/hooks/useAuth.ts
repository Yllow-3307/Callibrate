import { useEffect } from 'react'
import { useAuthStore, type AuthState } from '../store/authStore'

/** Initialise une seule source d'état pour la session Supabase. */
export function useAuth() {
  const user = useAuthStore((state: AuthState) => state.user)
  const loading = useAuthStore((state: AuthState) => state.loading)
  const initialise = useAuthStore((state: AuthState) => state.initialise)

  useEffect(() => {
    const cleanup = initialise()
    return cleanup
  }, [initialise])

  return { user, loading }
}