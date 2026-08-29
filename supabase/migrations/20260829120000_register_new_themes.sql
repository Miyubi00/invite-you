-- ============================================================
-- supabase/migrations/20260829120000_register_new_themes.sql
-- ------------------------------------------------------------
-- Daftarkan tema-tema baru ke tabel public.templates agar muncul
-- di katalog HomePage & dipakai edge function create-order
-- (harga diambil dari DB, bukan dari constants.ts).
--
-- Tabel : templates (PK slug) — kolom:
--   slug text NOT NULL PK, name text, category text,
--   price integer NOT NULL, is_active boolean DEFAULT true
--
-- Catatan:
--  - Tidak ada kolom image di DB; preview image hanyalah
--    bagian dari MASTER_TEMPLATES (constants.ts).
--  - Harga harus SAMA dengan constants.ts (Rp 15.000, kategori RSVP).
--  - Idempotent: aman dijalankan ulang (ON CONFLICT DO UPDATE).
-- ============================================================

INSERT INTO public.templates (slug, name, category, price, is_active)
VALUES
  ('board-game',     'Board Game',      'RSVP', 15000, true),
  ('chiikawa',       'Chiikawa Days',   'RSVP', 15000, true),
  ('claymorphism',   'Clay Puffy',      'RSVP', 15000, true),
  ('emerald-royale', 'Emerald Royale',  'RSVP', 15000, true),
  ('lantern-night',  'Lantern Night',   'RSVP', 15000, true),
  ('motion-flow',    'Motion Flow',     'RSVP', 15000, true),
  ('neumorph',       'Soft Neumorph',   'RSVP', 15000, true),
  ('ocean-vows',     'Ocean Vows',      'RSVP', 15000, true),
  ('pop-card',       'Pop Card Fiesta', 'RSVP', 15000, true),
  ('roblox',         'Roblox World',    'RSVP', 15000, true),
  ('sage-terracotta','Sage Terracotta', 'RSVP', 15000, true),
  ('sakura-breeze',  'Sakura Breeze',   'RSVP', 15000, true),
  ('spiderman',      'Spider-Verse',    'RSVP', 15000, true),
  ('zine-raw',       'Zine Raw',        'RSVP', 15000, true)
ON CONFLICT (slug) DO UPDATE
SET name      = EXCLUDED.name,
    category  = EXCLUDED.category,
    price     = EXCLUDED.price,
    is_active = EXCLUDED.is_active;

-- Verifikasi hasil registrasi
SELECT slug, name, category, price, is_active
FROM public.templates
WHERE slug IN (
  'board-game','chiikawa','claymorphism','emerald-royale','lantern-night',
  'motion-flow','neumorph','ocean-vows','pop-card','roblox',
  'sage-terracotta','sakura-breeze','spiderman','zine-raw'
)
ORDER BY slug;