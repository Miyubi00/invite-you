-- Migration: kotak masuk email mail@loverse.id untuk dashboard admin.
-- Alur: Cloudflare Email Worker menangkap email -> POST ke function
-- inbound-email (secret) -> baris baru di tabel ini -> tab "Kotak Masuk"
-- admin. Balasan dikirim via function reply-email (Resend) + replied_at diisi.
--
-- RLS: klien langsung hanya SELECT/UPDATE bila public.is_admin().
-- Edge function memakai SERVICE_ROLE_KEY (bypass RLS) untuk INSERT.

create table if not exists public.inbound_emails (
  id uuid primary key default gen_random_uuid(),
  from_addr text not null,
  to_addr text not null default 'mail@loverse.id',
  subject text not null default '(tanpa subjek)',
  text_body text not null default '',
  received_at timestamptz not null default now(),
  is_read boolean not null default false,
  replied_at timestamptz
);

alter table public.inbound_emails enable row level security;

drop policy if exists "admin_select_inbound_emails" on public.inbound_emails;
create policy "admin_select_inbound_emails" on public.inbound_emails
  for select to authenticated using (public.is_admin());

drop policy if exists "admin_update_inbound_emails" on public.inbound_emails;
create policy "admin_update_inbound_emails" on public.inbound_emails
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_inbound_emails_received
  on public.inbound_emails (received_at desc);
