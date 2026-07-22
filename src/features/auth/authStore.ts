import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../shared/lib/supabaseClient'

type AuthState = {
  user: User | null
  loading: boolean
  initialise: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialise: () => {
    let active = true

    void supabase.auth.getSession().then(({ data }) => {
      if (active) set({ user: data.session?.user ?? null, loading: false })
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) set({ user: session?.user ?? null, loading: false })
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  },
}))
