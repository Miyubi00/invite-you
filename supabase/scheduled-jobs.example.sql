-- supabase/scheduled-jobs.example.sql
-- Daftarkan cron job Supabase untuk housekeeping harian.
--
-- CARA PAKAI (sekali saja):
--  1) Copy isi file ini ke Supabase Dashboard -> SQL editor (JANGAN jadikan
--     migration — berisi secret yang tidak boleh ke-commit GitHub).
--  2) Ganti <PROJECT_REF>, <ANON_KEY> (= VITE_SUPABASE_ANON_KEY),
--     <CRON_SECRET> (sama dengan secret CRON_SECRET) dengan nilai asli.
--  3) Run. Alternatif tanpa SQL: Dashboard -> Database -> Cron jobs ->
--     New job -> HTTP request ke URL function dengan 3 header yang sama.
--
-- Jadwal '0 2 * * *' = jam 02:00 UTC = 09:00 WIB setiap hari.
-- Header apikey + Authorization WAJIB (tanpa ini gateway menolak 401).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'expire-pending-orders-daily',
  '0 2 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/expire-pending-orders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', '<ANON_KEY>',
      'Authorization', 'Bearer <ANON_KEY>',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Cek job terdaftar:
--   select jobid, jobname, schedule, active from cron.job;
-- Hapus job bila perlu:
--   select cron.unschedule('expire-pending-orders-daily');
