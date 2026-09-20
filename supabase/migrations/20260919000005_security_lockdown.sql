-- Migration: kunci akses publik yang terlalu longgar.
--
-- 1) Storage bucket `images`: cabut INSERT/UPDATE publik. Semua unggahan
--    aplikasi lewat R2 bertanda tangan (edge function r2-upload-url).
--    SELECT publik dipertahankan (tampilan gambar).
-- 2) Tabel rsvps: cabut SELECT publik global (scraping lintas undangan).
--    Baca tamu anonim dialihkan ke edge function `rsvp-list` (per slug);
--    login (pemilik JWT order_id / admin) lewat policy di bawah.
--    INSERT publik dipertahankan (tamu mengisi RSVP) — tanpa .select()
--    karena RETURNING butuh izin SELECT.

-- ---- 1. Storage images: tulis publik dicabut ----
DROP POLICY IF EXISTS "Allow public uploads to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to images" ON storage.objects;

-- ---- 2. RSVP: baca publik global dicabut ----
DROP POLICY IF EXISTS "public_select_rsvps" ON public.rsvps;

DROP POLICY IF EXISTS "owner_or_admin_select_rsvps" ON public.rsvps;
CREATE POLICY "owner_or_admin_select_rsvps" ON public.rsvps
  FOR SELECT TO authenticated
  USING (
    ((auth.jwt() ->> 'order_id') = (order_id::text))
    OR public.is_admin()
  );
