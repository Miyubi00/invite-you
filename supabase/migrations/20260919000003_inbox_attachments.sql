-- Migration: lampiran email masuk (daftar file di R2).
-- Kolom attachments: jsonb array [{name, mime, size, url}].

alter table public.inbound_emails
  add column if not exists attachments jsonb not null default '[]'::jsonb;
