-- Migration: fondasi audit — perluas trigger orders + trigger pending_orders.
--
-- Masalah yang diperbaiki:
--  1) UPDATE orders SEBELUMNYA tidak mencatat template_slug & event_details,
--     sehingga "customer ganti template / edit isi undangan" INVISIBLE.
--  2) Tabel pending_orders belum diaudit sama sekali.
--
-- Catatan dobel-baris (disengaja, JANGAN "dirapikan" dengan menghapus):
-- aktivasi manual admin menulis 2 baris — eksplisit 'activate_order' (ada
-- konteks manusia: email admin) + trigger 'insert' (hanya tahu service_role).
-- Trigger tidak bisa tahu SIAPA di balik kunci service; function tidak bisa
-- melihat SEMUA tulisan DB. Halaman Audit menggabungkan tampilannya.

-- ============ 1. Perluas log_orders_audit ============
CREATE OR REPLACE FUNCTION "public"."log_orders_audit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_sub    text;
  v_role   text;
  v_email  text;
  v_kind   text;
  v_row_id text;
  v_details jsonb;
  v_ed_keys text[];
BEGIN
  v_sub  := current_setting('request.jwt.claim.sub', true);
  v_role := current_setting('request.jwt.claim.role', true);

  IF v_role = 'service_role' THEN
    v_kind := 'service';
  ELSE
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
    -- Key event_details yang berubah (top-level saja; bukan full dump).
    SELECT COALESCE(array_agg(s.k), '{}') INTO v_ed_keys
    FROM (
      SELECT key AS k FROM jsonb_each(COALESCE(OLD.event_details, '{}'::jsonb))
      UNION
      SELECT key AS k FROM jsonb_each(COALESCE(NEW.event_details, '{}'::jsonb))
    ) s
    WHERE (COALESCE(OLD.event_details, '{}'::jsonb) -> s.k)
       IS DISTINCT FROM (COALESCE(NEW.event_details, '{}'::jsonb) -> s.k);
    v_details := jsonb_build_object(
      'payment_status_old', OLD.payment_status,
      'payment_status_new', NEW.payment_status,
      'slug_old', OLD.slug,
      'slug_new', NEW.slug,
      'template_slug_old', OLD.template_slug,
      'template_slug_new', NEW.template_slug,
      'pin_code_changed', (NEW.pin_code IS DISTINCT FROM OLD.pin_code),
      'event_details_changed', v_ed_keys
    );
  ELSE
    v_details := jsonb_build_object(
      'payment_status', OLD.payment_status,
      'slug', OLD.slug,
      'template_slug', OLD.template_slug
    );
  END IF;

  INSERT INTO public.admin_audit_log
    (actor_email, actor_kind, action, table_name, row_id, details)
  VALUES
    (v_email, v_kind, lower(TG_OP), 'orders', v_row_id, v_details);

  RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."log_orders_audit"() OWNER TO "postgres";

-- ============ 2. Trigger audit pending_orders ============
CREATE OR REPLACE FUNCTION "public"."log_pending_audit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  v_sub   text;
  v_role  text;
  v_email text;
  v_kind  text;
BEGIN
  v_sub  := current_setting('request.jwt.claim.sub', true);
  v_role := current_setting('request.jwt.claim.role', true);

  IF v_role = 'service_role' THEN
    v_kind := 'service';
  ELSE
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

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.admin_audit_log
      (actor_email, actor_kind, action, table_name, row_id, details)
    VALUES
      (v_email, v_kind, 'insert', 'pending_orders', NEW.id::text,
       jsonb_build_object('status', NEW.status, 'template_slug', NEW.template_slug));
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.admin_audit_log
      (actor_email, actor_kind, action, table_name, row_id, details)
    VALUES
      (v_email, v_kind, 'update', 'pending_orders', NEW.id::text,
       jsonb_build_object('status_old', OLD.status, 'status_new', NEW.status,
                          'template_slug', NEW.template_slug));
  ELSE
    INSERT INTO public.admin_audit_log
      (actor_email, actor_kind, action, table_name, row_id, details)
    VALUES
      (v_email, v_kind, 'delete', 'pending_orders', OLD.id::text,
       jsonb_build_object('status', OLD.status, 'template_slug', OLD.template_slug));
  END IF;

  RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."log_pending_audit"() OWNER TO "postgres";

DROP TRIGGER IF EXISTS "trg_pending_audit" ON "public"."pending_orders";
CREATE TRIGGER "trg_pending_audit"
  AFTER INSERT OR DELETE OR UPDATE ON "public"."pending_orders"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_pending_audit"();
