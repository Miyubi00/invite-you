// ============================================================
// src/lib/supabaseClient.ts
// ------------------------------------------------------------
// Client Supabase utama (anon key) untuk seluruh aplikasi. Fail-fast bila env VITE_SUPABASE_URL/ANON_KEY tidak tersedia.
// Dipakai di  : Hampir semua pages, components, dan lib
// Keterikatan : @supabase/supabase-js, env VITE_SUPABASE_*
// ============================================================

import { createClient } from '@supabase/supabase-js';

// NOTE: The client is intentionally created without the codegen `Database`
// generic. Supabase's runtime schema (columns, RLS, functions) is generated
// separately in SQL; the app's row shapes are typed at the boundaries via the
// `Row` interfaces in `src/types/database.ts` (state, props, and result casts).

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail fast dengan pesan yang jelas alih-alih error runtime samar.
  throw new Error(
    'Supabase belum dikonfigurasi: set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
  );
}

/**
 * CLIENT A — klien aplikasi (publik + admin).
 *
 * DIBUAT TANPA opsi `accessToken`. Di supabase-js, opsi tersebut mengganti
 * `supabase.auth` dengan Proxy yang melempar error untuk SEMUA properti,
 * sehingga getSession/onAuthStateChange/signInWithPassword/signOut tidak
 * bisa dipakai. Klien ini harus tetap klien Supabase Auth standar.
 *
 * Autentikasi pelanggan (JWT ber-claim order_id) ada di
 * `customerClient.ts` — JANGAN menambahkan accessToken di sini.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
