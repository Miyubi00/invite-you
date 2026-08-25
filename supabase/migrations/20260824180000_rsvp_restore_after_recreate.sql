-- ============================================================
-- 20260824180000_rsvp_restore_after_recreate.sql
-- ------------------------------------------------------------
-- Melengkapi tabel rsvps hasil RECREATE MANUAL di dashboard, yang biasanya
-- kehilangan bagian non-kolom: RLS + policies, grants, default kolom,
-- unique constraint, FK cascade, dan index pendukung filter server-side.
-- Semua statement idempoten — aman dijalankan berulang.
-- ============================================================

-- 1. Default kolom
ALTER TABLE public.rsvps ALTER COLUMN id         SET DEFAULT gen_random_uuid();
ALTER TABLE public.rsvps ALTER COLUMN created_at SET DEFAULT now();

-- 2. Unique: anti duplikat RSVP per sesi tamu (dipakai fitur "sudah mengisi")
ALTER TABLE public.rsvps
  DROP CONSTRAINT IF EXISTS rsvps_order_id_session_id_key;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_order_id_session_id_key UNIQUE (order_id, session_id);

-- 3. FK: ikut terhapus saat order dihapus (dipakai RPC delete_order_cascade)
ALTER TABLE public.rsvps
  DROP CONSTRAINT IF EXISTS rsvps_order_id_fkey;
ALTER TABLE public.rsvps
  ADD CONSTRAINT rsvps_order_id_fkey
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- 4. Index pendukung query server-side (filter order_id + urut created_at)
CREATE INDEX IF NOT EXISTS rsvps_order_id_created_at_idx
  ON public.rsvps (order_id, created_at DESC);

-- 5. RLS + 4 policy (persis definisi asli migrasi 20260824104812)
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_insert_rsvps ON public.rsvps;
CREATE POLICY public_insert_rsvps ON public.rsvps
  FOR INSERT WITH CHECK (true); -- tamu publik boleh mengisi buku tamu

DROP POLICY IF EXISTS public_select_rsvps ON public.rsvps;
CREATE POLICY public_select_rsvps ON public.rsvps
  FOR SELECT USING (true); -- guestbook publik bisa dibaca siapa pun

DROP POLICY IF EXISTS owner_or_admin_update_rsvps ON public.rsvps;
CREATE POLICY owner_or_admin_update_rsvps ON public.rsvps
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = rsvps.order_id
        AND auth.jwt() ->> 'order_id' = o.id::text
    )
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = rsvps.order_id
        AND auth.jwt() ->> 'order_id' = o.id::text
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS owner_or_admin_delete_rsvps ON public.rsvps;
CREATE POLICY owner_or_admin_delete_rsvps ON public.rsvps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = rsvps.order_id
        AND auth.jwt() ->> 'order_id' = o.id::text
    )
    OR public.is_admin()
  );

-- 6. Grants ke role (persis definisi asli)
GRANT ALL ON TABLE public.rsvps TO anon;
GRANT ALL ON TABLE public.rsvps TO authenticated;
GRANT ALL ON TABLE public.rsvps TO service_role;

-- 7. Verifikasi manual setelah migrasi:
--    SELECT * FROM pg_policies WHERE tablename = 'rsvps';   -- 4 policy
--    SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'rsvps';
--    Lalu uji: buka undangan -> isi RSVP -> dashboard -> filter kehadiran.
