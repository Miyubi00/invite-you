import { useState, type ChangeEvent, type Dispatch, type SetStateAction, type SyntheticEvent } from "react";
import { ArrowLeft, Calendar, Camera, CheckCircle2, CreditCard, Loader2, MapPin, MessageSquare, Save, Search, Trash2, Users } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import ConfirmDialog from "../ConfirmDialog";
import { CARD, CARD_TITLE, FIELD_LABEL, INPUT } from "../shared/form/ui";
import { CardHeader, SubTabButton, LightboxPreview, TextField, DateField, type PreviewImage } from "../shared/form/FormKit";
import {
  LocationCard,
  PhotosCard,
  GalleryCard,
  MusicQuoteCard,
  BanksCard,
  type FieldChangeEvent,
} from "../shared/form/SectionCards";
import { useEditActions } from "../../hooks/useEditActions";
import { useFileUpload } from "../../hooks/useFileUpload";
import Pagination from "../shared/Pagination";
import { useRsvpServer, type RsvpStatusFilter } from "../../hooks/useRsvpServer";
import type { EventDetails, OrderRow, RsvpRow, TemplateRow, OrderEditForm } from "../../types/database";
import { useTranslation } from "../../i18n";

/* ────────────────────────────────────────────────────────────────────────────
   Props
   ──────────────────────────────────────────────────────────────────────────── */

interface EditOrderModalProps {
  editingOrder: OrderRow;
  setEditingOrder: Dispatch<SetStateAction<OrderRow | null>>;
  editFormData: OrderEditForm;
  setEditFormData: Dispatch<SetStateAction<OrderEditForm>>;
  templates: TemplateRow[];
  fetchData: () => Promise<void>;
  toast: { success: (msg: string) => void; error: (msg: string) => void; warning: (msg: string) => void };
  onBack?: () => void;
  onSaved?: () => void;
}

type SubSection = "info" | "media" | "extra" | "admin" | "guests";

/* ────────────────────────────────────────────────────────────────────────────
   Main Component
   ──────────────────────────────────────────────────────────────────────────── */

export default function EditOrderModal({
  editingOrder,
  setEditingOrder,
  editFormData,
  setEditFormData,
  templates,
  fetchData,
  toast,
  onBack,
  onSaved,
}: EditOrderModalProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SubSection>("admin");
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const rsvpList = useRsvpServer(editingOrder.id);

  const {
    uploading,
    converting,
    convertPercent,
    removing,
    activeUploadField,
    handleFileUpload,
    removeAudio,
    cropModal,
  } = useFileUpload(
    editingOrder.id,
    setEditFormData,
    "ADMIN_IMG_",
    true,
    () => editFormData,
  );

  const {
    confirmData,
    ask,
    closeConfirm,
    requestRemovePhoto,
    requestRemoveGallery,
    requestRemoveBank,
    addBank,
    updateBank,
  } = useEditActions(setEditFormData, {
    orderId: editingOrder.id,
    getData: () => editFormData,
  });

  /* ── Save ──────────────────────────────────────────────────────────────── */

  const handleSaveUpdate = async (e: SyntheticEvent) => {
    e.preventDefault();

    const { groom_name, bride_name, wedding_date, slug, template_slug, ...eventDetailsJSON } = editFormData;
    const { payment_status: _ignoredPayment, ...cleanEventDetails } = eventDetailsJSON as Record<string, unknown>;

    const { count, error } = await supabase
      .from("orders")
      .update(
        {
          groom_name,
          bride_name,
          wedding_date,
          slug,
          template_slug,
          event_details: cleanEventDetails as EventDetails,
        },
        { count: "exact" },
      )
      .eq("id", editingOrder.id);

    if (!error && (count ?? 0) > 0) {
      toast.success(t('toast.savedSuccess'));
      onSaved?.();
      fetchData();
    } else if (!error) {
      toast.error(t('toast.noChangesSaved'));
    } else {
      toast.error(t('toast.saveFailed', { error: error.message }));
    }
  };

  /* ── Generic input change ──────────────────────────────────────────────── */

  const handleChange = (e: FieldChangeEvent | ChangeEvent<HTMLSelectElement>) =>
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }) as OrderEditForm);

  /* ── Delete RSVP ───────────────────────────────────────────────────────── */

  const handleDeleteRsvp = (rsvpId: string) =>
    ask("Hapus komentar dari tamu ini?", async () => {
      const { count, error } = await supabase
        .from("rsvps")
        .delete({ count: "exact" })
        .eq("id", rsvpId);
      if (!error && (count ?? 0) > 0) {
        toast.success(t('toast.commentDeleted'));
        await rsvpList.refresh();
      } else if (!error) {
        toast.error(t('toast.commentDeleteNoChange'));
      } else {
        toast.error(t('toast.deleteFailedSimple'));
      }
      closeConfirm();
    });

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <form onSubmit={handleSaveUpdate} className="w-full pb-10">
        {/* Header Tab */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack ?? (() => setEditingOrder(null))}
            className="rounded-xl p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
            title={t('common.back')}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-stone-800">{t('admin.editInvitationTitle')}</h2>
            <p className="mt-0.5 text-xs font-mono text-stone-400">ID: {editingOrder.id.slice(0, 12)}…</p>
          </div>
        </div>

        {/* Sub-Tab Navigation (Pills) */}
        <div className="mt-5 flex flex-wrap gap-1.5 rounded-2xl border border-[#EBDFCE] bg-[#FAF6EE] p-1.5 w-fit">
          <SubTabButton active={activeSection === "admin"} onClick={() => setActiveSection("admin")}>
            <Users size={15} />
            <span>{t('admin.editTabOrderInfo')}</span>
          </SubTabButton>

          <SubTabButton active={activeSection === "guests"} onClick={() => setActiveSection("guests")}>
            <MessageSquare size={15} />
            <span>{t('customer.rsvp.title')}</span>
          </SubTabButton>

          <SubTabButton active={activeSection === "media"} onClick={() => setActiveSection("media")}>
            <Camera size={15} />
            <span>{t('customer.edit.tabMedia')}</span>
          </SubTabButton>

          <SubTabButton active={activeSection === "extra"} onClick={() => setActiveSection("extra")}>
            <CreditCard size={15} />
            <span>{t('customer.edit.tabExtra')}</span>
          </SubTabButton>
        </div>

        {/* ─── Tab Contents ──────────────────────────────────────────────── */}
        <div className="mt-6">
          {activeSection === "admin" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <AdminOrderCard editFormData={editFormData} handleChange={handleChange} templates={templates} />
              <LocationCard data={editFormData} handleChange={handleChange} />
            </div>
          )}

          {activeSection === "guests" && (
            <GuestbookSection rsvp={rsvpList} onDelete={handleDeleteRsvp} />
          )}

          {activeSection === "media" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <PhotosCard
                data={editFormData}
                activeUploadField={activeUploadField}
                isUploading={uploading}
                handleFileUpload={handleFileUpload}
                onPreview={(url, title) => setPreviewImage({ url, title })}
                onRemovePhoto={requestRemovePhoto}
              />
              <GalleryCard
                gallery={editFormData.gallery || []}
                isUploading={uploading && activeUploadField === "gallery"}
                handleFileUpload={handleFileUpload}
                onRequestRemove={requestRemoveGallery}
                onPreview={(url, title) => setPreviewImage({ url, title })}
              />
            </div>
          )}

          {activeSection === "extra" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <MusicQuoteCard
                data={editFormData}
                handleChange={handleChange}
                handleFileUpload={handleFileUpload}
                converting={converting}
                convertPercent={convertPercent}
                removing={removing}
                onRemoveMusic={removeAudio}
              />
              <BanksCard
                banks={editFormData.banks || []}
                onAdd={addBank}
                onUpdate={updateBank}
                onRequestRemove={requestRemoveBank}
              />
            </div>
          )}

          {/* Tombol Simpan Lebar di Bagian Bawah */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E59A59] py-3.5 text-base font-bold text-white shadow-md transition hover:bg-[#d48b4b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={18} />}
              {uploading ? t('customer.edit.btnSaving') : t('customer.edit.btnSave')}
            </button>
          </div>
        </div>
      </form>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        isOpen={confirmData.show}
        title={t('customer.edit.confirmDeleteTitle')}
        message={confirmData.message}
        isDanger={true}
        onCancel={closeConfirm}
        onConfirm={confirmData.action ?? undefined}
      />

      {/* Modal Preview Gambar (Lightbox) */}
      <LightboxPreview image={previewImage} onClose={() => setPreviewImage(null)} />

      {/* Modal Crop */}
      {cropModal}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Admin Order Card
   ════════════════════════════════════════════════════════════════════════════ */

function AdminOrderCard({
  editFormData,
  handleChange,
  templates,
}: {
  editFormData: OrderEditForm;
  handleChange: (e: FieldChangeEvent | ChangeEvent<HTMLSelectElement>) => void;
  templates: TemplateRow[];
}) {
  const { t } = useTranslation();

  return (
    <section className={CARD}>
      <CardHeader icon={<Users size={16} />} title={t('admin.cardOrderInfo')} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3">
          <TextField label={t('order.groomName')} name="groom_name" value={editFormData.groom_name} handleChange={handleChange} />
          <TextField
            label={t('customer.edit.groomParents')}
            name="groom_parents"
            value={editFormData.groom_parents}
            handleChange={handleChange}
            placeholder={t('customer.edit.parentsPlaceholder')}
          />
        </div>
        <div className="space-y-3">
          <TextField label={t('order.brideName')} name="bride_name" value={editFormData.bride_name} handleChange={handleChange} />
          <TextField
            label={t('customer.edit.brideParents')}
            name="bride_parents"
            value={editFormData.bride_parents}
            handleChange={handleChange}
            placeholder={t('customer.edit.parentsPlaceholder')}
          />
        </div>
      </div>

      <DateField label={t('order.weddingDate')} name="wedding_date" value={editFormData.wedding_date} handleChange={handleChange} />

      <div>
        <label className={FIELD_LABEL}>{t('admin.cardTemplateTheme')}</label>
        <select
          name="template_slug"
          value={editFormData.template_slug || ""}
          onChange={handleChange}
          className={`${INPUT} mt-1`}
        >
          {templates.map((tpl) => (
            <option key={tpl.slug} value={tpl.slug}>
              {tpl.name} ({tpl.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={FIELD_LABEL}>
          {t('admin.cardCustomSlug')}
        </label>
        <input
          name="slug"
          value={editFormData.slug || ""}
          onChange={handleChange}
          className={`${INPUT} mt-1`}
          placeholder="misal: romeo-juliet"
        />
        <p className="-mt-1 text-[10px] italic text-amber-600">
          {t('admin.cardSlugWarning')}
        </p>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Buku Tamu (Admin-only, sub-tab full-width)
   ════════════════════════════════════════════════════════════════════════════ */

type RsvpServerState = ReturnType<typeof useRsvpServer>;

function GuestbookSection({
  rsvp,
  onDelete,
}: {
  rsvp: RsvpServerState;
  onDelete: (id: string) => void;
}) {
  const { t, language } = useTranslation();
  const {
    searchInput, setSearchInput,
    dateInput, setDateInput,
    statusInput, setStatusInput,
    applyFilters, resetFilters, hasActiveFilter,
    rows, total, loading, stats,
    page, setPage, pageSize, setPageSize, totalPages,
  } = rsvp;
  const { hadir, tidakHadir, ragu } = stats;

  const labelCls = "mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]";
  const inputCls =
    "h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#EBDFCE] bg-white p-4 shadow-sm md:flex-row md:items-end">
        <div className="min-w-[240px] flex-1">
          <label className={labelCls}>
            <Search size={13} className="text-[#E59A59]" />
            <span>{t('customer.rsvp.filterSearchLabel')}</span>
          </label>
          <input
            type="text"
            placeholder={t('customer.rsvp.filterSearchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
            className={`${INPUT} pl-9`}
          />
        </div>

        <div className="min-w-[170px]">
          <label className={labelCls}>
            <Calendar size={13} className="text-[#E59A59]" />
            <span>{t('customer.rsvp.filterDateLabel')}</span>
          </label>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="min-w-[170px]">
          <label className={labelCls}>
            <Users size={13} className="text-[#E59A59]" />
            <span>{t('customer.rsvp.filterStatusLabel')}</span>
          </label>
          <select
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as RsvpStatusFilter)}
            className={inputCls}
          >
            <option value="all">{t('customer.rsvp.statusAll')}</option>
            <option value="hadir">{t('customer.rsvp.statusAttending')}</option>
            <option value="tidak_hadir">{t('customer.rsvp.statusNotAttending')}</option>
            <option value="ragu">{t('customer.rsvp.statusUncertain')}</option>
          </select>
        </div>

        <div className="flex shrink-0 gap-2">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 whitespace-nowrap"
            >
              <Trash2 size={13} />
              <span>{t('customer.rsvp.btnResetFilter')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={applyFilters}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#E59A59] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#d48b4b] active:scale-95 whitespace-nowrap"
          >
            <Search size={13} />
            <span>{t('customer.rsvp.btnSearch')}</span>
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('customer.rsvp.statTotal')} value={total} labelClass="text-stone-400" valueClass="text-stone-800" />
        <StatCard label={t('customer.rsvp.statAttending')} value={hadir} labelClass="text-emerald-600" valueClass="text-emerald-600" />
        <StatCard label={t('customer.rsvp.statNotAttending')} value={tidakHadir} labelClass="text-rose-500" valueClass="text-rose-500" />
        <StatCard label={t('customer.rsvp.statUncertain')} value={ragu} labelClass="text-amber-600" valueClass="text-amber-600" />
      </div>

      {/* Tabel komentar */}
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
                      <span className="text-sm font-bold text-stone-800">{rsvp.guest_name}</span>
                      <br />
                      <span className="text-[10px] text-stone-400">
                        {rsvp.created_at ? new Date(rsvp.created_at).toLocaleDateString(language === 'en' ? "en-US" : "id-ID") : "-"}
                      </span>
                    </td>
                    <td className="p-4 align-top whitespace-nowrap">
                      <StatusBadge status={rsvp.status} pax={rsvp.pax} />
                    </td>
                    <td className="max-w-xs p-4 align-top break-words">
                      <p className="text-sm text-stone-700 italic">&ldquo;{rsvp.message}&rdquo;</p>
                      {rsvp.reply && (
                        <div className="mt-2 rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] p-2.5">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#712E1E]">
                            {t('customer.rsvp.yourReply')}
                          </p>
                          <p className="text-xs text-stone-600">{rsvp.reply}</p>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onDelete(rsvp.id)}
                        title={t('customer.rsvp.btnDelete')}
                        className="grid h-8 w-8 mx-auto text-red-500 rounded-xl place-items-center transition hover:bg-red-50 hover:text-red-700 active:scale-95"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination server-side */}
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
      <p className={`mb-1 text-[11px] font-bold tracking-wider uppercase ${labelClass}`}>
        {label}
      </p>
      <p className={`text-2xl font-black ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status, pax }: { status: RsvpRow["status"]; pax: number }) {
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
