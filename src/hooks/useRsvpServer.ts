// ============================================================
// src/hooks/useRsvpServer.ts
// ------------------------------------------------------------
// Daftar buku tamu (RSVP) SERVER-SIDE: filter draft/applied, pagination
// (.range + count exact), statistik per-status (query head-only), dan
// export seluruh baris yang cocok dengan filter aktif.
// Dipakai di  : components/customer/RsvpTab.tsx
// Keterikatan : lib/customerClient, components/GlobalToast, types/database
// ============================================================

// Menggantikan pola lama (fetch ≤500 baris -> filter/pagination client-side).
// Sekarang database mengerjakan filtering + paging; UI hanya menerima satu
// halaman sehingga jumlah tamu ribuan pun tetap ringan.

import { useCallback, useEffect, useState } from 'react';
import { resolveDbClient } from '../lib/customerClient';
import { useToast } from '../components/GlobalToast';
import type { RsvpRow } from '../types/database';
import { useTranslation } from '../i18n';

export type RsvpStatusFilter = 'all' | 'hadir' | 'tidak_hadir' | 'ragu';

const PAGE_SIZE_DEFAULT = 10;
/** Batas aman export CSV (baris) agar browser tidak kehabisan memori. */
const EXPORT_MAX_ROWS = 5000;
/** Ukuran tiap batch saat menarik semua baris untuk export. */
const EXPORT_BATCH_SIZE = 1000;

/** Escape wildcard ILIKE (% _ \) supaya input user dipakai literal. */
export function escapeIlike(value: string): string {
  return value.replace(/([%_\\])/g, '\\$1');
}

export function useRsvpServer(orderId: string | undefined, initialPageSize = PAGE_SIZE_DEFAULT) {
  const toast = useToast();
  const { t } = useTranslation();

  // --- Draft filter (baru aktif setelah tombol Cari / Enter) ---
  const [searchInput, setSearchInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [statusInput, setStatusInput] = useState<RsvpStatusFilter>('all');

  // --- Applied filter (sumber kebenaran query) ---
  const [applied, setApplied] = useState<{
    search: string;
    date: string;
    status: RsvpStatusFilter;
  }>({ search: '', date: '', status: 'all' });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const [rows, setRows] = useState<RsvpRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ hadir: 0, tidakHadir: 0, ragu: 0 });

  /**
   * Susun query RSVP dengan filter aktif.
   * headOnly=true hanya mengambil angka count (untuk statistik/export loop).
   */
  const buildQuery = useCallback(
    (opts: {
      headOnly?: boolean;
      status?: Exclude<RsvpStatusFilter, 'all'>;
      offset?: number;
      limit?: number;
    }) => {
      let q = resolveDbClient()
        .from('rsvps')
        .select(opts.headOnly ? 'id' : '*', { count: 'exact', head: opts.headOnly ?? false })
        .eq('order_id', orderId ?? '');

      if (applied.search) {
        // 1) Escape wildcard ILIKE (% _ \) agar input dipakai literal.
        // 2) Nilai .or() DIBUTUNG KUTIP-GANDA: koma/kurung dalam pesan tamu
        //    otherwise memutus parser .or() PostgREST (koma = pemisah kondisi).
        //    Kutip-ganda di dalam nilai di-escape dengan penggandaan ("").
        const esc = escapeIlike(applied.search).replace(/"/g, '""');
        q = q.or(`guest_name.ilike."%${esc}%",message.ilike."%${esc}%"`);
      }
      if (applied.date) {
        // Timestamptz dibandingkan dalam WIB (+07:00) supaya tanggal yang
        // dilihat admin (id-ID) konsisten dengan tanggal isi tamu — tanpa
        // offset, rentang jatuh di UTC dan RSVP dini hari WIB melenceng 1 hari.
        q = q
          .gte('created_at', `${applied.date}T00:00:00+07:00`)
          .lte('created_at', `${applied.date}T23:59:59.999+07:00`);
      }
      // Filter status dari state applied — WAJIB ikut di SEMUA query
      // (halaman, statistik, export). Sebelumnya hanya ikut di query
      // statistik, sehingga tabel/total tidak pernah terfilter status.
      if (applied.status !== 'all') q = q.eq('status', applied.status);
      if (opts.status) q = q.eq('status', opts.status);

      q = q.order('created_at', { ascending: false });
      if (typeof opts.offset === 'number' && typeof opts.limit === 'number') {
        q = q.range(opts.offset, opts.offset + opts.limit - 1);
      }
      return q;
    },
    [orderId, applied],
  );

  /** Muat halaman aktif + statistik paralel (mengikuti filter aktif). */
  const refresh = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const { data, count, error } = await buildQuery({
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
      if (error) throw error;
      setRows(data ?? []);
      setTotal(count ?? 0);

      // Statistik per-status: 3 query count paralel (tanpa memuat baris),
      // dengan filter pencarian/tanggal yang sama seperti tabel.
      const statuses = ['hadir', 'tidak_hadir', 'ragu'] as const;
      const counts = await Promise.all(
        statuses.map(async (s) => {
          const { count: c, error: statError } = await buildQuery({ headOnly: true, status: s });
          if (statError) throw statError;
          return c ?? 0;
        }),
      );
      setStats({ hadir: counts[0], tidakHadir: counts[1], ragu: counts[2] });
    } catch (e) {
      console.error('[useRsvpServer] Gagal memuat RSVP:', e);
      toast.error(t('toast.rsvpLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page, pageSize, orderId, toast, t]);

  useEffect(() => {
    let cancelled = false;
    // Defer ke microtask: menghindari setState sinkron langsung di body
    // effect (aturan react-hooks/set-state-in-effect), perilaku sama.
    void Promise.resolve().then(() => {
      if (!cancelled) void refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = () => {
    setApplied({ search: searchInput.trim(), date: dateInput, status: statusInput });
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput('');
    setDateInput('');
    setStatusInput('all');
    setApplied({ search: '', date: '', status: 'all' });
    setPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  /**
   * Tarik SEMUA baris yang cocok dengan filter aktif (loop per batch) —
   * dipakai export CSV. Dibatasi EXPORT_MAX_ROWS sebagai pengaman memori.
   */
  const fetchAllForExport = useCallback(async (): Promise<RsvpRow[]> => {
    if (!orderId) return [];
    const all: RsvpRow[] = [];
    let offset = 0;
    // Loop berdasarkan batch; berhenti saat batch terakhir lebih pendek.
    while (offset < EXPORT_MAX_ROWS) {
      const { data, error } = await buildQuery({ offset, limit: EXPORT_BATCH_SIZE });
      if (error) throw error;
      const batch = data ?? [];
      all.push(...batch);
      if (batch.length < EXPORT_BATCH_SIZE) break;
      offset += EXPORT_BATCH_SIZE;
    }
    if (offset >= EXPORT_MAX_ROWS) {
      toast.warning(t('toast.exportLimit', { count: EXPORT_MAX_ROWS.toLocaleString('id-ID') }));
    }
    return all;
  }, [buildQuery, orderId, toast, t]);

  return {
    // draft
    searchInput, setSearchInput,
    dateInput, setDateInput,
    statusInput, setStatusInput,
    applyFilters, resetFilters,
    hasActiveFilter: Boolean(applied.search) || Boolean(applied.date) || applied.status !== 'all',
    // data
    rows, total, loading, stats,
    // paging
    page, setPage, pageSize, setPageSize, totalPages,
    // util
    refresh, fetchAllForExport,
  };
}