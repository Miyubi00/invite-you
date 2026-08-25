// ============================================================
// src/lib/apiHeaders.ts
// ------------------------------------------------------------
// Header autentikasi untuk fetch() manual ke Edge Functions. Prioritas token: JWT customer > sesi admin > anon.
// Dipakai di  : hooks/useEditActions, hooks/useFileUpload
// Keterikatan : lib/customerClient, lib/supabaseClient, env VITE_SUPABASE_*
// ============================================================

// Header autentikasi untuk pemanggilan Edge Functions via fetch manual.
//
// Prioritas token (sama dengan hook accessToken di customerClient):
//   1. JWT pelanggan ber-claim order_id  -> otorisasi pesanan milik sendiri
//   2. Sesi Supabase Auth (admin)        -> operasi admin
//   3. Anon                              -> akan ditolak endpoint terproteksi
//
// supabase.functions.invoke() sudah melampirkan token otomatis; helper ini
// untuk jalur fetch() mentah.

import { getCustomerToken } from './customerClient';
import { supabase } from './supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function buildApiHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { apikey: SUPABASE_ANON_KEY };

  const customer = getCustomerToken();
  if (customer) {
    headers.Authorization = `Bearer ${customer}`;
    return headers;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

export function functionsUrl(name: string): string {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}
