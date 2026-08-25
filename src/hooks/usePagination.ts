// ============================================================
// src/hooks/usePagination.ts
// ------------------------------------------------------------
// Pagination generik: slicing data per halaman + state ukuran halaman; reset otomatis saat filter berubah.
// Dipakai di  : OrdersTab, TemplatesTab, RsvpTab
// Keterikatan : react (useState)
// ============================================================

// Hook pagination generik: slicing data per halaman + state ukuran halaman.
// Halaman otomatis reset ke 1 saat resetKey (gabungan nilai filter) berubah,
// dan di-clamp bila jumlah data menyusut.

import { useState } from "react";

export function usePagination<T>(items: T[], resetKey: string, defaultSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultSize);

  // Reset ke halaman 1 saat filter berubah — pola resmi React:
  // menyesuaikan state selama render ketika prop turunan berubah.
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    pageItems: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    setPage,
    pageSize,
    setPageSize,
  };
}
