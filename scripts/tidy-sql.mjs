// ============================================================
// scripts/tidy-sql.mjs
// ------------------------------------------------------------
// Rapikan file SQL hasil dump: normalisasi line ending, hapus trailing
// whitespace, rapatkan run baris kosong jadi maksimal 1, pastikan tepat
// satu newline di akhir file. Isi statement SQL tidak diubah.
// Pemakaian: node scripts/tidy-sql.mjs <file.sql> [file2.sql ...]
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';

const stats = (text) => {
  const lines = text.split('\n');
  return {
    total: lines.length,
    blank: lines.filter((l) => l.trim() === '').length,
    content: lines.length - lines.filter((l) => l.trim() === '').length,
    statements: (text.match(/CREATE (TABLE|TYPE|POLICY|FUNCTION|INDEX|VIEW|SCHEMA)/gi) ?? []).length,
    bytes: Buffer.byteLength(text),
  };
};

for (const file of process.argv.slice(2)) {
  const raw = readFileSync(file, 'utf8');
  const before = stats(raw);

  let tidy = raw
    .replace(/\r\n?/g, '\n')      // normalisasi CRLF/CR -> LF
    .replace(/[ \t]+$/gm, '')     // hapus trailing whitespace per baris
    .replace(/\n{3,}/g, '\n\n')   // rapatkan 3+ newline jadi 1 baris kosong
    .replace(/^\n+/, '')          // buang baris kosong di awal
    .replace(/\n*$/, '\n');       // tepat satu newline di akhir

  const after = stats(tidy);
  writeFileSync(file, tidy);

  console.log(`${file}`);
  console.log(`  sebelum : ${before.total} baris (${before.blank} kosong), ${before.statements} statement CREATE, ${before.bytes} B`);
  console.log(`  sesudah : ${after.total} baris (${after.blank} kosong), ${after.statements} statement CREATE, ${after.bytes} B`);

  if (before.content !== after.content || before.statements !== after.statements) {
    console.error('  ⚠ PERINGATAN: jumlah baris berisi / statement berubah — periksa manual!');
    process.exitCode = 1;
  } else {
    console.log('  ✓ Isi SQL utuh (baris berisi & jumlah statement identik).');
  }
}