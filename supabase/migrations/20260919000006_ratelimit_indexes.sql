-- Migration: rate-limit AI chat berbasis DB + index kolom panas.
--
-- 1) ai_chat_hits: jejak hit per IP untuk rate limit (10/5 menit).
--    Rate limit in-memory hilang tiap cold-start; tabel ini bertahan.
--    RLS aktif TANPA policy publik: hanya service_role (edge function).
-- 2) Index kolom yang paling sering difilter/di-order (sebelumnya seq-scan).

-- ---- 1. Tabel rate limit ----
create table if not exists public.ai_chat_hits (
  id bigint generated always as identity primary key,
  ip text not null,
  created_at timestamptz not null default now()
);

alter table public.ai_chat_hits enable row level security;

create index if not exists idx_ai_chat_hits_ip_created
  on public.ai_chat_hits (ip, created_at desc);

-- ---- 2. Index kolom panas ----
create index if not exists idx_orders_payment_status
  on public.orders (payment_status);

create index if not exists idx_orders_created
  on public.orders (created_at desc);

create index if not exists idx_pending_orders_status_created
  on public.pending_orders (status, created_at);

create index if not exists idx_inbound_emails_unread
  on public.inbound_emails (is_read, received_at desc);
