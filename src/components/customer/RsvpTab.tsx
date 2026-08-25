// ============================================================
// src/components/customer/RsvpTab.tsx
// ------------------------------------------------------------
// Tab "Buku Tamu" dashboard mempelai: filter RSVP, statistik kehadiran, tabel ucapan, dan aksi balas/hapus.
// Dipakai di  : pages/CustomerDashboardPage.tsx
// Keterikatan : hooks/useRsvpTools, components/customer/RsvpReplyModal, components/shared/Pagination
// ============================================================

// Tab "Buku Tamu": toolbar filter (pola draft → applied, aktif setelah
// tombol Cari / Enter), statistik yang mengikuti hasil filter, tabel
// ucapan dengan pagination, dan modal balasan (RsvpReplyModal).

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Download,
  MessageSquareReply,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Pagination from "../shared/Pagination";
import RsvpReplyModal from "./RsvpReplyModal";
import { useRsvpServer, type RsvpStatusFilter } from "../../hooks/useRsvpServer";
import { useRsvpTools } from "../../hooks/useRsvpTools";
import type { RsvpRow } from "../../types/database";
import { useTranslation } from "../../i18n";

interface RsvpTabProps {
  /** Order ID pemilik buku tamu (dari route /dashboard/:orderId). */
  orderId: string;
}

type StatusFilter = RsvpStatusFilter;

const INPUT_CLASS =
  "h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20";

const LABEL_CLASS =
  "mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]";

export default function RsvpTab({ orderId }: RsvpTabProps) {
  const { t, language } = useTranslation();
  const rsvp = useRsvpServer(orderId);
  const tools = useRsvpTools(orderId, {
    refresh: rsvp.refresh,
    getAllRows: rsvp.fetchAllForExport,
  });
  const {
    searchInput, setSearchInput,
    dateInput, setDateInput,
    statusInput, setStatusInput,
    applyFilters: handleApplyFilters,
    resetFilters: handleResetFilters,
    hasActiveFilter,
    rows, total, loading, stats,
    page, setPage, pageSize, setPageSize, totalPages,
  } = rsvp;
  const { replyText, setReplyText, handleReply, handleDeleteRsvp, downloadCSV } = tools;

  const { hadir, tidakHadir, ragu } = stats;
  const [activeReplyModal, setActiveReplyModal] = useState<RsvpRow | null>(null);

  const submitReplyAndClose = (rsvpId: string) => {
    void handleReply(rsvpId);
    setActiveReplyModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header + Export */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">{t('customer.rsvp.title')}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {t('customer.rsvp.desc')}
          </p>
        </div>

        <button
          type="button"
          onClick={downloadCSV}
          className="flex px-4 py-2.5 text-xs font-bold text-[#712E1E] bg-white rounded-xl border border-[#EBDFCE] shadow-sm items-center justify-center gap-2 self-start transition hover:bg-[#FAF6EE] active:scale-95 sm:self-auto"
        >
          <Download size={15} />
          <span>{t('customer.rsvp.btnExport')}</span>
        </button>
      </div>

      {/* Toolbar Filter */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleApplyFilters();
        }}
        className="flex flex-col gap-3 rounded-2xl border border-[#EBDFCE] bg-white p-4 shadow-sm md:flex-row md:items-end"
      >
        {/* 1. Cari Tamu */}
        <div className="min-w-[240px] flex-1">
          <label className={LABEL_CLASS}>
            <Search size={13} className="text-[#E59A59]" />
            <span>{t('customer.rsvp.filterSearchLabel')}</span>
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={t('customer.rsvp.filterSearchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${INPUT_CLASS} pl-9`}
            />
          </div>
        </div>

        {/* 2. Filter Tanggal */}
        <div className="min-w-[170px]">
          <label className={LABEL_CLASS}>
            <Calendar size={13} className="text-[#E59A59]" />
            <span>{t('customer.rsvp.filterDateLabel')}</span>
          </label>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {/* 3. Filter Kehadiran */}
        <div className="min-w-[170px]">
          <label className={LABEL_CLASS}>
            <Users size={13} className="text-[#E59A59]" />
            <span>{t('customer.rsvp.filterStatusLabel')}</span>
          </label>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as StatusFilter)}
            className={INPUT_CLASS}
          >
            <option value="all">{t('customer.rsvp.statusAll')}</option>
            <option value="hadir">{t('customer.rsvp.statusAttending')}</option>
            <option value="tidak_hadir">{t('customer.rsvp.statusNotAttending')}</option>
            <option value="ragu">{t('customer.rsvp.statusUncertain')}</option>
          </select>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex shrink-0 gap-2">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 whitespace-nowrap"
            >
              <Trash2 size={13} />
              <span>{t('customer.rsvp.btnResetFilter')}</span>
            </button>
          )}
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#E59A59] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#d48b4b] active:scale-95 whitespace-nowrap"
          >
            <Search size={13} />
            <span>{t('customer.rsvp.btnSearch')}</span>
          </button>
        </div>
      </form>

      {/* Statistik Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('customer.rsvp.statTotal')}
          value={total}
          labelClass="text-stone-400"
          valueClass="text-stone-800"
        />
        <StatCard
          label={t('customer.rsvp.statAttending')}
          value={hadir}
          labelClass="text-emerald-600"
          valueClass="text-emerald-600"
        />
        <StatCard
          label={t('customer.rsvp.statNotAttending')}
          value={tidakHadir}
          labelClass="text-rose-500"
          valueClass="text-rose-500"
        />
        <StatCard
          label={t('customer.rsvp.statUncertain')}
          value={ragu}
          labelClass="text-amber-600"
          valueClass="text-amber-600"
        />
      </div>

      {/* Tabel */}
      <div className="overflow-hidden bg-white rounded-2xl border border-[#EBDFCE] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="text-[10px] font-bold tracking-wider text-stone-500 bg-[#FAF6EE] border-b border-[#EBDFCE] uppercase">
              <tr>
                <th className="p-4">{t('customer.rsvp.thGuest')}</th>
                <th className="p-4">{t('customer.rsvp.thStatus')}</th>
                <th className="p-4">{t('customer.rsvp.thMessage')}</th>
                <th className="p-4 text-center">{t('customer.rsvp.thAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3EBDF]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-sm text-stone-400 italic">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-sm text-stone-400 italic">
                    {hasActiveFilter ? t('customer.rsvp.emptyFiltered') : t('customer.rsvp.emptyDefault')}
                  </td>
                </tr>
              ) : (
                rows.map((rsvp) => (
                <tr key={rsvp.id} className="transition hover:bg-[#FAF6EE]/40">
                  <td className="p-4 align-top whitespace-nowrap">
                    <span className="text-sm font-bold text-stone-800">
                      {rsvp.guest_name}
                    </span>
                    <br />
                    <span className="text-[10px] text-stone-400">
                      {rsvp.created_at
                        ? new Date(rsvp.created_at).toLocaleDateString(language === 'en' ? "en-US" : "id-ID")
                        : "-"}
                    </span>
                  </td>
                  <td className="p-4 align-top whitespace-nowrap">
                    <StatusBadge status={rsvp.status} pax={rsvp.pax} />
                  </td>
                  <td className="max-w-xs p-4 align-top break-words">
                    <p className="text-sm text-stone-700 italic">
                      "{rsvp.message}"
                    </p>
                    {rsvp.reply && (
                      <div className="mt-2 p-2 text-xs text-stone-600 bg-[#FAF6EE] rounded-xl border border-[#EBDFCE] break-words">
                        <span className="block mb-0.5 font-bold text-[#712E1E]">
                          {t('customer.rsvp.yourReply')}
                        </span>
                        {rsvp.reply}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyText((prev) => ({
                            ...prev,
                            [rsvp.id]: rsvp.reply || "",
                          }));
                          setActiveReplyModal(rsvp);
                        }}
                        className="flex px-3 py-1.5 text-xs font-bold text-[#712E1E] bg-[#FAF6EE] rounded-xl border border-[#EBDFCE] items-center gap-1.5 transition hover:bg-[#F3EBDF] active:scale-95"
                      >
                        <MessageSquareReply size={13} />
                        <span>{rsvp.reply ? t('customer.rsvp.btnEditReply') : t('customer.rsvp.btnReply')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteRsvp(rsvp.id)}
                        title={t('customer.rsvp.btnDelete')}
                        className="grid h-8 w-8 text-red-500 rounded-xl place-items-center transition hover:bg-red-50 hover:text-red-700 active:scale-95"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && rows.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* Modal Popup Balas Pesan */}
      {activeReplyModal && (
        <RsvpReplyModal
          rsvp={activeReplyModal}
          replyText={replyText}
          setReplyText={setReplyText}
          onClose={() => setActiveReplyModal(null)}
          onSubmit={submitReplyAndClose}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  labelClass = "text-stone-400",
  valueClass,
}: {
  label: string;
  value: number;
  labelClass?: string;
  valueClass: string;
}) {
  return (
    <div className="p-4 text-center bg-white rounded-2xl border border-[#EBDFCE] shadow-sm">
      <p
        className={`mb-1 text-[11px] font-bold tracking-wider uppercase ${labelClass}`}
      >
        {label}
      </p>
      <p className={`text-2xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({
  status,
  pax,
}: {
  status: RsvpRow["status"];
  pax: number;
}) {
  const { t } = useTranslation();

  if (status === "hadir") {
    return (
      <span className="flex w-fit px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full items-center gap-1">
        <CheckCircle2 size={11} /> {t('customer.rsvp.statusAttending')} ({pax})
      </span>
    );
  }
  if (status === "tidak_hadir") {
    return (
      <span className="w-fit px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 rounded-full">
        {t('customer.rsvp.statusNotAttending')}
      </span>
    );
  }
  return (
    <span className="w-fit px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 rounded-full">
      {t('customer.rsvp.statusUncertain')}
    </span>
  );
}
