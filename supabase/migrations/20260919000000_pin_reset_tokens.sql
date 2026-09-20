-- Migrasi: token konfirmasi kirim ulang PIN (alur dua tahap).
--
-- Dipakai oleh: supabase/functions/resend-pin (mode confirm/cancel).
-- Alasan keamanan: email + tanggal pernikahan HANYA PENGETAHUAN (bisa
-- diketahui tamu/kenalan), jadi permintaan kirim ulang tidak boleh langsung
-- mengganti PIN. PIN baru dibuat hanya setelah PEMILIK inbox mengeklik
-- link konfirmasi bertoken.
--
-- Keamanan:
-- - DB menyimpan SHA-256 hash token (bukan token mentah).
-- - Token kedaluwarsa 30 menit, sekali pakai (used_at), sekali pakai juga
--   berlaku untuk "Bukan saya" (revoke).
-- - RLS aktif tanpa policy -> hanya service_role (Edge Function).

create table if not exists public.pin_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  email text not null,
  wedding_date date not null,
  ip_address text not null default 'unknown',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.pin_reset_tokens enable row level security;

create index if not exists pin_reset_tokens_hash_idx
  on public.pin_reset_tokens (token_hash);

create index if not exists pin_reset_tokens_expiry_idx
  on public.pin_reset_tokens (expires_at);
