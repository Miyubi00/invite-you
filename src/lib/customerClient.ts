// ============================================================
// src/lib/customerClient.ts
// ------------------------------------------------------------
// Client Supabase konteks customer: kelola JWT custom ber-claim order_id (dari Edge Function customer-login) via resolveDbClient/set/getCustomerToken.
// Dipakai di  : CustomerLoginPage, hooks (dashboard/edit/upload/rsvp), lib/apiHeaders
// Keterikatan : @supabase/supabase-js, lib/supabaseClient
// ============================================================

// CLIENT B — klien khusus autentikasi pelanggan dashboard mempelai.
//
// JWT ber-claim `order_id` diterbitkan Edge Function `customer-login`
// setelah verifikasi WhatsApp+PIN. RLS memakai claim tersebut untuk
// membatasi seluruh query pada satu pesanan milik pemanggil.
//
// ATURAN PAKAI:
// - JANGAN mengakses `customerSupabase.auth.*` (supabase-js menjadikan
//   `.auth` Proxy yang melempar error pada klien dengan accessToken).
// - Untuk hook yang dipakai BAIK pelanggan MAUPUN admin, pakai
//   `resolveDbClient()` agar konteks kredensial yang benar yang terpakai.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const CUSTOMER_TOKEN_KEY = 'loverse_customer_token';

export function getCustomerToken(): string | null {
  try {
    return sessionStorage.getItem(CUSTOMER_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setCustomerToken(token: string): void {
  try {
    sessionStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  } catch {
    /* storage penuh/diblokir — login tetap berhasil tapi query akan gagal 403 */
  }
}

export function clearCustomerToken(): void {
  try {
    sessionStorage.removeItem(CUSTOMER_TOKEN_KEY);
  } catch {
    /* noop */
  }
}

/** Baca klaim `exp` dari JWT customer (tanpa verifikasi — hanya untuk UX refresh). */
function getTokenExp(token: string): number | null {
  try {
    // base64url -> base64: ganti alfabet lalu tambahkan padding '='
    // (wajib untuk atob; payload JWT lazim tanpa padding).
    let b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const payload = JSON.parse(atob(b64)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

/**
 * Perpanjang sesi customer tanpa PIN: kirim JWT lama ke `customer-login`
 * (mode refresh). Hasil:
 *   true  -> token layak dipakai (masih panjang ATAU berhasil di-refresh)
 *   false -> tidak ada token ATAU refresh ditolak (melewati batas sesi)
 */
export async function refreshCustomerToken(): Promise<boolean> {
  const token = getCustomerToken();
  if (!token) return false;
  const exp = getTokenExp(token);
  // Masih jauh dari kedaluwarsa (> 30 menit) — tidak perlu refresh.
  if (exp && exp - Date.now() / 1000 > 30 * 60) return true;
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/customer-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ refresh: true }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) return false;
    setCustomerToken(data.access_token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Klien pelanggan: setiap REST/functions request membawa JWT pelanggan.
 * Bila token tidak ada, supabase-js otomatis jatuh ke anon key
 * (`_getAccessToken ?? supabaseKey`) sehingga tetap dibatasi RLS ketat.
 */
export const customerSupabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    accessToken: async () => getCustomerToken(),
  },
);

/**
 * Resolusi klien DB sesuai konteks kredensial aktif:
 *   token pelanggan ada -> customerSupabase (JWT order_id)
 *   otherwise           -> supabase (sesi admin Supabase Auth / anon)
 *
 * Dipakai hook bersama yang berjalan di dashboard mempelai DAN admin panel
 * (mis. upload media), karena policy RLS `is_admin()` hanya bisa dicapai
 * lewat sesi admin pada klien standar.
 */
export function resolveDbClient(): SupabaseClient {
  return getCustomerToken() ? customerSupabase : supabase;
}
