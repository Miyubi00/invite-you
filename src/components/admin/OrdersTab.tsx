// ============================================================
// src/components/admin/OrdersTab.tsx
// ------------------------------------------------------------
// Tab "Orders" Admin Panel: tabel order + pending order, pencarian, filter status, dan pagination.
// Dipakai di  : pages/AdminPanelPage.tsx
// Keterikatan : lib/supabaseClient, components/shared/Pagination, components/GlobalToast, types/database
// ============================================================

import { useState } from 'react';
import { Clock, CheckCircle, XCircle, Calendar, Eye, Edit, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import type { OrderRow, PendingOrderRow } from '../../types/database';
import type { ToastApi } from '../GlobalToast';
import Pagination from '../shared/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useOrdersPaged } from '../../hooks/useAdminData';

interface OrdersTabProps {
  /** Daftar pesanan SERVER-SIDE: filter + pagination dieksekusi database. */
  ordersSrv: ReturnType<typeof useOrdersPaged>;
  pendingOrders: PendingOrderRow[];
  confirmAction: (title: string, message: string, isDanger: boolean, onConfirm: () => void) => void;
  /** Refresh gabungan: pending/templates (katalog) + halaman orders aktif. */
  fetchData: () => Promise<void>;
  toast: ToastApi;
  /** Filter tampilan: "all" = orders+pending, "orders" = aktif saja, "pending" = WhatsApp saja */
  viewMode?: "all" | "orders" | "pending";
  /** Dipanggil saat tombol Edit ditekan; parent mengatur halaman edit full */
  onEditOrder?: (order: OrderRow) => void;
}

export default function OrdersTab({
  ordersSrv, pendingOrders, confirmAction,
  fetchData, toast,
  viewMode = "all",
  onEditOrder,
}: OrdersTabProps) {
  const {
    searchInput, setSearchInput,
    dateInput, setDateInput,
    paymentInput, setPaymentInput,
    applyFilters: handleApplyFilters,
    resetFilters: handleResetFilters,
    hasActiveFilter,
    applied,
    rows: ordersRows, total: ordersTotal, loading: ordersLoading,
    page: ordersPage, setPage: setOrdersPage,
    pageSize: ordersPageSize, setPageSize: setOrdersPageSize,
    totalPages: ordersTotalPages,
  } = ordersSrv;

  const [activatingId, setActivatingId] = useState<string | null>(null);

  // --- LOGIC ORDERS ---
  // Aktivasi kini via Edge Function: slug + PIN digenerate server-side,
  // lalu PIN dikirim otomatis ke email pelanggan via Resend.
  const handleApprovePending = (pendingOrder: PendingOrderRow) => {
    confirmAction(
      "Aktifkan Pesanan?",
      `Pesanan atas nama ${pendingOrder.groom_name} & ${pendingOrder.bride_name} akan diaktifkan. PIN 6 digit otomatis dikirim ke ${pendingOrder.email || 'email pelanggan'}.`,
      false,
      async () => {
        setActivatingId(pendingOrder.id);
        try {
          const { data, error } = await supabase.functions.invoke('activate-pending-order', {
            body: { pending_id: pendingOrder.id },
          });

          if (error) throw new Error(error.message);
          if (data?.error) throw new Error(data.error);

          if (data?.email_sent) {
            toast.success(`Pesanan aktif! PIN dikirim ke ${data.order.email}.`);
          } else if (data?.pin) {
            toast.warning(`Aktif, tapi email kosong. Catat manual — PIN: ${data.pin}`);
          } else {
            toast.success('Pesanan berhasil diaktifkan.');
          }
          fetchData();
        } catch (err) {
          console.error('[OrdersTab] Aktivasi gagal:', err);
          toast.error('Gagal mengaktifkan: ' + (err instanceof Error ? err.message : err));
        } finally {
          setActivatingId(null);
        }
      }
    );
  };

  const handleRejectPending = (id: string) => {
    confirmAction("Tolak & Hapus Pesanan?", "Pesanan ini akan ditolak dan dihapus secara permanen.", true,
      async () => {
        const { count, error } = await supabase
          .from('pending_orders')
          .delete({ count: 'exact' })
          .eq('id', id);
        if (!error && (count ?? 0) > 0) {
          toast.success("Pesanan ditolak & dihapus.");
          fetchData();
        } else if (!error) {
          // RLS memblokir / baris sudah terhapus — jangan tampilkan sukses palsu.
          toast.error("Gagal menghapus: tidak ada data yang terhapus. Coba muat ulang daftar.");
        } else {
          toast.error("Gagal menghapus: " + error.message);
        }
      }
    );
  };

  const openDeleteDialog = (id: string) => {
    confirmAction("Hapus Data Permanen?", "Data undangan ini akan dihapus selamanya. Tindakan ini tidak bisa dibatalkan.", true,
      async () => {
        // Hapus atomik (orders + rsvps) lewat RPC khusus admin — transaksi
        // tunggal, sehingga tidak ada kondisi setengah-terhapus.
        const { data, error } = await supabase.rpc('delete_order_cascade', { p_order_id: id });

        if (error) {
          toast.error("Gagal hapus: " + error.message);
          return;
        }

        const result = data as { orders_deleted?: number; rsvps_deleted?: number } | null;
        if (!result || (result.orders_deleted ?? 0) === 0) {
          toast.error("Gagal hapus: tidak ada data yang terhapus.");
          return;
        }

        toast.success(`Data dihapus (${result.orders_deleted} pesanan, ${result.rsvps_deleted ?? 0} buku tamu).`);
        // Bersihkan seluruh folder media pesanan di bucket R2 (fire-and-forget).
        supabase.functions
          .invoke('r2-delete', { body: { orderId: id, purgeFolder: true } })
          .catch((e) => console.warn('[OrdersTab] Cleanup folder gagal:', e));
        fetchData();
      }
    );
  };


  // Edit full data dikelola oleh parent via onEditOrder -> membuka halaman edit (bukan modal).



  const calculateDuration = (dateString?: string) => {
      // eslint-disable-next-line react-hooks/purity -- durasi "X hari" memang dihitung relatif terhadap sekarang
      const target = dateString ? new Date(dateString).getTime() : Date.now();
      // eslint-disable-next-line react-hooks/purity -- idem
      const diff = Math.abs(Date.now() - target);
      return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // --- FILTER PENDING (client-side; tabel kecil, cap 500 di katalog) ---
  const filteredPending = pendingOrders.filter(o => {
    const q = applied.search.toLowerCase();
    const matchSearch = !q || o.groom_name?.toLowerCase().includes(q) || o.bride_name?.toLowerCase().includes(q);
    const matchDate = !applied.date || (o.created_at && new Date(o.created_at).toISOString().slice(0, 10) === applied.date);
    return matchSearch && matchDate;
  });

  // --- PAGINATION PENDING (client-side) ---
  // Orders TIDAK dipaginasi client-side lagi — rows/total datang dari server.
  const pendingPg = usePagination(filteredPending, `${applied.search}|${applied.date}`);

  // --- VIEW FILTER ---
  const showPending = viewMode === "all" || viewMode === "pending";
  const showOrders = viewMode === "all" || viewMode === "orders";

  return (
    <div className="animate-fade-in">

        {/* Header Halaman */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800">{viewMode === 'pending' ? 'Data Masuk WhatsApp' : 'Data Pesanan'}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {viewMode === 'pending'
              ? 'Daftar pesanan yang masuk melalui WhatsApp dan menunggu persetujuan admin.'
              : 'Kelola dan pantau semua data undangan yang sudah aktif di sistem.'}
          </p>
        </div>

        {/* Filter Toolbar — filter baru aktif setelah tekan Cari / Enter */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}
          className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#EBDFCE] bg-white p-4 shadow-sm md:flex-row md:items-end"
        >
  {/* 1. Input Cari Nama */}
  <div className="min-w-[240px] flex-1">
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
      <Search size={13} className="text-[#E59A59]" />
      <span>Cari Nama Mempelai</span>
    </label>
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input
        type="text"
        placeholder="Ketik nama mempelai..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] pl-9 pr-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
      />
    </div>
  </div>

  {/* 2. Filter Tanggal */}
  <div className="min-w-[170px]">
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
      <Calendar size={13} className="text-[#E59A59]" />
      <span>Filter Tanggal</span>
    </label>
    <input
      type="date"
      value={dateInput}
      onChange={(e) => setDateInput(e.target.value)}
      className="h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
    />
  </div>

  {/* 3. Filter Pembayaran (Conditional) */}
  {showOrders && (
    <div className="min-w-[170px]">
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
        <Filter size={13} className="text-[#E59A59]" />
        <span>Status Bayar</span>
      </label>
      <select
        value={paymentInput}
        onChange={(e) => setPaymentInput(e.target.value as typeof paymentInput)}
        className="h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
      >
        <option value="all">Semua Status</option>
        <option value="success">Lunas</option>
        <option value="pending">Pending</option>
        <option value="failed">Gagal</option>
      </select>
    </div>
  )}

  {/* 4. Action Buttons (Cari selalu tampil; Reset muncul saat ada filter aktif) */}
  <div className="flex shrink-0 gap-2">
    {hasActiveFilter && (
      <button
        type="button"
        onClick={handleResetFilters}
        className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 whitespace-nowrap"
      >
        <Trash2 size={13} />
        <span>Reset Filter</span>
      </button>
    )}
    <button
      type="submit"
      className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#E59A59] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#d48b4b] active:scale-95 whitespace-nowrap"
    >
      <Search size={13} />
      <span>Cari</span>
    </button>
  </div>
</form>

                {/* Tabel Pending Orders (Via WhatsApp) */}
        {showPending && (
        <div className="mb-10">
            {filteredPending.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-[#EBDFCE] p-10 text-center text-stone-400 text-sm">
                Tidak ada data ditemukan
              </div>
            ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-[#EBDFCE] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-[#FAF6EE] text-[#712E1E] uppercase font-bold text-xs tracking-wider border-b border-[#EBDFCE]">
                    <tr>
                    <th className="p-4">Tanggal Order</th>
                    <th className="p-4">Mempelai</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Kontak Info</th>
                    <th className="p-4 text-center">Tindakan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EBDF]">
                    {pendingPg.pageItems.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF6EE]/60 transition group">
                        <td className="p-4"><span className="text-xs text-stone-500 font-medium">{(order.created_at ? new Date(order.created_at) : new Date()).toLocaleDateString('id-ID')}</span></td>
                        <td className="p-4"><div className="font-bold text-[#712E1E] text-base">{order.groom_name} & {order.bride_name}</div><div className="text-xs text-stone-500 mt-1">Acara: {order.wedding_date}</div></td>
                        <td className="p-4"><span className="bg-[#F7EEE3] text-[#B4693F] px-2 py-1 rounded text-xs border border-[#EBDFCE] font-medium">{order.template_slug}</span></td>
                        <td className="p-4">
                        <a href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 w-fit px-2 py-1 rounded border border-emerald-100 transition"><FaWhatsapp className="w-3 h-3"/> Chat Pembeli</a>
                        </td>
                        <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => handleApprovePending(order)}
                                disabled={activatingId === order.id}
                                className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition shadow-sm font-bold text-xs flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {activatingId === order.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : <><CheckCircle className="w-4 h-4" /> Aktifkan</>}
                            </button>
                            <button onClick={() => handleRejectPending(order.id)} className="bg-red-50 text-red-600 p-1.5 rounded-lg hover:bg-red-100 transition border border-red-200" title="Tolak / Hapus"><XCircle className="w-4 h-4" /></button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                page={pendingPg.page}
                totalPages={pendingPg.totalPages}
                total={pendingPg.total}
                pageSize={pendingPg.pageSize}
                onPageChange={pendingPg.setPage}
                onPageSizeChange={pendingPg.setPageSize}
            />
            </div>
            )}
        </div>
        )}

                {/* Tabel Data Undangan Aktif */}
        {showOrders && (
        <div>
        {ordersLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#EBDFCE] p-10 text-center text-stone-400 text-sm">
            Memuat data pesanan…
          </div>
        ) : ordersRows.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-[#EBDFCE] p-10 text-center text-stone-400 text-sm">
            {hasActiveFilter ? "Tidak ada data ditemukan." : "Belum ada data pesanan."}
          </div>
        ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#EBDFCE] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
                <thead className="bg-[#FAF6EE] text-[#712E1E] uppercase font-bold text-xs tracking-wider border-b border-[#EBDFCE]">
                <tr>
                    <th className="p-4">Info Order</th>
                    <th className="p-4">Mempelai & Tanggal</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Pembayaran</th>
                    <th className="p-4 text-center">Kontrol</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EBDF]">
                {ordersRows.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF6EE]/60 transition group">
                    <td className="p-4"><span className="font-mono text-xs text-stone-400 block mb-1">#{order.id.slice(0,8)}</span><span className="bg-[#FAF6EE] text-stone-600 text-[10px] px-2 py-1 rounded border border-[#EBDFCE]"><Clock className="w-3 h-3 inline -mt-0.5 mr-1" />{calculateDuration(order.created_at)} Hari Yg Lalu</span></td>
                    <td className="p-4"><div className="font-bold text-[#712E1E] text-base">{order.groom_name} & {order.bride_name}</div><div className="text-xs text-stone-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/> {order.wedding_date}</div></td>
                    <td className="p-4"><span className="bg-[#F7EEE3] text-[#B4693F] px-2 py-1 rounded text-xs border border-[#EBDFCE] font-medium">{order.template_slug}</span></td>
                    <td className="p-4">
                        {order.payment_status === 'success' ? <span className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-green-100"><CheckCircle className="w-3 h-3" /> Lunas</span> : <span className="flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-red-100"><XCircle className="w-3 h-3" /> {order.payment_status}</span>}
                    </td>
                    <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                        <a href={`/wedding/${order.slug}`} target="_blank" rel="noreferrer" className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition border border-green-200" title="Lihat Website"><Eye className="w-4 h-4" /></a>
                        {order.whatsapp && <a href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-100 transition border border-emerald-200" title="Chat WhatsApp"><FaWhatsapp className="w-4 h-4" /></a>}
                        <button onClick={() => onEditOrder?.(order)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition border border-blue-200" title="Edit Full Data"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => openDeleteDialog(order.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition border border-red-200" title="Hapus Permanen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
                        </table>
            </div>

            {/* Pagination (server-side — selector 10/25/50 berfungsi) */}
            <Pagination
                page={ordersPage}
                totalPages={ordersTotalPages}
                total={ordersTotal}
                pageSize={ordersPageSize}
                onPageChange={setOrdersPage}
                onPageSizeChange={setOrdersPageSize}
            />
        </div>
        )}
        </div>)}
    </div>
  );
}
