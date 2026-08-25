-- ============================================================
-- 20260824170000_rsvp_status_enum.sql
-- ------------------------------------------------------------
-- Ubah rsvps.status dari TEXT menjadi ENUM PostgreSQL `public.rsvp_status`.
--
-- Keuntungan dibanding CHECK constraint:
-- - Domain nilai dijamin oleh TIPE itu sendiri (nilai aneh mustahil masuk).
-- - Perubahan daftar status terpusat di satu tipe (ALTER TYPE ADD VALUE).
-- - PostgREST/supabase-js tetap mengembalikan string biasa — frontend
--   tidak perlu perubahan apa pun.
--
-- Aman dijalankan baik SETELAH maupun TANPA migrasi 20260824160000
-- (normalisasi kutip-ganda diulang di sini secara idempoten).
-- ============================================================

-- 1. Bersihkan spasi/kutip ganda-tunggal di awal-akhir nilai (idempoten).
UPDATE public.rsvps
SET status = btrim(status, E' \t\r\n\'"')
WHERE status <> btrim(status, E' \t\r\n\'"');

-- 2. Pra-penerbangan: gagalkan migrasi dengan pesan jelas bila masih ada
--    nilai di luar domain (jangan menebak silently).
DO $$
DECLARE
  bad_rows bigint;
  bad_values text;
BEGIN
  SELECT count(*), coalesce(string_agg(DISTINCT status, ', '), '')
    INTO bad_rows, bad_values
  FROM public.rsvps
 WHERE status IS NOT NULL
   AND status NOT IN ('hadir', 'tidak_hadir', 'ragu');

  IF bad_rows > 0 THEN
    RAISE EXCEPTION
      'Tidak bisa konversi ke enum: % baris rsvps punya status di luar domain (%). Perbaiki dulu lewat SQL editor.',
      bad_rows, bad_values;
  END IF;
END $$;

-- 3. Buat tipe enum bila belum ada.
DO $$ BEGIN
  CREATE TYPE public.rsvp_status AS ENUM ('hadir', 'tidak_hadir', 'ragu');
EXCEPTION
  WHEN duplicate_object THEN NULL; -- sudah ada (re-run) — aman
END $$;

-- 4. CHECK constraint dari migrasi sebelumnya digantikan oleh enum.
ALTER TABLE public.rsvps
  DROP CONSTRAINT IF EXISTS rsvps_status_check;

-- 5. Konversi kolom text -> enum (validasi tiap baris oleh PostgreSQL).
ALTER TABLE public.rsvps
  ALTER COLUMN status TYPE public.rsvp_status
  USING btrim(status, E' \t\r\n\'"')::public.rsvp_status;

-- 6. Verifikasi manual setelah migrasi:
--    SELECT unnest(enum_range(NULL::public.rsvp_status));           -- isi enum
--    SELECT status, count(*) FROM public.rsvps GROUP BY 1 ORDER BY 1;
