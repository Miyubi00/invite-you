// ============================================================
// src/pages/AdminPanelPage.tsx
// ------------------------------------------------------------
// Halaman /admin: gerbang login admin, lalu shell panel (navbar + sidebar) dengan tab Orders dan Templates.
// Dipakai di  : App.tsx
// Keterikatan : components/admin/*, hooks/useUrlTab, lib/supabaseClient, lib/customerClient
// ============================================================

// Shell layout (sidebar + area konten) mirip CustomerDashboardPage.tsx.
// Logika data, halaman edit full (bukan modal), dan dialog konfirmasi tidak berubah.

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import type { OrderRow, OrderEditForm } from "../types/database";
import { useAdminSession, useAdminCatalog, useOrdersPaged } from "../hooks/useAdminData";
import { useToast } from "../components/GlobalToast";
import { useUrlTab } from "../hooks/useUrlTab";
import ConfirmDialog from "../components/ConfirmDialog";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar, { type MenuItem } from "../components/admin/AdminSidebar";
import AdminLogin from "../components/admin/AdminLogin";
import OrdersTab from "../components/admin/OrdersTab";
import TemplatesTab from "../components/admin/TemplatesTab";
import EditOrderModal from "../components/admin/EditOrderModal";
import { ClipboardList, Clock, Palette, LogOut, Loader2, Menu } from "lucide-react";

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  isDanger: boolean;
  onConfirm: (() => void) | null;
}

/** Banner peringatan bila daftar terpotong oleh server-side cap. */
function CapNotice({ total, shown, label }: { total: number | null; shown: number; label: string }) {
  if (typeof total !== "number" || total <= shown) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
      Menampilkan {shown.toLocaleString("id-ID")} {label} terbaru dari total{" "}
      {total.toLocaleString("id-ID")}. Data lebih lama tidak termuat dalam daftar ini.
    </div>
  );
}

export default function AdminPanel() {
  const toast = useToast();

  // Logika sesi & data katalog diekstrak ke src/hooks/useAdminData.ts —
  // page ini tinggal shell UI + orkestrasi tab / deep-link edit.
  const {
    pendingOrders, pendingTotal,
    templates,
    loading,
    searchTerm, setSearchTerm,
    fetchData,
    setPendingOrders, setTemplates,
  } = useAdminCatalog();

  // Orders server-side: filter + pagination dieksekusi database.
  const ordersFilter = useOrdersPaged();

  // Refresh gabungan untuk aksi admin (aktifkan/hapus pesanan, simpan edit).
  const { refresh: refreshOrders } = ordersFilter;
  const refreshAll = useCallback(async () => {
    await Promise.all([fetchData(), refreshOrders()]);
  }, [fetchData, refreshOrders]);

  const { session, setSession, sessionLoading } = useAdminSession(() => {
    void fetchData();
    void ordersFilter.refresh();
  });

  // Tab aktif disinkronkan dengan URL (?tab=...) agar refresh tidak reset.
  const [activeTab, setActiveTab] = useUrlTab(["orders", "whatsapp", "templates", "edit"], "orders");
  const [searchParams, setSearchParams] = useSearchParams();
  const urlOrderId = searchParams.get("order") ?? "";
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, title: "", message: "", isDanger: true, onConfirm: null });
  const [editingOrder, setEditingOrder] = useState<OrderRow | null>(null);
  const [editFormData, setEditFormData] = useState<OrderEditForm>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const closeDialog = () => setDialog((prev) => ({ ...prev, isOpen: false }));
  const confirmAction = (title: string, message: string, isDanger: boolean, onConfirmFunc: () => void): void => {
    setDialog({ isOpen: true, title, message, isDanger, onConfirm: onConfirmFunc });
  };

  // Logout: buka dialog dulu; aksi sesungguhnya di performLogout.
  const performLogout = async () => {
    await supabase.auth.signOut();
    ordersFilter.resetFilters();
    setPendingOrders([]);
    setTemplates([]);
    setSession(null);
    toast.success("Berhasil Logout");
  };

  const handleLogout = () => setShowLogoutDialog(true);

  const handleMenuClick = (id: string) => {
    if (id === activeTab) return;
    setActiveTab(id);
    setSearchTerm("");
    ordersFilter.resetFilters();
    setSidebarOpen(false);
  };

  // Buka halaman edit full data (bukan modal) dari OrdersTab.
  // RSVP dimuat server-side oleh useRsvpServer di dalam EditOrderModal.
  const handleEditOrder = (order: OrderRow) => {
    setEditingOrder(order);
    setEditFormData({
      ...order.event_details,
      groom_name: order.groom_name,
      bride_name: order.bride_name,
      wedding_date: order.wedding_date,
      payment_status: order.payment_status,
      slug: order.slug,
      template_slug: order.template_slug,
      gallery: order.event_details?.gallery || [],
      banks: order.event_details?.banks || [],
      audio_url: order.event_details?.audio_url || "",
      quote: order.event_details?.quote || "",
      quote_src: order.event_details?.quote_src || "",
    } as OrderEditForm);

    // Aktifkan tab edit (state + ?tab=edit via hook)…
    setActiveTab("edit");

    // …lalu lengkapi deep-link dengan order id agar refresh tetap di sini.
    const next = new URLSearchParams(searchParams);
    next.set("tab", "edit");
    next.set("order", order.id);
    setSearchParams(next, { replace: true });
  };

  // Deep-link ?tab=edit&order=<id>: rebuild sesi edit dari data ter-fetch.
  useEffect(() => {
    if (!session || loading) return;
    if (activeTab !== "edit" || !urlOrderId || editingOrder) return;

    const timer = setTimeout(async () => {
      // Cari di halaman aktif dulu; bila tidak ada (order lama di halaman
      // lain), ambil langsung by id agar deep-link edit tetap bekerja.
      const local = ordersFilter.rows.find((o) => o.id === urlOrderId);
      if (local) {
        handleEditOrder(local);
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", urlOrderId)
        .maybeSingle();
      if (data) {
        handleEditOrder(data);
      } else {
        // Order sudah tidak ada → kembali ke daftar (sekaligus bersihkan param)
        setActiveTab("orders");
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading, activeTab, urlOrderId, editingOrder, ordersFilter.rows]);

  // Kembali ke Data Pesanan dari halaman edit full.
  const handleBackToOrders = () => {
    setEditingOrder(null);
    setActiveTab("orders");
  };

  // Setelah simpan berhasil, kembali ke Data Pesanan.
  const handleSaved = () => setActiveTab("orders");

  const userEmail = session?.user?.email ?? "";

  // MENU SIDEBAR: edit tidak ada di menu — dibuka via tombol Edit di OrdersTab.
  const menuItems: MenuItem[] = [
    { id: "orders", label: "Data Pesanan", icon: ClipboardList, badge: ordersFilter.total > 0 ? ordersFilter.total : null },
    { id: "whatsapp", label: "Data Masuk (WhatsApp)", icon: Clock, badge: pendingOrders.length },
    { id: "templates", label: "Kelola Template", icon: Palette, badge: null },
  ];

  // --- AUTH / DATA LOADING GUARD ---
  if (sessionLoading) {
    return (
      <div className="flex h-dvh w-full text-gray-500 font-sans bg-[#F1E8DC] items-center justify-center">
        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
        Memuat data...
      </div>
    );
  }

  if (!session) {
    return <AdminLogin toast={toast} />;
  }


  // --- SHELL LAYOUT (mirip Dashboard.tsx) ---
  return (
    <div className="flex flex-col overflow-hidden h-dvh w-full font-sans bg-[#F1E8DC] relative">
      {/* Desktop Navbar */}
      <AdminNavbar userEmail={userEmail} />

      <div className="flex flex-1 overflow-hidden min-h-0 w-full relative">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="z-40 bg-black/40 fixed inset-0 lg:hidden" />
        )}

        {/* Sidebar (desktop tetap, mobile drawer) */}
        <AdminSidebar
          menuItems={menuItems}
          activeTab={activeTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
          userEmail={userEmail}
        />

        {/* Dialog Konfirmasi Umum */}
        <ConfirmDialog
          isOpen={dialog.isOpen}
          title={dialog.title}
          message={dialog.message}
          isDanger={dialog.isDanger}
          onCancel={closeDialog}
          onConfirm={dialog.onConfirm ?? undefined}
        />

        <div className="flex flex-1 flex-col overflow-hidden h-full min-h-0 min-w-0 relative">
          {/* Mobile Header */}
          <header className="flex px-4 py-3 bg-[#712E1E] border-b border-black/20 shrink-0 items-center gap-2 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
              <Menu size={20} className="text-[#FFD5AF]" />
            </button>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-white">
                {menuItems.find((m) => m.id === activeTab)?.label ?? "Edit Undangan"}
              </h2>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-white/10" title="Keluar">
              <LogOut size={18} className="text-red-300" />
            </button>
          </header>

          {/* Scrollable Main Body (satu-satunya area yang scroll) */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {activeTab === "edit" && editingOrder ? (
              <EditOrderModal
                editingOrder={editingOrder}
                setEditingOrder={setEditingOrder}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                templates={templates}
                fetchData={refreshAll}
                toast={toast}
                onBack={handleBackToOrders}
                onSaved={handleSaved}
              />
            ) : (
              <div className="max-w-7xl mx-auto space-y-6">
                {activeTab === "orders" && (
                  <OrdersTab
                    ordersSrv={ordersFilter}
                    pendingOrders={pendingOrders}
                    confirmAction={confirmAction}
                    fetchData={refreshAll}
                    toast={toast}
                    viewMode="orders"
                    onEditOrder={handleEditOrder}
                  />
                )}

                {activeTab === "whatsapp" && (
                  <>
                    <CapNotice total={pendingTotal} shown={pendingOrders.length} label="pesanan masuk" />
                    <OrdersTab
                      ordersSrv={ordersFilter}
                      pendingOrders={pendingOrders}
                      confirmAction={confirmAction}
                      fetchData={refreshAll}
                      toast={toast}
                      viewMode="pending"
                      onEditOrder={handleEditOrder}
                    />
                  </>
                )}

                {activeTab === "templates" && (
                  <TemplatesTab
                    templates={templates}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    confirmAction={confirmAction}
                    fetchData={fetchData}
                    toast={toast}
                    loading={loading}
                  />
                )}

                {activeTab === "edit" && !editingOrder && (
                  <p className="text-sm text-gray-500 py-10">Pilih pesanan dari menu Data Pesanan, lalu klik tombol Edit untuk mengubah data.</p>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Dialog Konfirmasi Keluar */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Konfirmasi Keluar"
        message="Yakin ingin keluar dari Admin Panel?"
        isDanger={true}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={performLogout}
      />
    </div>
  );
}
