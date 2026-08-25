// ============================================================
// src/pages/CustomerDashboardPage.tsx
// ------------------------------------------------------------
// Halaman /dashboard/:orderId - dashboard mempelai: shell (navbar + sidebar) dan orkestrasi tab Sebar/Edit/Buku Tamu.
// Dipakai di  : App.tsx
// Keterikatan : components/customer/*, hooks/useDashboardData, useUrlTab, lib/customerClient
// ============================================================

// Halaman Dashboard mempelai: shell layout (sidebar + area konten)
// dan orkestrasi antar tab. Logika data ada di hooks, UI per tab
// ada di src/components/customer/*.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  LogOut,
  Menu,
  MessageSquare,
  Save,
  Share2,
} from "lucide-react";
import { BASIC_TEMPLATES_SLUGS } from "../lib/constants";
import { useDashboardData } from "../hooks/useDashboardData";
import { DashboardSkeleton } from "../components/ui/SkeletonLoaders";
import { clearCustomerToken, getCustomerToken, refreshCustomerToken } from "../lib/customerClient";
import { useFileUpload } from "../hooks/useFileUpload";
import { useShareLink } from "../hooks/useShareLink";
import { useUrlTab } from "../hooks/useUrlTab";
import CustomerNavbar from "../components/customer/CustomerNavbar";
import CustomerSidebar, {
  type MenuItem,
} from "../components/customer/CustomerSidebar";
import ShareTab from "../components/customer/ShareTab";
import EditTab from "../components/customer/EditTab";
import RsvpTab from "../components/customer/RsvpTab";
import ConfirmDialog from "../components/ConfirmDialog";
import { useTranslation } from "../i18n";

export default function Dashboard() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const {
    order,
    loading,
    dataLoading,
    formData,
    setFormData,
    rsvpTotal,
    handleChange,
    handleSaveData,
  } = useDashboardData(orderId);

  const { uploading, converting, removing, activeUploadField, handleFileUpload, removeAudio, cropModal } = useFileUpload(
    orderId,
    setFormData,
    "IMG_",
    true,
    () => formData,
  );
  const shareLink = useShareLink(order);

  // Tab aktif disinkronkan dengan URL (?tab=...) agar refresh tidak reset.
  // Template Basic tidak punya tab RSVP → param itu difallback ke share.
  const isBasic = BASIC_TEMPLATES_SLUGS.includes(order?.template_slug ?? "");
  const [urlTab, setUrlTab] = useUrlTab(["share", "edit", "rsvp"], "share");
  const activeTab = isBasic && urlTab === "rsvp" ? "share" : urlTab;
  const setActiveTab = (tab: string) =>
    setUrlTab(isBasic && tab === "rsvp" ? "share" : tab);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Refresh sesi customer secara periodik: JWT ber-TTL pendek diperpanjang
  // tanpa PIN selama sesi < 24 jam; bila benar-benar habis, paksa login.
  useEffect(() => {
    const id = setInterval(async () => {
      const ok = await refreshCustomerToken();
      if (!ok && !getCustomerToken()) {
        navigate("/login");
      }
    }, 5 * 60 * 1000);
    return () => clearInterval(id);
    }, [navigate]);

  if (dataLoading) {
    return <DashboardSkeleton />;
  }

  const { t } = useTranslation();

  if (!order) {
    return (
      <div
        className="
          flex
          h-dvh w-full
          text-red-500 font-sans
          bg-[#F1E8DC]
          items-center justify-center
        "
      >
        Data Order Tidak Ditemukan.
      </div>
    );
  }

  const menuItems: MenuItem[] = [
    { id: "share", label: t("customer.menuShare"), icon: Share2, badge: null },
    { id: "edit", label: t("customer.menuEdit"), icon: Save, badge: null },
    ...(!isBasic
      ? [
          {
            id: "rsvp",
            label: t("customer.menuRsvp"),
            icon: MessageSquare,
            badge: rsvpTotal && rsvpTotal > 0 ? rsvpTotal : null,
          },
        ]
      : []),
  ];

  const handleMenuClick = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  // Logout sama seperti Navbar publik: hanya hapus key session dashboard,
  // jangan sessionStorage.clear() agar session fitur lain aman.
  const performLogout = () => {
    sessionStorage.removeItem("active_order_id");
    sessionStorage.removeItem("order_pin");
    localStorage.removeItem("active_order_id");
    clearCustomerToken();
    navigate("/");
  };
  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  return (
    // Fullscreen app shell (tanpa Navbar publik): h-dvh mengikuti tinggi
    // viewport dinamis (aman dari URL bar mobile) dan overflow-hidden membuat
    // dokumen tidak pernah scroll — hanya <main> yang scroll.
    <div
      className="
        flex flex-col overflow-hidden
        h-dvh w-full
        font-sans
        bg-[#F1E8DC]
        relative
      "
    >
      <CustomerNavbar order={order} />

      <div
        className="
          flex flex-1 overflow-hidden
          min-h-0 w-full
          relative
        "
      >
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="
              z-40
              bg-black/40
              fixed inset-0
              lg:hidden
            "
          />
        )}

        <CustomerSidebar
          order={order}
          menuItems={menuItems}
          activeTab={activeTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onMenuClick={handleMenuClick}
          onLogout={handleLogout}
          isBasic={isBasic}
        />

        <ConfirmDialog
          isOpen={showLogoutDialog}
          title={t("nav.logoutConfirmTitle")}
          message={t("nav.logoutConfirm")}
          isDanger={true}
          onCancel={() => setShowLogoutDialog(false)}
          onConfirm={performLogout}
        />

        <div
          className="
            flex flex-1 flex-col overflow-hidden
            h-full min-h-0 min-w-0
            relative
          "
        >
          {/* Mobile Header */}
          <header
            className="
              flex
              px-4 py-3
              bg-[#712E1E]
              border-b border-black/20
              shrink-0 items-center gap-2
              lg:hidden
            "
          >
            <button
              onClick={() => setSidebarOpen(true)}
              className="
                p-2
                rounded-xl
                hover:bg-white/10
              "
            >
              <Menu
                size={20}
                className="
                  text-[#FFD5AF]
                "
              />
            </button>
            <div
              className="
                flex-1
              "
            >
              <h2
                className="
                  text-sm font-bold text-white
                "
              >
                {menuItems.find((m) => m.id === activeTab)?.label}
              </h2>
            </div>
            <a
              href={`/wedding/${order.slug}`}
              target="_blank"
              rel="noreferrer"
              className="
                p-2
                rounded-xl
                hover:bg-white/10
              "
            >
              <Eye
                size={18}
                className="
                  text-[#FFD5AF]
                "
              />
            </a>
            <button
              onClick={handleLogout}
              className="
                p-2
                rounded-xl
                hover:bg-white/10
              "
            >
              <LogOut
                size={18}
                className="
                  text-red-300
                "
              />
            </button>
          </header>

          {/* Scrollable Main Body (satu-satunya area yang scroll) */}
          <main
            className="
              flex-1 overflow-y-auto
              p-4
              md:p-6
              lg:p-8
            "
          >
            {activeTab === "share" && <ShareTab {...shareLink} />}

            {activeTab === "edit" && (
              <EditTab
                formData={formData}
                setFormData={setFormData}
                handleChange={handleChange}
                handleSaveData={handleSaveData}
                loading={loading}
                uploading={uploading}
                activeUploadField={activeUploadField}
                handleFileUpload={handleFileUpload}
                orderId={orderId}
                converting={converting}
                removing={removing}
                onRemoveMusic={removeAudio}
              />
            )}

            {activeTab === "rsvp" && !isBasic && (
              <RsvpTab orderId={orderId ?? ""} />
            )}
          </main>
        </div>
      </div>

      {cropModal}
    </div>
  );
}
