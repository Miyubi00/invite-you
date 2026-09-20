-- Migrasi: catatan kirim ulang PIN kini berbasis EMAIL pemesanan + tanggal
-- pernikahan (sebelumnya berbasis No. WhatsApp).
--
-- Dipakai oleh: supabase/functions/resend-pin.
-- Perubahan:
--   1. kolom `email` ditambahkan sebagai identitas rate limit yang baru;
--   2. `whatsapp` dilonggarkan (nullable) karena sudah tidak dipakai —
--      dibiarkan ada agar data percobaan lama tetap utuh.

alter table public.pin_resend_attempts
  add column if not exists email text;

alter table public.pin_resend_attempts
  alter column whatsapp drop not null;

create index if not exists pin_resend_attempts_email_time_idx
  on public.pin_resend_attempts (email, attempted_at desc);
