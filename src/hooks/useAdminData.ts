// ============================================================
// src/hooks/useAdminData.ts
// ------------------------------------------------------------
// Hook Admin Panel: sesi Supabase Auth (useAdminSession) dan data katalog
// orders/pending/templates dengan cap baris server-side (useAdminCatalog).
// Diekstrak dari pages/AdminPanelPage.tsx agar page tinggal shell UI.
// Dipakai di  : pages/AdminPanelPage.tsx
// Keterikatan : lib/supabaseClient, lib/customerClient, components/GlobalToast
// ============================================================

// Dua hook untuk Admin Panel:
// - useAdminSession : state sesi + listener onAuthStateChange.
// - useAdminCatalog : orders/pending/templates. Query orders & pending_orders
//   di-CAP di sisi server (limit + count exact) sehingga tidak lagi melakukan
//   full-table select yang tumbuh seiring bisnis; total persis dikembalikan
//   agar UI bisa menampilkan banner "data terpotong".

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { clearCustomerToken } from "../lib/customerClient";
import { useToast } from "../components/GlobalToast";
import { escapeIlike } from "./useRsvpServer";
import type { OrderRow, PendingOrderRow, TemplateRow } from "../types/database";
import { useTranslation } from "../i18n";

export type OrderPaymentFilter = "all" | "success" | "pending" | "failed";

/** Batas baris pending_orders (tabel kecil; orders dikelola useOrdersPaged). */
const PENDING_MAX_ROWS = 500;

/**
 * Sesi admin: state + listener onAuthStateChange.
 * @param onSessionActive dipanggil saat sesi aktif terdeteksi (initial load /
 *        login sukses) — tempat parent memicu fetch data awal.
 */
export function useAdminSession(onSessionActive?: () => void) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Callback disimpan di ref: identitas boleh berubah tanpa me-re-subscribe
  // listener auth dan tanpa stale closure. Update dilakukan di effect (bukan
  // saat render) sesuai kontrak React refs.
  const activeCbRef = useRef(onSessionActive);
  useEffect(() => {
    activeCbRef.current = onSessionActive;
  }, [onSessionActive]);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(currentSession);
      setSessionLoading(false);
      if (currentSession) {
        // Token pelanggan (JWT order_id) TIDAK boleh menutupi sesi admin —
        // hook accessToken memberinya prioritas absolut.
        clearCustomerToken();
        activeCbRef.current?.();
      }
    };
    void loadSession();

    // INITIAL_SESSION sudah ditangani loadSession di atas — hindari fetch ganda.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted || event === "INITIAL_SESSION") return;
      setSession(currentSession);
      if (event === "SIGNED_IN" && currentSession) {
        clearCustomerToken();
        activeCbRef.current?.();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, setSession, sessionLoading };
}

/**
 * Data katalog admin: orders + pending_orders (cap + count exact) dan
 * templates (tabel kecil — dimuat penuh).
 */
export function useAdminCatalog() {
  const toast = useToast();
  const [pendingOrders, setPendingOrders] = useState<PendingOrderRow[]>([]);
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(false);
  // searchTerm: filter client-side untuk TemplatesTab (tabel kecil).
  // Filter orders/pending kini lewat useOrdersPaged / applied di masing-masing.
  const [searchTerm, setSearchTerm] = useState("");

  // Orders TIDAK dimuat di sini lagi — dikelola server-side oleh useOrdersPaged.
  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    const [resPending, resTemplates] = await Promise.all([
      supabase.from("pending_orders").select("*", { count: "exact" })
        .order("created_at", { ascending: false }).limit(PENDING_MAX_ROWS),
      supabase.from("templates").select("*").order("name", { ascending: true }),
    ]);
    if (!resPending.error) { setPendingOrders(resPending.data ?? []); setPendingTotal(resPending.count ?? null); }
    if (!resTemplates.error) setTemplates(resTemplates.data ?? []);

    // Jangan tampilkan daftar kosong diam-diam saat query gagal (mis. sesi
    // kedaluwarsa / RLS menolak) — admin perlu tahu bahwa data TIDAK kosong.
    const failed = [resPending, resTemplates].filter((r) => r.error);
    if (failed.length > 0) {
      toast.warning(
        `Sebagian data gagal dimuat (${failed.length}/2). Coba logout-login bila berlanjut.`,
      );
    }
    setLoading(false);
  }, [toast]);

  return {
    pendingOrders, pendingTotal, setPendingOrders,
    templates, setTemplates,
    loading,
    searchTerm, setSearchTerm,
    fetchData,
  };
}

/**
 * Daftar pesanan SERVER-SIDE: filter draft/applied (cari mempelai, tanggal
 * WIB, status bayar) + pagination (.range + count exact) — menggantikan
 * fetch 1000 baris + filter client-side. Pola sama dengan useRsvpServer.
 */
export function useOrdersPaged(initialPageSize = 25) {
  const toast = useToast();
  const { t } = useTranslation();

  // --- Draft filter ---
  const [searchInput, setSearchInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [paymentInput, setPaymentInput] = useState<OrderPaymentFilter>("all");

  // --- Applied filter ---
  const [applied, setApplied] = useState<{
    search: string;
    date: string;
    payment: OrderPaymentFilter;
  }>({ search: "", date: "", payment: "all" });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const buildQuery = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      let q = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (applied.search) {
        const safe = `%${escapeIlike(applied.search)}%`;
        q = q.or(`groom_name.ilike.${safe},bride_name.ilike.${safe}`);
      }
      if (applied.date) {
        q = q.eq("wedding_date", applied.date);
      }
      if (applied.payment !== "all") {
        q = q.eq("payment_status", applied.payment);
      }

      q = q.range(offset, offset + limit - 1);
      return q;
    },
    [applied],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count, error } = await buildQuery({
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });
      if (error) throw error;
      setRows(data ?? []);
      setTotal(count ?? 0);
    } catch (e) {
      console.error("[useOrdersPaged] Gagal memuat pesanan:", e);
      toast.error(t("toast.adminLoadOrdersFailed"));
    } finally {
      setLoading(false);
    }
  }, [buildQuery, page, pageSize, toast, t]);

  useEffect(() => {
    let cancelled = false;
    // Defer microtask: hindari setState sinkron di body effect (aturan lint).
    void Promise.resolve().then(() => {
      if (!cancelled) void refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const applyFilters = () => {
    setApplied({ search: searchInput.trim(), date: dateInput, payment: paymentInput });
    setPage(1);
  };

  const resetFilters = () => {
    setSearchInput("");
    setDateInput("");
    setPaymentInput("all");
    setApplied({ search: "", date: "", payment: "all" });
    setPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    searchInput, setSearchInput,
    dateInput, setDateInput,
    paymentInput, setPaymentInput,
    applyFilters, resetFilters, hasActiveFilter:
      Boolean(applied.search) || Boolean(applied.date) || applied.payment !== "all",
    applied,
    rows, total, loading,
    page, setPage, pageSize, setPageSize, totalPages,
    refresh,
  };
}