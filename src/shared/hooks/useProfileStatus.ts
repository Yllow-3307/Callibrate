import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/** Vérifie si l'utilisateur a un profil complet (profiles + programs) */
export async function hasCompletedProfile(userId: string): Promise<boolean> {
  try {
    const [profileResult, programResult] = await Promise.all([
      supabase.from('profiles').select('id').eq('user_id', userId).limit(1).maybeSingle(),
      supabase.from('programs').select('id').eq('user_id', userId).limit(1).maybeSingle(),
    ])
    return Boolean(profileResult.data && programResult.data)
  } catch {
    return false
  }
}

export function useProfileStatus(userId: string | null | undefined) {
  const [complete, setComplete] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setComplete(false)
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    hasCompletedProfile(userId)
      .then((result) => {
        if (active) {
          setComplete(result)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setComplete(false)
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [userId])

  return { complete, loading }
}
