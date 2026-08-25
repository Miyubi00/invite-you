-- ============================================================
-- Migrasi: Hash PIN dashboard mempelai (bcrypt via pgcrypto)
-- Tanggal : 2026-08-24
--
-- Tujuan: login tidak lagi membandingkan PIN plaintext.
--  1. Tambah kolom orders.pin_hash (hash bcrypt dari pin_code).
--  2. Backfill semua pin_code lama menjadi pin_hash (cost 10).
--  3. Trigger menjaga pin_hash tetap sinkron setiap kali pin_code
--     ditulis/diubah (oleh webhook / aktivasi admin / fungsi lama).
--  4. RPC verify_customer_pin -> verifikasi via hash, HANYA
--     service_role yang boleh memanggil (anon/authenticated ditolak).
--
-- CATATAN: kolom pin_code DI-PERTAHANKAN karena halaman payment-status
-- menampilkan PIN ke pemilik pembayaran. Yang dihapus adalah penggunaan
-- plaintext pada jalur VERIFIKASI LOGIN (brute-force surface).
-- ============================================================

-- 1. Kolom hash (nullable — diisi by trigger / backfill)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS pin_hash text;

-- 2. Backfill data lama: hash bcrypt cost 10 untuk semua PIN 6 digit.
UPDATE public.orders
SET pin_hash = extensions.crypt(pin_code, extensions.gen_salt('bf', 10))
WHERE pin_hash IS NULL
  AND pin_code IS NOT NULL
  AND length(pin_code) = 6;

-- 3. Trigger: hash otomatis setiap kali pin_code diisi/diubah.
CREATE OR REPLACE FUNCTION public.orders_set_pin_hash()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.pin_code IS NOT NULL AND NEW.pin_code <> '' THEN
    NEW.pin_hash := extensions.crypt(NEW.pin_code, extensions.gen_salt('bf', 10));
  ELSE
    NEW.pin_hash := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_pin_hash ON public.orders;
CREATE TRIGGER trg_orders_pin_hash
  BEFORE INSERT OR UPDATE OF pin_code ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.orders_set_pin_hash();

-- 4. RPC verifikasi login (hanya service_role/Edge Functions).
--    Tidak mengembalikan pin_hash/pin_code — hanya data order.
CREATE OR REPLACE FUNCTION public.verify_customer_pin(
  p_whatsapp text,
  p_pin text
)
RETURNS TABLE (
  id uuid,
  slug text,
  groom_name text,
  bride_name text,
  wedding_date date,
  template_slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT o.id, o.slug, o.groom_name, o.bride_name, o.wedding_date, o.template_slug
  FROM public.orders o
  WHERE o.whatsapp = p_whatsapp
    AND o.payment_status = 'success'
    AND o.pin_hash = extensions.crypt(p_pin, o.pin_hash)
  LIMIT 1;
$$;

-- Kunci akses: hanya service_role (key yang dipakai Edge Functions).
REVOKE ALL ON FUNCTION public.verify_customer_pin(text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_customer_pin(text, text)
  TO service_role;