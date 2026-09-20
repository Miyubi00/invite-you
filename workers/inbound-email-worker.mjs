// workers/inbound-email-worker.mjs
// Cloudflare Email Worker: menangkap email masuk mail@loverse.id lalu
// meneruskannya sebagai JSON ke Supabase function `inbound-email` untuk
// ditampilkan di tab "Kotak Masuk" admin.
//
// CARA PASANG (sekali saja, ~10 menit):
//  CATATAN: per 2026 menu Email Routing PINDAH dari menu domain (Email)
//  ke menu level akun: Compute > Email Service > Email Routing. Kalau di
//  menu domain hanya ada "DMARC Management" dan "Email Security", itu
//  normal — pakai jalur Compute di bawah ini.
//  1) Di folder workers/: `npm install` (postal-mime) lalu
//     `npx wrangler login`.
//  2) Set secret (JANGAN tulis di file):
//        npx wrangler secret put SUPABASE_URL        -> https://<project>.supabase.co
//        npx wrangler secret put SUPABASE_ANON_KEY   -> samakan dengan
//            VITE_SUPABASE_ANON_KEY di .env (kunci publik, aman)
//        npx wrangler secret put INBOUND_EMAIL_SECRET -> samakan dengan secret
//            INBOUND_EMAIL_SECRET di Supabase Edge Functions.
//  3) Deploy: `npx wrangler deploy`
//  4) Dashboard Cloudflare -> pilih AKUN (bukan domain) -> Compute >
//     Email Service > Email Routing -> Onboard Domain -> pilih loverse.id
//     (MX record otomatis ke Cloudflare).
//  5) Routing Rules -> Create routing rule: pattern `mail@loverse.id`
//     -> Action "Send to a Worker" -> pilih worker ini. Save.
//     - (Opsional) Catch-all rule: Drop, agar alamat ngasal tidak masuk.
//  6) Uji: kirim email ke mail@loverse.id -> cek tab Kotak Masuk admin.
// Lampiran email SENGAJA diabaikan dulu (teks saja) agar simpel.

import PostalMime from 'postal-mime';

// Batas lampiran: maks 5 file, @maks 5MB, total maks 10MB. Sisanya dilewati
// agar tidak melewati batas CPU/POST Worker dan function.
const MAX_FILES = 5;
const MAX_EACH = 5 * 1024 * 1024;
const MAX_TOTAL = 10 * 1024 * 1024;

/** Uint8Array -> base64 (chunked, aman untuk buffer besar). */
function toBase64(bytes) {
  let bin = '';
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i += 8192) {
    bin += String.fromCharCode.apply(null, arr.subarray(i, i + 8192));
  }
  return btoa(bin);
}

export default {
  /**
   * @param {any} message - pesan masuk (from, to, raw, headers, ...)
   * @param {{ SUPABASE_URL: string, SUPABASE_ANON_KEY: string, INBOUND_EMAIL_SECRET: string }} env
   */
  async email(message, env) {
    const to = message.to;
    try {
      const buf = await new Response(message.raw).arrayBuffer();
      const parsed = await PostalMime.parse(buf);
      const fromAddr =
        (parsed.from && parsed.from.address ? String(parsed.from.address) : '') ||
        String(message.from || '');
      const payload = {
        from: fromAddr.slice(0, 320),
        to: String(to || 'mail@loverse.id').slice(0, 320),
        subject: String(parsed.subject || '(tanpa subjek)').slice(0, 500),
        text: String(parsed.text || '').slice(0, 50000),
        attachments: [],
      };
      let skipped = 0;
      let total = 0;
      for (const att of (parsed.attachments || []).slice(0, MAX_FILES + 5)) {
        const size = att.size || (att.content ? att.content.byteLength : 0);
        if (payload.attachments.length >= MAX_FILES || size > MAX_EACH || total + size > MAX_TOTAL) {
          skipped++;
          continue;
        }
        try {
          payload.attachments.push({
            name: String(att.filename || 'lampiran').slice(0, 200),
            mime: String(att.mimeType || 'application/octet-stream').slice(0, 120),
            size,
            content: toBase64(att.content),
          });
          total += size;
        } catch {
          skipped++;
        }
      }
      if (skipped > 0) payload.skippedAttachments = skipped;
      if (!payload.from) {
        message.setReject('Rejected: no sender');
        return;
      }
      // Gateway Supabase WAJIB dapat anon key (tanpa ini: HTTP 401).
      // Anon key bersifat publik (sudah tertanam di website), aman sebagai secret.
      const res = await fetch(
        `${String(env.SUPABASE_URL).replace(/\/+$/, '')}/functions/v1/inbound-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.SUPABASE_ANON_KEY || ''}`,
            apikey: env.SUPABASE_ANON_KEY || '',
            'x-inbound-secret': env.INBOUND_EMAIL_SECRET || '',
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error(`inbound-email HTTP ${res.status}`);
    } catch (err) {
      console.error('[inbound-email-worker]', err instanceof Error ? err.message : err);
      message.setReject('Rejected: forwarding failed');
    }
  },
};
