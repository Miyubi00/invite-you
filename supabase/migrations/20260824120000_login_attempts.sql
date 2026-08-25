-- ============================================================
-- Migrasi: Rate limiting login customer (anti brute-force PIN)
-- Tanggal : 2026-08-24
--
-- Menambahkan tabel public.login_attempts untuk mencatat percobaan
-- login dashboard mempelai yang GAGAL. Dipakai Edge Function
-- `customer-login` untuk mengunci sementara (15 menit) setelah
-- 5x gagal per nomor WhatsApp / 20x gagal per IP.
--
-- KEAMANAN: RLS diaktifkan TANPA policy apa pun => hanya service_role
-- (Edge Functions) yang diizinkan baca/tulis; klien publik ditolak.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.login_attempts (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  whatsapp     text NOT NULL,
  ip_address   text NOT NULL,
  success      boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

-- Akselerasi query: hitung gagal per nomor & per IP dalam jendela waktu.
CREATE INDEX IF NOT EXISTS login_attempts_whatsapp_idx
  ON public.login_attempts (whatsapp, attempted_at DESC);
CREATE INDEX IF NOT EXISTS login_attempts_ip_idx
  ON public.login_attempts (ip_address, attempted_at DESC);

-- Service_role bypass RLS; public/anon tidak punya akses apa pun.
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;