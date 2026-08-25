// ============================================================
// src/pages/OrderPage.tsx
// ------------------------------------------------------------
// Halaman /order - form pemesanan multi-bagian: pilih template, isi data acara, submit membuat pending order via Edge Function create-order.
// Dipakai di  : App.tsx
// Keterikatan : lib/constants, lib/supabaseClient, ConfirmDialog, GlobalToast
// ============================================================

import { useState, type ChangeEvent, type ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/GlobalToast";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  MASTER_TEMPLATES,
  TEMPLATE_OPTIONS,
  ADMIN_WHATSAPP,
} from "../lib/constants";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Mail,
  Palette,
  RotateCcw,
  User,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INPUT_CLASS =
  "pl-10 w-full p-3 rounded-xl border border-stone-200 bg-white focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition";

export default function OrderForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [loadingWA, setLoadingWA] = useState(false);
  const [loadingMidtrans, setLoadingMidtrans] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const urlSlug = searchParams.get("template");
  const defaultTemplate =
    TEMPLATE_OPTIONS.find((t) => t.slug === urlSlug) || TEMPLATE_OPTIONS[0];

  const initialFormState = {
    groom_name: "",
    bride_name: "",
    wedding_date: "",
    whatsapp: "",
    email: "",
    template_slug: defaultTemplate.slug,
  };

  const [formData, setFormData] = useState(initialFormState);
  const selectedTemplate =
    TEMPLATE_OPTIONS.find((t) => t.slug === formData.template_slug) ||
    defaultTemplate;
  const selectedImage = MASTER_TEMPLATES.find(
    (t) => t.slug === formData.template_slug,
  )?.image;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsappChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) val = val.substring(1);
    if (val.startsWith("62")) val = val.substring(2);
    setFormData({ ...formData, whatsapp: val });
  };

  const handleTemplateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    setFormData({ ...formData, template_slug: slug });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setShowConfirm(false);
    toast.success("Formulir dikosongkan.");
  };

  // Fungsi Validasi agar tidak diulang-ulang
  const validateForm = () => {
    if (
      !formData.groom_name ||
      !formData.bride_name ||
      !formData.wedding_date
    ) {
      toast.error("Harap lengkapi semua data mempelai dan tanggal!");
      return false;
    }
    if (!formData.email || !EMAIL_RE.test(formData.email)) {
      toast.error("Masukkan alamat email yang valid.");
      return false;
    }
    if (!formData.whatsapp || formData.whatsapp.length < 9) {
      toast.error("Nomor WhatsApp tidak valid!");
      return false;
    }
    return true;
  };

  // ==========================================
  // CHECKOUT VIA MIDTRANS (OTOMATIS)
  // PIN digenerate webhook saat pembayaran berhasil.
  // ==========================================
  const handleMidtransCheckout = async () => {
    if (!validateForm()) return;

    setLoadingMidtrans(true);

    try {
      if (typeof window.snap === "undefined" || !window.snap?.pay) {
        toast.error(
          "Sistem pembayaran Midtrans tidak tersedia sementara. Gunakan metode WhatsApp untuk konfirmasi manual.",
        );
        return;
      }

      const finalWhatsapp = `+62${formData.whatsapp}`;

      toast.warning("Membuat pesanan dan menyiapkan metode pembayaran...");

      const { data, error } = await supabase.functions.invoke("create-order", {
        body: {
          groom_name: formData.groom_name.trim(),
          bride_name: formData.bride_name.trim(),
          wedding_date: formData.wedding_date,
          whatsapp: finalWhatsapp,
          email: formData.email.trim().toLowerCase(),
          template_slug: formData.template_slug,
        },
      });

      if (error) {
        throw new Error(error?.message || "Gagal membuat pesanan pembayaran.");
      }

      if (!data?.snap_token || !data?.order_id) {
        throw new Error("Token pembayaran tidak diterima dari server.");
      }

      window.snap?.pay?.(data.snap_token, {
        onSuccess: function (result) {
          toast.success("Pembayaran berhasil! PIN dikirim ke email Anda.");
          navigate(
            `/payment-status?order_id=${result.order_id || data.order_id}`,
          );
        },
        onPending: function (result) {
          toast.warning("Pembayaran sedang menunggu konfirmasi.");
          navigate(
            `/payment-status?order_id=${result.order_id || data.order_id}`,
          );
        },
        onError: function (result) {
          console.error("[OrderForm] Payment error:", result);
          toast.error("Pembayaran gagal atau dibatalkan. Silakan coba lagi.");
        },
        onClose: function () {
          toast.warning(
            "Anda menutup popup pembayaran. Pesanan tetap bisa dilanjutkan dari status pembayaran.",
          );
          navigate(`/payment-status?order_id=${data.order_id}`);
        },
      });
    } catch (err) {
      console.error("[OrderForm] Midtrans checkout error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses pembayaran.";
      toast.error(msg);
    } finally {
      setLoadingMidtrans(false);
    }
  };

  // ==========================================
  // CHECKOUT VIA WHATSAPP (MANUAL — DIAKTIFKAN ADMIN)
  // PIN digenerate otomatis saat admin mengaktifkan pesanan.
  // ==========================================
  const handleWhatsappCheckout = async () => {
    if (!validateForm()) return;
    setLoadingWA(true);

    try {
      const finalWhatsapp = `+62${formData.whatsapp}`;

      // Insert ke tabel "pending_orders" (BUKAN orders) + email untuk pengiriman PIN
      const { error } = await supabase.from("pending_orders").insert([
        {
          groom_name: formData.groom_name,
          bride_name: formData.bride_name,
          wedding_date: formData.wedding_date,
          whatsapp: finalWhatsapp,
          email: formData.email.trim().toLowerCase(),
          template_slug: formData.template_slug,
        },
      ]);

      if (error) throw error;

      const message = `Halo Admin, saya ingin memesan Undangan Digital:
        *Data Mempelai:*
        Pria: ${formData.groom_name}
        Wanita: ${formData.bride_name}
        Tanggal: ${formData.wedding_date}
        Email: ${formData.email}
        *Order:*
        Template: ${selectedTemplate.name}
        Total Harga: Rp ${selectedTemplate.price.toLocaleString("id-ID")}
        Mohon info cara pembayarannya.`;

      const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
      toast.success("Berhasil! Membuka WhatsApp...");

      window.open(waUrl, "_blank");
      setTimeout(() => navigate("/order/success"), 1200);
    } catch (err) {
      console.error(err);
      toast.error(
        "Terjadi kesalahan database: " +
          (err instanceof Error ? err.message : err),
      );
    } finally {
      setLoadingWA(false);
    }
  };

  const formatIDR = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="min-h-screen bg-[#F1E8DC] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* --- HEADER --- */}
        <div className="flex items-start justify-between gap-4 mb-8 md:mb-10">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-[#E59A59] transition"
            >
              <ArrowLeft size={13} /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#712E1E] mt-2">
              Buat Undangan
            </h1>
            <p className="mt-1.5 text-sm md:text-base text-stone-500">
              Lengkapi data pesananmu, lalu pilih metode pembayaran.
            </p>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-red-500 transition px-3 py-2 rounded-lg hover:bg-red-50"
            title="Reset Form"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* --- GRID UTAMA: FORM + SUMMARY --- */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 items-start">
          {/* ===== KOLOM KIRI: FORM ===== */}
          <div className="space-y-5 order-1">
            {/* 1. Pilih Desain */}
            <SectionCard step="01" title="Pilih Desain">
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                <select
                  name="template_slug"
                  value={formData.template_slug}
                  onChange={handleTemplateChange}
                  className={`${INPUT_CLASS} cursor-pointer`}
                >
                  {TEMPLATE_OPTIONS.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name} — {t.category}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-stone-400 -mt-1">
                Bisa diganti kapan saja lewat dashboard admin bila berubah
                pikiran.
              </p>
            </SectionCard>

            {/* 2. Data Mempelai & Acara */}
            <SectionCard step="02" title="Data Mempelai & Acara">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                    Mempelai Pria
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      name="groom_name"
                      value={formData.groom_name}
                      type="text"
                      placeholder="Romeo"
                      onChange={handleChange}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                    Mempelai Wanita
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      name="bride_name"
                      value={formData.bride_name}
                      type="text"
                      placeholder="Juliet"
                      onChange={handleChange}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                    Tanggal Pernikahan
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      name="wedding_date"
                      value={formData.wedding_date}
                      type="date"
                      onChange={handleChange}
                      className={`${INPUT_CLASS} text-stone-600`}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 3. Kontak */}
            <SectionCard step="03" title="Kontak">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <FaWhatsapp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      name="whatsapp"
                      type="tel"
                      placeholder="81234567890"
                      value={formData.whatsapp}
                      onChange={handleWhatsappChange}
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ===== KOLOM KANAN: RINGKASAN & PEMBAYARAN ===== */}
          <aside className="order-2 lg:sticky lg:top-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EBDFCE] shadow-md overflow-hidden">
              {/* Banner tema */}
              <div className="relative aspect-[16/9] bg-[#FAF6EE] group">
                {selectedImage && (
                  <img
                    src={selectedImage}
                    alt={selectedTemplate.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <span
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    selectedTemplate.category === "RSVP"
                      ? "bg-[#712E1E] text-white"
                      : "bg-[#F7EEE3] text-[#712E1E] border border-[#EBDFCE]"
                  }`}
                >
                  {selectedTemplate.category}
                </span>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                {/* Nama Tema */}
                <h2 className="font-extrabold text-lg text-[#712E1E] leading-tight">
                  {selectedTemplate.name}
                </h2>

                {/* Ringkasan live */}
                <div className="space-y-2.5 pt-4 border-t border-[#F3EBDF]">
                  <SummaryRow
                    label="Email"
                    value={formData.email || "Belum diisi"}
                    muted={!formData.email}
                    mono
                  />
                  <SummaryRow
                    label="No. WhatsApp"
                    value={
                      formData.whatsapp
                        ? `+62${formData.whatsapp}`
                        : "Belum diisi"
                    }
                    muted={!formData.whatsapp}
                    mono
                  />
                </div>

                {/* Total — baris informasi, bukan tombol */}
                <div className="flex justify-between items-center pt-4 border-t border-[#F3EBDF]">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Total Bayar
                  </span>
                  <span className="text-lg font-extrabold text-[#712E1E]">
                    {formatIDR(selectedTemplate.price)}
                  </span>
                </div>

                {/* Tombol */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleMidtransCheckout}
                    disabled={loadingMidtrans}
                    className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-md transition ${
                      loadingMidtrans
                        ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#1A1FDF] to-[#0E4CA3] text-white hover:from-[#0E14C4] hover:to-[#0A3A82] active:scale-[0.99]"
                    }`}
                    title="Bayar menggunakan Midtrans - Berbagai metode pembayaran tersedia"
                  >
                    {loadingMidtrans ? (
                      "Menyiapkan pembayaran..."
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" /> Bayar Otomatis
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsappCheckout}
                    disabled={loadingWA}
                    className={`w-full py-3.5 rounded-xl font-bold text-base border-2 transition flex items-center justify-center gap-2 ${
                      loadingWA
                        ? "bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed"
                        : "bg-white border-[#25D366] text-[#188038] hover:bg-green-50 active:scale-[0.99]"
                    }`}
                  >
                    {loadingWA ? (
                      "Memproses..."
                    ) : (
                      <>
                        <FaWhatsapp className="w-5 h-5 text-[#25D366]" /> Pesan
                        via WhatsApp
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Reset Formulir?"
        message="Semua data yang kamu isi akan dihapus. Yakin?"
        isDanger={true}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleReset}
      />
    </div>
  );
}

/* ------------------------------ Sub-komponen ------------------------------ */

function SectionCard({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-[#EBDFCE] shadow-sm p-6 md:p-7 space-y-4">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 rounded-xl bg-[#F7EEE3] text-[#B4693F] grid place-items-center text-sm font-black tracking-tight">
          {step}
        </span>
        <h2 className="font-bold text-[#712E1E]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SummaryRow({
  label,
  value,
  muted = false,
  mono = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-stone-400 font-semibold shrink-0">{label}</span>
      <span
        className={`truncate font-medium ${muted ? "italic text-stone-300" : "text-stone-700"} ${mono ? "font-mono" : ""}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
