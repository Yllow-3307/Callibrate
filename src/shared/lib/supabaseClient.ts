import { createClient } from '@supabase/supabase-js'

// Les valeurs sont fournies localement via le fichier .env non versionné.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
