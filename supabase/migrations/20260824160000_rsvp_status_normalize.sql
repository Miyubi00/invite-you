-- ============================================================
-- 20260824160000_rsvp_status_normalize.sql
-- ------------------------------------------------------------
-- Normalisasi nilai rsvps.status yang terkontaminasi kutip-ganda/spasi,
-- lalu kunci dengan CHECK constraint agar tidak terulang.
--
-- LATAR BELAKANG: sebagian baris lama tersimpan sebagai '"hadir"' (DENGAN
-- karakter kutip ganda — kemungkinan hasil seed/import yang di-JSON.stringify),
-- sehingga filter server-side .eq('status', 'hadir') tidak pernah cocok untuk
-- baris-baris tersebut. Insert dari aplikasi sendiri sudah benar.
-- ============================================================

-- 1. Bersihkan spasi/kutip di awal-akhir nilai status (berlaku juga utk kutip tunggal).
UPDATE public.rsvps
SET status = btrim(status, E' \t\r\n\'"')
WHERE status <> btrim(status, E' \t\r\n\'"');

-- 2. Kunci domain nilai: tolak insert/update di luar tiga status resmi.
ALTER TABLE public.rsvps
  DROP CONSTRAINT IF EXISTS rsvps_status_check;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_status_check
  CHECK (status IN ('hadir', 'tidak_hadir', 'ragu'));

-- 3. Verifikasi (jalankan manual setelah migrasi):
--    SELECT status, count(*) FROM public.rsvps GROUP BY 1 ORDER BY 1;
--    Harus hanya: hadir | ragu | tidak_hadir
