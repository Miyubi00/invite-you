// ============================================================
// scripts/mirror-assets.mjs
// ------------------------------------------------------------
// 3.3 — Mirror aset default (Unsplash/Pixabay hotlink) ke R2.
// 1) Unduh tiap URL unik, 2) upload ke R2 (SigV4, key deterministik),
// 3) verifikasi URL publik, 4) tulis ulang semua URL di src/, 5) simpan map.
// Tanpa dependency baru; kredensial dibaca dari .env (tidak pernah dicetak).
// ============================================================
import { createHash, createHmac } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

// --- env ---
const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const { R2_ENDPOINT, R2_BUCKET_NAME, R2_PUBLIC_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = env;
if (!R2_ENDPOINT || !R2_BUCKET_NAME || !R2_PUBLIC_URL || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('Env R2 tidak lengkap di .env'); process.exit(1);
}

// --- 1. Kumpulkan URL unik dari src/ ---
const URL_RE = /https:\/\/(?:images\.unsplash|cdn\.pixabay)\.com\/[^"'\s`)]+/g;
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|ts)$/.test(name)) files.push(p);
  }
})('src');

const urls = new Set();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(URL_RE)) urls.add(m[0]);
}
console.log(`Ditemukan ${urls.size} URL unik.`);

// --- SigV4 PUT ke R2 (S3-compatible, region 'auto') ---
const sha = (d) => createHash('sha256').update(d).digest('hex');
const hmac = (k, d) => createHmac('sha256', k).update(d).digest();

async function r2Put(key, body, contentType) {
  const u = new URL(`${R2_ENDPOINT.replace(/\/+$/, '')}/${R2_BUCKET_NAME}/${key}`);
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha(body);
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonical = ['PUT', u.pathname, '', `host:${u.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`, signedHeaders, payloadHash].join('\n');
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const sts = ['AWS4-HMAC-SHA256', amzDate, scope, sha(canonical)].join('\n');
  const kSigning = hmac(hmac(hmac(hmac(`AWS4${R2_SECRET_ACCESS_KEY}`, dateStamp), 'auto'), 's3'), 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(sts).digest('hex');
  return fetch(u, {
    method: 'PUT',
    headers: {
      Authorization: `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      'Content-Type': contentType,
    },
    body: body,
  });
}

// --- 2. Mirror tiap URL ---
const extOf = (ct) => ct.includes('webp') ? 'webp' : ct.includes('png') ? 'png' : ct.includes('mp3') || ct.includes('mpeg') || ct.includes('audio') ? 'mp3' : 'jpg';
const map = {};
const failed = [];
for (const url of urls) {
  const kind = url.includes('unsplash') ? 'img' : 'audio';
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 10);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`download ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) throw new Error(`file terlalu kecil (${buf.length}B) — kemungkinan error page`);
    const ct = res.headers.get('content-type') ?? '';
    const key = `defaults/${kind}/${hash}.${extOf(ct)}`;
    const put = await r2Put(key, buf, ct || 'application/octet-stream');
    if (!put.ok) throw new Error(`upload ${put.status} ${await put.text().catch(() => '')}`.slice(0, 120));
    const publicUrl = `${R2_PUBLIC_URL.replace(/\/+$/, '')}/${key}`;
    const verify = await fetch(publicUrl, { method: 'HEAD', signal: AbortSignal.timeout(30000) });
    if (!verify.ok) throw new Error(`verify ${verify.status}`);
    map[url] = publicUrl;
    console.log(`OK  ${kind} ${(buf.length / 1024).toFixed(0)}KB  ${key}`);
  } catch (e) {
    failed.push({ url, reason: String(e.message ?? e) });
    console.error(`GAGAL ${url} -> ${e.message}`);
  }
}

writeFileSync('scripts/asset-map.json', JSON.stringify(map, null, 2));
console.log(`\nBerhasil: ${Object.keys(map).length}, Gagal: ${failed.length}. Map -> scripts/asset-map.json`);
if (failed.length) process.exit(2);

// --- 3. Tulis ulang URL di src/ ---
let changedFiles = 0;
for (const f of files) {
  let src = readFileSync(f, 'utf8');
  let touched = false;
  for (const [oldUrl, newUrl] of Object.entries(map)) {
    if (src.includes(oldUrl)) { src = src.split(oldUrl).join(newUrl); touched = true; }
  }
  if (touched) { writeFileSync(f, src); changedFiles++; console.log('Rewrite:', f); }
}
console.log(`\nSelesai. ${changedFiles} file src/ diperbarui.`);