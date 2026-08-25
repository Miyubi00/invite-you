import { describe, expect, it } from 'vitest';
import { requireAffected } from './mutationGuard';

describe('requireAffected', () => {
  it('mengembalikan jumlah baris terpengaruh saat mutasi sukses', () => {
    expect(requireAffected({ count: 1, error: null }, 'x')).toBe(1);
    expect(requireAffected({ count: 5, error: null }, 'x')).toBe(5);
  });

  it('melempar pesan error asli bila mutasi gagal di DB', () => {
    expect(() =>
      requireAffected({ count: 0, error: { message: 'Koneksi DB gagal' } }, 'x'),
    ).toThrow('Koneksi DB gagal');
  });

  it('melempar zeroRowsMessage bila RLS memblokir (count 0 tanpa error)', () => {
    expect(() =>
      requireAffected({ count: 0, error: null }, 'Tidak diizinkan mengubah pesanan ini.'),
    ).toThrow('Tidak diizinkan mengubah pesanan ini.');
  });

  it('memperlakukan count null sebagai 0 baris terpengaruh', () => {
    expect(() => requireAffected({ count: null, error: null }, 'Nol baris')).toThrow('Nol baris');
  });
});