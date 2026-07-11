import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing Supabase env vars. VITE_SUPABASE_URL is ${supabaseUrl ? 'set' : 'MISSING'}, ` +
    `VITE_SUPABASE_ANON_KEY is ${supabaseAnonKey ? 'set' : 'MISSING'}. ` +
    `Check Vercel → Settings → Environment Variables, then redeploy.`
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
