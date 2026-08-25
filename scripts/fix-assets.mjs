// ============================================================
// scripts/fix-assets.mjs
// ------------------------------------------------------------
// Substitusi URL aset yang MATI (Pixabay 403 / Unsplash 404) ke aset yang
// sudah berhasil termirror di R2. Digabung dengan asset-map.json lalu
// menulis ulang seluruh src/.
// ============================================================
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const map = JSON.parse(readFileSync('scripts/asset-map.json', 'utf8'));

const AUDIO_FULL = 'https://loverse.my.id/defaults/audio/ee2e74c72c.mp3';
const AUDIO_SHORT = 'https://loverse.my.id/defaults/audio/cdd49a279c.mp3';

const substitutions = {
  // Foto 404 (dihapus Unsplash) -> foto working yang sudah di R2:
  'https://images.unsplash.com/photo-1519225421980-715cb0202128?w=800&auto=format&fit=crop':
    'https://loverse.my.id/defaults/img/1772b3133b.jpg', // cover default
  'https://images.unsplash.com/photo-1511285560982-1356c11d4606?w=500&fit=crop':
    'https://loverse.my.id/defaults/img/146c15097b.jpg', // galeri-1
  'https://images.unsplash.com/photo-1522673607200-1645062cd958?w=500&fit=crop':
    'https://loverse.my.id/defaults/img/9a293ef1a6.jpg', // galeri-2
  // Audio Pixabay 403 -> track pengganti:
  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c153e2.mp3': AUDIO_SHORT, // SFX BitTheme
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3': AUDIO_FULL,
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243544c06f.mp3': AUDIO_FULL,
  'https://cdn.pixabay.com/download/audio/2022/02/07/audio_1808fbf07a.mp3': AUDIO_FULL,
  'https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc8c84852c.mp3': AUDIO_FULL,
  'https://cdn.pixabay.com/download/audio/2022/05/17/audio_1615a96c4d.mp3': AUDIO_FULL,
  'https://cdn.pixabay.com/download/audio/2022/10/25/audio_1086088e5d.mp3': AUDIO_FULL,
};
Object.assign(map, substitutions);

// --- Tulis ulang di src/ ---
const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|ts)$/.test(name)) files.push(p);
  }
})('src');

let changed = 0;
for (const f of files) {
  let src = readFileSync(f, 'utf8');
  let touched = false;
  for (const [oldUrl, newUrl] of Object.entries(map)) {
    if (src.includes(oldUrl)) { src = src.split(oldUrl).join(newUrl); touched = true; }
  }
  if (touched) { writeFileSync(f, src); changed++; console.log('Rewrite:', f); }
}

writeFileSync('scripts/asset-map.json', JSON.stringify(map, null, 2));
console.log(`\nSelesai: ${changed} file diperbarui, total ${Object.keys(map).length} pemetaan.`);