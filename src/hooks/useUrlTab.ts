// ============================================================
// src/hooks/useUrlTab.ts
// ------------------------------------------------------------
// Sinkronisasi tab aktif dengan query param URL (?tab=...) - fallback nilai invalid, replace history agar tidak menumpuk.
// Dipakai di  : CustomerDashboardPage, AdminPanelPage
// Keterikatan : react-router-dom (useSearchParams)
// ============================================================

// Sinkronisasi tab aktif dengan query param URL (?tab=...) agar refresh
// halaman tidak mengembalikan dashboard ke tab awal.
// - Nilai param tidak valid → fallback otomatis.
// - Kembali ke fallback → param dibersihkan agar URL tetap ramping.
// - Menggunakan replace:true agar riwayat navigasi tidak menumpuk.

import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlTab(allowed: string[], fallback: string): [string, (tab: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlTab = searchParams.get('tab') ?? '';
  const [currentTab, setCurrentTab] = useState(
    allowed.includes(urlTab) ? urlTab : fallback,
  );

  const setTab = useCallback(
    (tab: string) => {
      if (!allowed.includes(tab)) return;
      setCurrentTab(tab);

      const next = new URLSearchParams(searchParams);
      if (tab === fallback) {
        next.delete('tab');
        // Bersihkan juga param pelengkap saat kembali ke default (mis. order id)
        next.delete('order');
      } else {
        next.set('tab', tab);
      }
      setSearchParams(next, { replace: true });
    },
    [allowed, fallback, searchParams, setSearchParams],
  );

  return [currentTab, setTab];
}
