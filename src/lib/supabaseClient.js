import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// NOTE: Custom PIN header removed for security.
// PIN verification happens once during login via RPC 'login_client'.
// Subsequent request auth is enforced via Supabase RLS policies (to be implemented).
// See: src/pages/DashboardLogin.jsx line 50
