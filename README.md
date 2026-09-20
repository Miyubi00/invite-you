# LoVerse — Undangan Pernikahan Digital

Platform undangan pernikahan digital: katalog tema, checkout Midtrans (otomatis) / manual WhatsApp, PIN dashboard + invoice PDF via email, panel admin lengkap (pesanan, template, kotak masuk email, audit log), AI assistant + handover Telegram.

**Site:** https://loverse.id

## Fitur Utama

- **Katalog & demo tema** — puluhan tema (`/demo/:slug`), undangan publik (`/wedding/:slug`), RSVP + buku tamu.
- **Checkout** — Midtrans Snap otomatis (QRIS, VA, e-wallet) + manual via WhatsApp; PIN 6 digit + **invoice PDF** dikirim otomatis.
- **Lupa / kirim ulang PIN** — alur 2 tahap dengan konfirmasi pemilik.
- **Email transaksional** (Resend): pembayaran berhasil, konfirmasi PIN, PIN baru — header/footer + ikon seragam.
- **Admin panel** (`VITE_ADMIN_PATH`): Data Pesanan, Data Masuk (WhatsApp), Kelola Template, **Kotak Masuk** (email `mail@loverse.id` + balas + lampiran), **Audit Log** (jejak customer/admin/sistem).
- **AI chat + handover Telegram**, audit keamanan (rate-limit, captcha, RLS).

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS 4 + i18n (ID/EN) |
| Backend | Supabase (Postgres + Auth + Edge Functions/Deno) |
| Pembayaran | Midtrans Snap |
| Email | Resend (kirim) + Cloudflare Email Worker (terima) |
| Storage | Cloudflare R2 |
| Deploy web | Vercel (`vercel.json`) |
| Cron | Supabase Cron → `expire-pending-orders` |

## Struktur Penting

```
api/og.js                  # Vercel function: meta OG untuk share WA
public/icons/              # Ikon Lucide PNG untuk email (mirror R2: icons/)
src/pages/                 # ... + /dev/invoice & /dev/email (preview desain, dev-only)
src/components/admin/      # OrdersTab, TemplatesTab, InboxTab, AuditTab, ...
supabase/functions/        # activate-pending-order, ai-chat, create-order,
                           # customer-login, expire-pending-orders, inbound-email,
                           # midtrans-webhook, payment-status, reply-email,
                           # resend-pin, r2-*, rsvp-list, telegram-webhook
supabase/functions/_shared/# emailLayout, invoiceAssets, brandLogo, auth, ...
supabase/migrations/       # skema + RLS + trigger audit
supabase/scheduled-jobs.example.sql  # template cron (isi manual, JANGAN commit berisi secret)
workers/                   # Cloudflare Email Worker (inbox mail@loverse.id)
scripts/                   # script lokal (di-ignore git): upload R2, mirror aset, ...
```

Halaman `/dev/invoice` dan `/dev/email` hanya render saat `npm run dev` (produksi menampilkan 404) — acuan desain PDF & email.

## Setup Lokal

```bash
npm install
cp .env.example .env        # lalu isi nilai asli (JANGAN commit .env)
supabase link               # hubungkan project (atau: supabase start)
supabase db push            # jalankan migrasi
npm run dev
```

Test lokal tetap jalan (`npm test`) walau file `*.test.*` tidak di-commit (di-ignore git).

## Environment Variables

Lihat `.env.example` (hanya placeholder, tanpa nilai asli). Yang wajib di **Supabase Edge Functions Secrets**:

| Secret | Isi |
|---|---|
| `APP_URL` | `https://loverse.id` |
| `R2_PUBLIC_URL` | `https://r2.loverse.id` |
| `R2_ENDPOINT` / `R2_BUCKET_NAME` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | kredensial R2 |
| `RESEND_API_KEY` | API key Resend (permission Sending) |
| `EMAIL_FROM` | `LoVerse <mail@loverse.id>` |
| `MIDTRANS_SERVER_KEY` (+ `MIDTRANS_IS_PRODUCTION`) | server key Midtrans |
| `PAYMENT_LINK_SECRET` | string acak ≥32 char (token link bayar) |
| `ALLOWED_ORIGIN` | `https://loverse.id` (tutup CORS `*`) |
| `INBOUND_EMAIL_SECRET` | string acak (Worker ↔ `inbound-email`) |
| `CRON_SECRET` | string acak (penjadwalan housekeeping) |
| `REQUIRE_ADMIN_MFA` | `false` (atau `true` bila login TOTP sudah dipasang) |
| `TELEGRAM_*` | hanya bila pakai handover Telegram |

## Deploy

```bash
# 1. Website (Vercel auto-deploy dari push main)
git push

# 2. Database
supabase db push

# 3. Edge functions (atau: semuanya sekaligus)
supabase functions deploy midtrans-webhook activate-pending-order resend-pin \
  inbound-email reply-email rsvp-list expire-pending-orders \
  create-order customer-login payment-status ai-chat telegram-webhook \
  r2-upload r2-upload-url r2-delete

# 4. Email Worker (di folder workers/)
cd workers && npm install
npx wrangler secret put SUPABASE_URL SUPABASE_ANON_KEY INBOUND_EMAIL_SECRET
npx wrangler deploy
# lalu di dashboard Cloudflare: Compute > Email Service > Email Routing >
# Onboard loverse.id > rule mail@loverse.id -> Send to Worker

# 5. Cron harian: isi supabase/scheduled-jobs.example.sql lalu jalankan
#    manual di SQL editor (atau Dashboard > Database > Cron jobs)
```

Ikon email di-upload ke R2 via `node scripts/upload-email-icons.mjs` (baca kredensial dari `.env` lokal).
