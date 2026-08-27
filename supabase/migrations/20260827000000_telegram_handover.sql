-- Migration: telegram_handover_sessions
-- Single-admin handover (1 active at a time). Polling-based, no Realtime required.
-- Dipakai oleh: supabase/functions/ai-chat, supabase/functions/telegram-webhook

create table if not exists public.telegram_handover_sessions (
  id uuid primary key default gen_random_uuid(),
  anon_id text not null,
  status text not null check (status in ('active','closed')),
  transcript jsonb not null default '[]'::jsonb,
  telegram_chat_id text,
  telegram_message_id integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_handover_anon on public.telegram_handover_sessions (anon_id);
create index if not exists idx_handover_status_updated on public.telegram_handover_sessions (status, updated_at desc);

-- updated_at auto-touch
create or replace function public.touch_handover_updated() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_handover_touch on public.telegram_handover_sessions;
create trigger trg_handover_touch
  before update on public.telegram_handover_sessions
  for each row execute function public.touch_handover_updated();

-- RLS enabled: hanya service_role (Edge Functions) yang bisa baca/tulis.
-- Klien anon/authenticated tidak bisa akses langsung — semua via Edge Function pakai SERVICE_ROLE_KEY (bypass RLS).
alter table public.telegram_handover_sessions enable row level security;
