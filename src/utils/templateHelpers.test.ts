import { describe, expect, it } from 'vitest';
import { calcTimeLeft, resolveGallery, resolvePhotos, resolveVenue, safeDate } from './templateHelpers';
import type { TemplateData } from '../types/template';

describe('calcTimeLeft', () => {
  it('mengembalikan nol semua bila waktu sudah lewat', () => {
    expect(calcTimeLeft(new Date(Date.now() - 60_000))).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('menghitung sisa waktu 2 hari 3 jam 4 menit dengan benar', () => {
    const ms = (2 * 24 * 3600 + 3 * 3600 + 4 * 60 + 5) * 1000;
    const t = calcTimeLeft(new Date(Date.now() + ms));
    expect(t.days).toBe(2);
    expect(t.hours).toBe(3);
    expect(t.minutes).toBe(4);
    expect(t.seconds).toBeGreaterThanOrEqual(0);
    expect(t.seconds).toBeLessThanOrEqual(5);
  });
});

describe('safeDate', () => {
  it('mem-parse string tanggal valid', () => {
    expect(safeDate('2030-01-02').getFullYear()).toBe(2030);
  });
  it('fallback ke sekarang bila string kosong/tidak valid', () => {
    const before = Date.now();
    const d = safeDate('bukan-tanggal');
    expect(d.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(Number.isNaN(d.getTime())).toBe(false);
  });
});

describe('resolvePhotos / resolveGallery / resolveVenue', () => {
  it('memakai foto default bila data kosong', () => {
    const p = resolvePhotos(null);
    // Default foto kini termirror di R2 (lihat scripts/mirror-assets.mjs).
    expect(p.groom).toContain('r2.loverse.my.id/defaults/img/');
    expect(p.bride).toContain('r2.loverse.my.id/defaults/img/');
    expect(resolveGallery(null).length).toBeGreaterThan(0);
  });

  it('memakai foto dari data bila tersedia', () => {
    const data = { groom_photo: 'https://r2/g.webp', bride_photo: 'https://r2/b.webp' } as unknown as TemplateData;
    const p = resolvePhotos(data);
    expect(p.groom).toBe('https://r2/g.webp');
    expect(p.bride).toBe('https://r2/b.webp');
  });

  it('resolveGallery mengembalikan galeri custom bila ada', () => {
    const data = { gallery: ['https://r2/1.webp'] } as unknown as TemplateData;
    expect(resolveGallery(data)).toEqual(['https://r2/1.webp']);
  });

  it('resolveVenue fallback ke default bila venue kosong', () => {
    const v = resolveVenue(null);
    expect(v.name.length).toBeGreaterThan(0);
    const v2 = resolveVenue({ venue_name: 'Balai Kartini' } as unknown as TemplateData);
    expect(v2.name).toBe('Balai Kartini');
  });
});