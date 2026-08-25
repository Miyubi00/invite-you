SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."payment_status" AS ENUM (
    'pending',
    'success',
    'failed',
    'expired'
);

ALTER TYPE "public"."payment_status" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "groom_name" "text" NOT NULL,
    "bride_name" "text" NOT NULL,
    "wedding_date" "date" NOT NULL,
    "event_details" "jsonb" DEFAULT '{}'::"jsonb",
    "payment_status" "public"."payment_status" DEFAULT 'pending'::"public"."payment_status",
    "midtrans_order_id" "text",
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "pin_code" "text",
    "template_slug" "text" DEFAULT 'rustic-floral'::"text",
    "whatsapp" "text" NOT NULL,
    "snap_token" "text",
    "price" integer,
    "email" "text"
);

ALTER TABLE "public"."orders" OWNER TO "postgres";

COMMENT ON COLUMN "public"."orders"."email" IS 'Email pelanggan tujuan pengiriman PIN otomatis (Resend).';

CREATE OR REPLACE FUNCTION "public"."create_order_secure"("p_template_slug" "text", "p_groom" "text", "p_bride" "text", "p_date" "date", "p_whatsapp" "text", "p_pin" "text") RETURNS "public"."orders"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_price integer;
  v_order orders;
BEGIN
  SELECT price INTO v_price
  FROM templates
  WHERE slug = p_template_slug;

  IF v_price IS NULL THEN
    RAISE EXCEPTION 'Template tidak valid';
  END IF;

  INSERT INTO orders (
    groom_name,
    bride_name,
    wedding_date,
    template_slug,
    whatsapp,
    pin_code
  )
  VALUES (
    p_groom,
    p_bride,
    p_date,
    p_template_slug,
    p_whatsapp,
    p_pin
  )
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;

ALTER FUNCTION "public"."create_order_secure"("p_template_slug" "text", "p_groom" "text", "p_bride" "text", "p_date" "date", "p_whatsapp" "text", "p_pin" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."delete_order_cascade"("p_order_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_rsvps  bigint;
  v_orders bigint;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  DELETE FROM public.rsvps WHERE order_id = p_order_id;
  GET DIAGNOSTICS v_rsvps = ROW_COUNT;

  DELETE FROM public.orders WHERE id = p_order_id;
  GET DIAGNOSTICS v_orders = ROW_COUNT;

  RETURN jsonb_build_object('rsvps_deleted', v_rsvps, 'orders_deleted', v_orders);
END $$;

ALTER FUNCTION "public"."delete_order_cascade"("p_order_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE lower(email) = lower(COALESCE(auth.email(), ''))
  )
$$;

ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."lock_price"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- IZINKAN SERVICE ROLE
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.price IS DISTINCT FROM OLD.price THEN
    RAISE EXCEPTION 'price cannot be updated by client';
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."lock_price"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."login_client"("p_whatsapp" "text", "p_pin" "text") RETURNS SETOF "public"."orders"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM orders
  WHERE whatsapp = p_whatsapp  -- GANTI BAGIAN INI SESUAI NAMA KOLOM DI TABEL
  AND pin_code = p_pin                   -- Ini sudah benar pakai pin_code
  LIMIT 1;
END;
$$;

ALTER FUNCTION "public"."login_client"("p_whatsapp" "text", "p_pin" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."login_client"("p_groom" "text", "p_bride" "text", "p_date" "date", "p_pin" "text") RETURNS SETOF "public"."orders"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM orders
  WHERE lower(groom_name) = lower(p_groom)
  AND lower(bride_name) = lower(p_bride)
  AND wedding_date = p_date
  AND pin_code = p_pin  -- UBAH KATA "NAMA_KOLOM_PIN_ASLI" DI BARIS INI
  LIMIT 1;
END;
$$;

ALTER FUNCTION "public"."login_client"("p_groom" "text", "p_bride" "text", "p_date" "date", "p_pin" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."login_client_by_wa"("p_whatsapp" "text", "p_pin" "text") RETURNS SETOF "public"."orders"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM orders
  WHERE whatsapp = p_whatsapp  -- Ganti 'whatsapp' dengan nama kolom nomor WA di tabel Anda (misal: phone, no_wa)
  AND pin = p_pin
  LIMIT 1;
END;
$$;

ALTER FUNCTION "public"."login_client_by_wa"("p_whatsapp" "text", "p_pin" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."prevent_sensitive_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- IZINKAN SERVICE ROLE (webhook)
  IF current_user = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- BLOK USER LAIN
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status THEN
    RAISE EXCEPTION 'payment_status cannot be updated by client';
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."prevent_sensitive_update"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."push_gallery_item"("p_order_id" "uuid", "p_url" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT (
    (auth.jwt() ->> 'order_id') = p_order_id::text
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.orders
  SET event_details = jsonb_set(
        COALESCE(event_details, '{}'::jsonb),
        '{gallery}',
        COALESCE(event_details -> 'gallery', '[]'::jsonb)
          || to_jsonb(p_url::text),
        true
      )
  WHERE id = p_order_id;

  RETURN found;
END $$;

ALTER FUNCTION "public"."push_gallery_item"("p_order_id" "uuid", "p_url" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."remove_gallery_item"("p_order_id" "uuid", "p_url" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_gallery jsonb;
BEGIN
  -- Otorisasi: TIDAK diubah (persis seperti sebelumnya)
  IF NOT (
    (auth.jwt() ->> 'order_id') = p_order_id::text
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF p_url IS NULL OR length(p_url) = 0 THEN
    RAISE EXCEPTION 'url_required';
  END IF;

  -- Ambil galeri saat ini (missing/null => [])
  SELECT COALESCE(event_details -> 'gallery', '[]'::jsonb)
  INTO v_gallery
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN false;              -- pesanan tidak ada
  END IF;

  -- URL tidak ada di galeri => tanpa error, tanpa tulis
  IF NOT v_gallery ? p_url THEN
    RETURN false;
  END IF;

  UPDATE public.orders
  SET event_details = jsonb_set(
        COALESCE(event_details, '{}'::jsonb),
        '{gallery}',
        COALESCE((
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(v_gallery) AS t(elem)
          WHERE elem <> to_jsonb(p_url::text)
        ), '[]'::jsonb),       -- galeri kosong tetap [] bukan null
        true
      )
  WHERE id = p_order_id;

  RETURN found;
END $$;

ALTER FUNCTION "public"."remove_gallery_item"("p_order_id" "uuid", "p_url" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_event_details_field"("p_order_id" "uuid", "p_key" "text", "p_value" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_allowed text[] := ARRAY[
    'venue_name','venue_address','maps_link',
    'akad_date','akad_time','resepsi_date','resepsi_time',
    'groom_parents','bride_parents',
    'groom_photo','bride_photo','cover_photo',
    'audio_url','quote','quote_src'
  ];
BEGIN
  IF NOT (
    (auth.jwt() ->> 'order_id') = p_order_id::text
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF NOT (p_key = ANY(v_allowed)) THEN
    RAISE EXCEPTION 'field_not_allowed';
  END IF;

  UPDATE public.orders
  SET event_details = jsonb_set(
        COALESCE(event_details, '{}'::jsonb),
        ARRAY[p_key],
        p_value,
        true
      )
  WHERE id = p_order_id;

  RETURN found;
END $$;

ALTER FUNCTION "public"."update_event_details_field"("p_order_id" "uuid", "p_key" "text", "p_value" "jsonb") OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

ALTER TABLE "public"."admin_users" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."pending_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "groom_name" "text" NOT NULL,
    "bride_name" "text" NOT NULL,
    "wedding_date" "date" NOT NULL,
    "whatsapp" "text" NOT NULL,
    "template_slug" "text" NOT NULL,
    "status" "text" DEFAULT 'menunggu_pembayaran'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "email" "text"
);

ALTER TABLE "public"."pending_orders" OWNER TO "postgres";

COMMENT ON COLUMN "public"."pending_orders"."email" IS 'Email pelanggan, dipindahkan ke orders saat aktivasi.';

CREATE OR REPLACE VIEW "public"."public_invitations" AS
 SELECT "id",
    "slug",
    "groom_name",
    "bride_name",
    "wedding_date",
    "template_slug",
    "payment_status",
    "event_details",
    "created_at"
   FROM "public"."orders";

ALTER VIEW "public"."public_invitations" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."rsvps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "order_id" "uuid",
    "session_id" "text" NOT NULL,
    "guest_name" "text" NOT NULL,
    "status" "text",
    "pax" integer DEFAULT 1,
    "message" "text",
    "reply" "text",
    CONSTRAINT "rsvps_status_check" CHECK (("status" = ANY (ARRAY['hadir'::"text", 'tidak_hadir'::"text", 'ragu'::"text"])))
);

ALTER TABLE "public"."rsvps" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."templates" (
    "slug" "text" NOT NULL,
    "name" "text",
    "category" "text",
    "price" integer NOT NULL,
    "is_active" boolean DEFAULT true
);

ALTER TABLE "public"."templates" OWNER TO "postgres";

ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("email");

ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_midtrans_order_id_key" UNIQUE ("midtrans_order_id");

ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."pending_orders"
    ADD CONSTRAINT "pending_orders_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."rsvps"
    ADD CONSTRAINT "rsvps_order_id_session_id_key" UNIQUE ("order_id", "session_id");

ALTER TABLE ONLY "public"."rsvps"
    ADD CONSTRAINT "rsvps_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("slug");

CREATE UNIQUE INDEX "orders_slug_unique_idx" ON "public"."orders" USING "btree" ("slug");

CREATE OR REPLACE TRIGGER "lock_payment_status" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_sensitive_update"();

CREATE OR REPLACE TRIGGER "prevent_price_update" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."lock_price"();

ALTER TABLE ONLY "public"."rsvps"
    ADD CONSTRAINT "rsvps_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;

CREATE POLICY "admin_delete_pending_orders" ON "public"."pending_orders" FOR DELETE TO "authenticated" USING ("public"."is_admin"());

CREATE POLICY "admin_delete_templates" ON "public"."templates" FOR DELETE TO "authenticated" USING ("public"."is_admin"());

CREATE POLICY "admin_insert_templates" ON "public"."templates" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());

CREATE POLICY "admin_select_pending_orders" ON "public"."pending_orders" FOR SELECT TO "authenticated" USING ("public"."is_admin"());

CREATE POLICY "admin_update_templates" ON "public"."templates" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());

ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customer_or_admin_select_orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (((("auth"."jwt"() ->> 'order_id'::"text") = ("id")::"text") OR "public"."is_admin"()));

CREATE POLICY "customer_or_admin_update_orders" ON "public"."orders" FOR UPDATE TO "authenticated" USING (((("auth"."jwt"() ->> 'order_id'::"text") = ("id")::"text") OR "public"."is_admin"())) WITH CHECK (((("auth"."jwt"() ->> 'order_id'::"text") = ("id")::"text") OR "public"."is_admin"()));

ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_or_admin_delete_rsvps" ON "public"."rsvps" FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "rsvps"."order_id") AND (("auth"."jwt"() ->> 'order_id'::"text") = ("o"."id")::"text")))) OR "public"."is_admin"()));

CREATE POLICY "owner_or_admin_update_rsvps" ON "public"."rsvps" FOR UPDATE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "rsvps"."order_id") AND (("auth"."jwt"() ->> 'order_id'::"text") = ("o"."id")::"text")))) OR "public"."is_admin"())) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "rsvps"."order_id") AND (("auth"."jwt"() ->> 'order_id'::"text") = ("o"."id")::"text")))) OR "public"."is_admin"()));

ALTER TABLE "public"."pending_orders" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_insert_pending_orders" ON "public"."pending_orders" FOR INSERT WITH CHECK (true);

CREATE POLICY "public_insert_rsvps" ON "public"."rsvps" FOR INSERT WITH CHECK (true);

CREATE POLICY "public_select_rsvps" ON "public"."rsvps" FOR SELECT USING (true);

CREATE POLICY "public_select_templates" ON "public"."templates" FOR SELECT USING (true);

ALTER TABLE "public"."rsvps" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."templates" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."orders" TO "anon";
GRANT SELECT,INSERT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";

GRANT ALL ON FUNCTION "public"."create_order_secure"("p_template_slug" "text", "p_groom" "text", "p_bride" "text", "p_date" "date", "p_whatsapp" "text", "p_pin" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order_secure"("p_template_slug" "text", "p_groom" "text", "p_bride" "text", "p_date" "date", "p_whatsapp" "text", "p_pin" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order_secure"("p_template_slug" "text", "p_groom" "text", "p_bride" "text", "p_date" "date", "p_whatsapp" "text", "p_pin" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."delete_order_cascade"("p_order_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."delete_order_cascade"("p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_order_cascade"("p_order_id" "uuid") TO "service_role";

REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";

GRANT ALL ON FUNCTION "public"."lock_price"() TO "anon";
GRANT ALL ON FUNCTION "public"."lock_price"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."lock_price"() TO "service_role";

GRANT ALL ON FUNCTION "public"."login_client"("p_whatsapp" "text", "p_pin" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."login_client"("p_whatsapp" "text", "p_pin" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."login_client"("p_whatsapp" "text", "p_pin" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."login_client"("p_groom" "text", "p_bride" "text", "p_date" "date", "p_pin" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."login_client"("p_groom" "text", "p_bride" "text", "p_date" "date", "p_pin" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."login_client"("p_groom" "text", "p_bride" "text", "p_date" "date", "p_pin" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."login_client_by_wa"("p_whatsapp" "text", "p_pin" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."login_client_by_wa"("p_whatsapp" "text", "p_pin" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."login_client_by_wa"("p_whatsapp" "text", "p_pin" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."prevent_sensitive_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_sensitive_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_sensitive_update"() TO "service_role";

REVOKE ALL ON FUNCTION "public"."push_gallery_item"("p_order_id" "uuid", "p_url" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."push_gallery_item"("p_order_id" "uuid", "p_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."push_gallery_item"("p_order_id" "uuid", "p_url" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."remove_gallery_item"("p_order_id" "uuid", "p_url" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."remove_gallery_item"("p_order_id" "uuid", "p_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_gallery_item"("p_order_id" "uuid", "p_url" "text") TO "service_role";

REVOKE ALL ON FUNCTION "public"."update_event_details_field"("p_order_id" "uuid", "p_key" "text", "p_value" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_event_details_field"("p_order_id" "uuid", "p_key" "text", "p_value" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_details_field"("p_order_id" "uuid", "p_key" "text", "p_value" "jsonb") TO "service_role";

GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";

GRANT ALL ON TABLE "public"."pending_orders" TO "anon";
GRANT ALL ON TABLE "public"."pending_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."pending_orders" TO "service_role";

GRANT ALL ON TABLE "public"."public_invitations" TO "anon";
GRANT ALL ON TABLE "public"."public_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."public_invitations" TO "service_role";

GRANT ALL ON TABLE "public"."rsvps" TO "anon";
GRANT ALL ON TABLE "public"."rsvps" TO "authenticated";
GRANT ALL ON TABLE "public"."rsvps" TO "service_role";

GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";

drop extension if exists "pg_net";

  create policy "Allow public updates to images"
  on "storage"."objects"
  as permissive
  for update
  to public
using ((bucket_id = 'images'::text));

  create policy "Allow public uploads to images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'images'::text));

  create policy "Allow public viewing of images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'images'::text));
