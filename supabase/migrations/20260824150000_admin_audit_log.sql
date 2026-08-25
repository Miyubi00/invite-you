-- ============================================================
-- Migrasi: Audit log aksi admin & perubahan orders
-- Tanggal : 2026-08-24
--
-- Tabel public.admin_audit_log mencatat:
--  - Trigger pada tabel orders (INSERT/UPDATE/DELETE): siapa aktornya
--    (admin / customer / service) berdasarkan klaim JWT PostgREST,
--    apa yang berubah (ringkas, TANPA nilai sensitif seperti PIN).
--  - Aksi eksplisit dari Edge Function (mis. aktivasi admin).
--
-- RLS: hanya admin (is_admin()) yang boleh MEMBACA; insert hanya
-- lewat service_role / SECURITY DEFINER.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_email text,
  actor_kind  text NOT NULL DEFAULT 'unknown', -- admin | customer | service | unknown
  action      text NOT NULL,                   -- insert | update | delete | activate_order | ...
  table_name  text NOT NULL,
  row_id      text,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_idx
  ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_log_table_row_idx
  ON public.admin_audit_log (table_name, row_id);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin boleh membaca riwayat audit (policy memakai is_admin() yang sama
-- dengan policy orders — lihat migrasi rls_hardening).
CREATE POLICY admin_read_audit_log ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------
-- Trigger audit untuk tabel orders
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_orders_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_sub    text;
  v_role   text;
  v_email  text;
  v_kind   text;
  v_row_id text;
  v_details jsonb;
BEGIN
  v_sub  := current_setting('request.jwt.claim.sub', true);
  v_role := current_setting('request.jwt.claim.role', true);

  IF v_role = 'service_role' THEN
    v_kind := 'service';
  ELSE
    -- sub milik sesi Supabase Auth (admin) -> cari emailnya;
    -- bila bukan user auth (JWT customer ber-sub order id) -> customer.
    BEGIN
      SELECT u.email INTO v_email FROM auth.users u WHERE u.id::text = v_sub;
    EXCEPTION WHEN OTHERS THEN
      v_email := NULL;
    END;
    IF v_email IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.admin_users a WHERE lower(a.email) = lower(v_email)
    ) THEN
      v_kind := 'admin';
    ELSE
      v_kind := 'customer';
    END IF;
  END IF;

  v_row_id := COALESCE(NEW.id::text, OLD.id::text);

  IF (TG_OP = 'INSERT') THEN
    v_details := jsonb_build_object(
      'payment_status', NEW.payment_status,
      'slug', NEW.slug,
      'template_slug', NEW.template_slug
    );
  ELSIF (TG_OP = 'UPDATE') THEN
    v_details := jsonb_build_object(
      'payment_status_old', OLD.payment_status,
      'payment_status_new', NEW.payment_status,
      'slug_old', OLD.slug,
      'slug_new', NEW.slug,
      'pin_code_changed', (NEW.pin_code IS DISTINCT FROM OLD.pin_code)
    );
  ELSE
    v_details := jsonb_build_object(
      'payment_status', OLD.payment_status,
      'slug', OLD.slug
    );
  END IF;

  INSERT INTO public.admin_audit_log
    (actor_email, actor_kind, action, table_name, row_id, details)
  VALUES
    (v_email, v_kind, lower(TG_OP), 'orders', v_row_id, v_details);

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_audit ON public.orders;
CREATE TRIGGER trg_orders_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_orders_audit();