-- Migration: ganti domain lama loverse.my.id -> loverse.id di data user.
-- Latar: domain pindah ke loverse.id; custom domain R2 lama (r2.loverse.my.id)
-- bisa mati sehingga foto/cover/galeri/audio undangan ikut rusak.
--
-- WAJIB SEBELUM JALAN:
--  1) Custom domain r2.loverse.id sudah dipasang di bucket R2 (Cloudflare).
--  2) Secret R2_PUBLIC_URL sudah diganti ke https://r2.loverse.id.
-- Kalau belum, JANGAN jalankan migration ini dulu.
--
-- Yang disentuh: public.orders.event_details (jsonb: foto mempelai, cover,
-- galeri, audio, gift/qr — semua URL R2 lama ada di sini).
-- SENGAJA tidak disentuh:
--  - public.templates (tidak punya kolom image; gambar dari kode + R2),
--  - public.pending_orders (tidak menyimpan URL),
--  - public.admin_audit_log (arsip historis, tidak diubah).
--
-- Cek dampak dulu (SELECT, tanpa mengubah apa pun):
--   SELECT id, slug
--   FROM public.orders
--   WHERE event_details::text LIKE '%loverse.my.id%';

UPDATE public.orders
SET event_details = replace(event_details::text, 'loverse.my.id', 'loverse.id')::jsonb
WHERE event_details::text LIKE '%loverse.my.id%';
