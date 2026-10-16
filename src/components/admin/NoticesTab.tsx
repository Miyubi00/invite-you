// ============================================================
// src/components/admin/NoticesTab.tsx
// ------------------------------------------------------------
// Tab admin "Banner & Notice": CRUD pengumuman situs (promo /
// maintenance / info) yang tampil otomatis di halaman beranda
// sebagai banner dan/atau modal popup, aktif via rentang waktu.
// Keterikatan : lib/supabaseClient (site_notices), i18n, ConfirmDialog
// via prop confirmAction, GlobalToast via prop toast.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import { Calendar, Megaphone, Pencil, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { SiteNoticeMode, SiteNoticeRow, SiteNoticeType } from '../../types/database';
import type { ToastApi } from '../GlobalToast';
import { useTranslation } from '../../i18n';

interface NoticesTabProps {
  toast: ToastApi;
  confirmAction: (title: string, message: string, isDanger: boolean, onConfirm: () => void) => void;
}

interface NoticeFormState {
  type: SiteNoticeType;
  mode: SiteNoticeMode;
  title: string;
  body: string;
  cta_label: string;
  cta_href: string;
  /** nilai input datetime-local (waktu lokal perangkat) */
  starts_at: string;
  /** nilai input datetime-local; '' = tanpa batas waktu */
  ends_at: string;
}

const INPUT_CLASS =
  'h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20';

const TEXTAREA_CLASS =
  'w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 py-2.5 text-xs font-medium leading-relaxed text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20';

const LABEL_CLASS =
  'mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]';

const TYPE_STYLE: Record<SiteNoticeType, string> = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  promo: 'bg-purple-50 text-purple-700 border-purple-200',
  maintenance: 'bg-rose-50 text-rose-700 border-rose-200',
};

type StatusKey = 'live' | 'scheduled' | 'ended' | 'inactive';

const STATUS_STYLE: Record<StatusKey, string> = {
  live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  ended: 'bg-stone-100 text-stone-500 border-stone-200',
  inactive: 'bg-red-50 text-red-600 border-red-200',
};

/** ISO -> value untuk <input type="datetime-local"> (waktu lokal). */
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** value datetime-local -> ISO untuk dikirim ke database. */
function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function deriveStatus(n: SiteNoticeRow): StatusKey {
  if (!n.is_active) return 'inactive';
  const now = Date.now();
  if (new Date(n.starts_at).getTime() > now) return 'scheduled';
  if (n.ends_at && new Date(n.ends_at).getTime() < now) return 'ended';
  return 'live';
}

function formatSchedule(row: SiteNoticeRow, language: string): { start: string; end: string } {
  const fmt = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };
  return { start: fmt(row.starts_at), end: row.ends_at ? fmt(row.ends_at) : '—' };
}

const emptyForm = (): NoticeFormState => ({
  type: 'info',
  mode: 'banner',
  title: '',
  body: '',
  cta_label: '',
  cta_href: '',
  starts_at: toLocalInput(new Date().toISOString()),
  ends_at: '',
});

export default function NoticesTab({ toast, confirmAction }: NoticesTabProps) {
  const { t, language } = useTranslation();
  const [rows, setRows] = useState<SiteNoticeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NoticeFormState>(emptyForm);

  const fetchRows = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_notices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error(t('admin.noticesLoadFail'));
      return;
    }
    setRows((data ?? []) as SiteNoticeRow[]);
  }, [toast, t]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      await fetchRows();
      if (mounted) setLoading(false);
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [fetchRows]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (row: SiteNoticeRow) => {
    setEditingId(row.id);
    setForm({
      type: row.type,
      mode: row.mode,
      title: row.title,
      body: row.body ?? '',
      cta_label: row.cta_label ?? '',
      cta_href: row.cta_href ?? '',
      starts_at: toLocalInput(row.starts_at),
      ends_at: toLocalInput(row.ends_at),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    const title = form.title.trim();
    if (!title) return toast.error(t('admin.noticesTitleRequired'));

    const startsAt = fromLocalInput(form.starts_at) ?? new Date().toISOString();
    const endsAt = fromLocalInput(form.ends_at);
    if (endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      return toast.error(t('admin.noticesEndBeforeStart'));
    }

    const payload = {
      type: form.type,
      mode: form.mode,
      title,
      body: form.body.trim(),
      cta_label: form.cta_label.trim() || null,
      cta_href: form.cta_href.trim() || null,
      starts_at: startsAt,
      ends_at: endsAt,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    const { error } = editingId
      ? await supabase.from('site_notices').update(payload).eq('id', editingId)
      : await supabase.from('site_notices').insert(payload);
    setSaving(false);

    if (error) return toast.error(t('admin.noticesSaveFailed', { error: error.message }));
    toast.success(t('admin.noticesSaved'));
    closeForm();
    void fetchRows();
  };

  const handleToggleActive = async (row: SiteNoticeRow) => {
    const { count, error } = await supabase
      .from('site_notices')
      .update({ is_active: !row.is_active, updated_at: new Date().toISOString() }, { count: 'exact' })
      .eq('id', row.id);
    if (!error && (count ?? 0) > 0) {
      toast.success(t('admin.noticesStatusUpdated'));
      void fetchRows();
    } else if (!error) {
      toast.error(t('admin.noticesStatusUpdateFailed'));
    } else {
      toast.error(t('admin.noticesStatusUpdateFailed'));
    }
  };

  const handleDelete = (row: SiteNoticeRow) => {
    confirmAction(
      t('admin.noticesDeleteTitle'),
      t('admin.noticesDeleteConfirm', { title: row.title }),
      true,
      async () => {
        const { count, error } = await supabase
          .from('site_notices')
          .delete({ count: 'exact' })
          .eq('id', row.id);
        if (!error && (count ?? 0) > 0) {
          toast.success(t('admin.noticesDeleted'));
          void fetchRows();
        } else {
          toast.error(t('admin.noticesDeleteFailed'));
        }
      },
    );
  };

  const statusLabel: Record<StatusKey, string> = {
    live: t('admin.noticesStatusLive'),
    scheduled: t('admin.noticesStatusScheduled'),
    ended: t('admin.noticesStatusEnded'),
    inactive: t('admin.noticesStatusInactive'),
  };

  const modeLabel = (mode: SiteNoticeMode) =>
    mode === 'modal'
      ? t('admin.noticesModeModal')
      : mode === 'both'
        ? t('admin.noticesModeBoth')
        : t('admin.noticesModeBanner');

  return (
    <div className="animate-fade-in">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">{t('admin.noticesTitle')}</h2>
          <p className="mt-1 text-sm text-stone-500">{t('admin.noticesSubtitle')}</p>
        </div>
        {!formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#E59A59] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#d48b4b] active:scale-95"
          >
            <Plus size={14} />
            <span>{t('admin.noticesNew')}</span>
          </button>
        )}
      </div>

      {/* Form Buat / Edit */}
      {formOpen && (
        <div className="mb-6 rounded-2xl border border-[#EBDFCE] bg-white p-4 shadow-sm sm:p-5">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-[#712E1E]">
            <Megaphone size={16} className="text-[#E59A59]" />
            {editingId ? t('admin.noticesBtnEdit') : t('admin.noticesNew')}
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={LABEL_CLASS}>
                <span>{t('admin.noticesTypeLabel')}</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as SiteNoticeType }))}
                className={INPUT_CLASS}
              >
                <option value="info">{t('admin.noticesTypeInfo')}</option>
                <option value="warning">{t('admin.noticesTypeWarning')}</option>
                <option value="promo">{t('admin.noticesTypePromo')}</option>
                <option value="maintenance">{t('admin.noticesTypeMaintenance')}</option>
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>
                <span>{t('admin.noticesModeLabel')}</span>
              </label>
              <select
                value={form.mode}
                onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value as SiteNoticeMode }))}
                className={INPUT_CLASS}
              >
                <option value="banner">{t('admin.noticesModeBanner')}</option>
                <option value="modal">{t('admin.noticesModeModal')}</option>
                <option value="both">{t('admin.noticesModeBoth')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>
                <span>{t('admin.noticesTitleLabel')}</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder={t('admin.noticesTitlePh')}
                className={INPUT_CLASS}
              />
            </div>

            <div className="md:col-span-2">
              <label className={LABEL_CLASS}>
                <span>{t('admin.noticesBodyLabel')}</span>
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                placeholder={t('admin.noticesBodyPh')}
                rows={4}
                className={TEXTAREA_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>
                <span>{t('admin.noticesCtaLabelLabel')}</span>
              </label>
              <input
                type="text"
                value={form.cta_label}
                onChange={(e) => setForm((p) => ({ ...p, cta_label: e.target.value }))}
                placeholder={t('admin.noticesCtaPh')}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>
                <span>{t('admin.noticesCtaHrefLabel')}</span>
              </label>
              <input
                type="text"
                value={form.cta_href}
                onChange={(e) => setForm((p) => ({ ...p, cta_href: e.target.value }))}
                placeholder={t('admin.noticesCtaHrefPh')}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>
                <Calendar size={13} className="text-[#E59A59]" />
                <span>{t('admin.noticesStartLabel')}</span>
              </label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <label className={LABEL_CLASS}>
                <Calendar size={13} className="text-[#E59A59]" />
                <span>{t('admin.noticesEndLabel')}</span>
              </label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeForm}
              className="flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-[#EBDFCE] bg-white px-4 text-xs font-bold text-stone-600 transition hover:bg-[#FAF6EE] active:scale-95"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#712E1E] px-5 text-xs font-bold text-white shadow-sm transition hover:bg-[#8a4030] active:scale-95 disabled:opacity-60"
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      )}

      {/* Tabel Notice */}
      {loading ? (
        <div className="rounded-2xl border border-[#EBDFCE] bg-white p-10 text-center text-sm text-stone-400 shadow-sm">
          {t('common.loading')}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-[#EBDFCE] bg-white p-10 text-center text-sm text-stone-400 shadow-sm">
          {t('admin.noticesEmpty')}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#EBDFCE] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="border-b border-[#EBDFCE] bg-[#FAF6EE] text-xs font-bold uppercase tracking-wider text-[#712E1E]">
                <tr>
                  <th className="p-4">{t('admin.noticesThNotice')}</th>
                  <th className="p-4">{t('admin.noticesThMode')}</th>
                  <th className="p-4">{t('admin.noticesThSchedule')}</th>
                  <th className="p-4 text-center">{t('admin.noticesThStatus')}</th>
                  <th className="p-4 text-center">{t('admin.noticesThActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EBDF]">
                {rows.map((row) => {
                  const status = deriveStatus(row);
                  const schedule = formatSchedule(row, language);
                  return (
                    <tr
                      key={row.id}
                      className={`transition ${row.is_active ? 'hover:bg-[#FAF6EE]/60' : 'bg-[#FAF6EE]/50 opacity-70'}`}
                    >
                      <td className="p-4">
                        <span
                          className={`inline-flex w-fit items-center rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase ${TYPE_STYLE[row.type] ?? TYPE_STYLE.info}`}
                        >
                          {row.type}
                        </span>
                        <div className="mt-1 max-w-[320px] font-bold text-[#712E1E]">{row.title}</div>
                        {row.body && (
                          <div className="mt-0.5 max-w-[320px] truncate text-xs text-stone-400" title={row.body}>
                            {row.body}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="rounded-lg border border-[#EBDFCE] bg-[#F7EEE3] px-2 py-1 text-xs font-medium text-[#B4693F]">
                          {modeLabel(row.mode)}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-stone-500">
                        <div className="font-medium">{schedule.start}</div>
                        <div className="text-stone-400">→ {schedule.end}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLE[status]}`}
                        >
                          {statusLabel[status]}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            title={t('admin.noticesBtnEdit')}
                            className="rounded-xl border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(row)}
                            title={row.is_active ? t('admin.statusInactive') : t('admin.statusActive')}
                            className={`rounded-xl border p-2 transition ${
                              row.is_active
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                : 'border-stone-200 bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {row.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            title={t('common.delete')}
                            className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-500 transition hover:bg-rose-100"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
