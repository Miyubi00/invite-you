-- Migrasi: tabel catatan pengiriman ulang PIN (anti-spam & anti-enumerasi).
--
-- Dipakai oleh: supabase/functions/resend-pin.
-- Hanya ditulis/dibaca service_role (RLS aktif tanpa policy publik).
-- Pola mengikuti tabel login_attempts / order_attempts.

create table if not exists public.pin_resend_attempts (
  id uuid primary key default gen_random_uuid(),
  whatsapp text not null,
  ip_address text not null default 'unknown',
  success boolean not null default false,
  attempted_at timestamptz not null default now()
);

alter table public.pin_resend_attempts enable row level security;

create index if not exists pin_resend_attempts_whatsapp_time_idx
  on public.pin_resend_attempts (whatsapp, attempted_at desc);

create index if not exists pin_resend_attempts_ip_time_idx
  on public.pin_resend_attempts (ip_address, attempted_at desc);
