-- ============================================================
-- Migrasi: Rate limiting create-order (anti-spam pemesanan)
-- Tanggal : 2026-08-24
--
-- Mencatat setiap pemanggilan Edge Function `create-order` per IP
-- agar bisa diblokir sementara bila terlalu banyak dalam 1 jam
-- (mis. 5 order/jam per IP). RLS aktif tanpa policy => hanya
-- service_role (Edge Functions) yang diizinkan baca/tulis.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_attempts (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_address   text NOT NULL,
  success      boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_attempts_ip_idx
  ON public.order_attempts (ip_address, attempted_at DESC);

ALTER TABLE public.order_attempts ENABLE ROW LEVEL SECURITY;