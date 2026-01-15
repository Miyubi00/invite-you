import { createClient } from '@supabase/supabase-js'

// Ambil URL & Key dari environment variables (nanti kita set di .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)