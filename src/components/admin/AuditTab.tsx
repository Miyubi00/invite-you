import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Calendar,
  CreditCard,
  Cpu,
  Eye,
  EyeOff,
  Filter,
  Search,
  ShieldCheck,
  Trash2,
  User,
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { ToastApi } from '../GlobalToast';
import { useTranslation } from '../../i18n';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../shared/Pagination';

export interface AuditRow {
  id: number;
  actor_email: string | null;
  actor_kind: string;
  action: string;
  table_name: string;
  row_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface AuditTabProps {
  toast: ToastApi;
}

const KIND_STYLE: Record<string, { pill: string; icon: typeof User }> = {
  admin: { pill: 'text-[#712E1E] bg-[#faf3e9] border-[#EBDFCE]', icon: ShieldCheck },
  customer: { pill: 'text-blue-700 bg-blue-50 border-blue-100', icon: User },
  service: { pill: 'text-stone-600 bg-stone-100 border-stone-200', icon: Cpu },
  midtrans: { pill: 'text-green-700 bg-green-50 border-green-100', icon: CreditCard },
  system: { pill: 'text-purple-700 bg-purple-50 border-purple-100', icon: Bot },
};

/** Daftar aksi yang dikenal — dropdown agar tidak salah ketik. */
const ACTION_OPTIONS = [
  'insert',
  'update',
  'delete',
  'activate_order',
  'webhook_success',
  'webhook_failed',
  'webhook_duplicate',
  'webhook_ignored',
  'pending_expired',
];

function formatDateTime(iso: string, language: string): string {
  try {
    return new Date(iso).toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/** Kelompokkan baris berurutan: row_id sama dalam 10 detik = 1 kejadian
 * (mis. aktivasi manual: baris eksplisit + baris trigger). */
interface AuditGroup {
  key: string;
  rows: AuditRow[];
}

function groupRows(rows: AuditRow[]): AuditGroup[] {
  const groups: AuditGroup[] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    const prev = last?.rows[last.rows.length - 1];
    if (
      prev &&
      prev.row_id === r.row_id &&
      Math.abs(new Date(prev.created_at).getTime() - new Date(r.created_at).getTime()) <= 10_000
    ) {
      last.rows.push(r);
    } else {
      groups.push({ key: `${r.row_id}-${r.created_at}`, rows: [r] });
    }
  }
  return groups;
}

function actorLabel(r: AuditRow): string {
  if (r.actor_email) return r.actor_email;
  if (r.actor_kind === 'customer') {
    const d = (r.details ?? {}) as Record<string, unknown>;
    const slug = d.slug ?? d.slug_new;
    if (typeof slug === 'string' && slug) return slug;
    return r.row_id.slice(0, 8);
  }
  return r.actor_kind;
}

/** Ringkasan isi details per aksi — agar tabel padat berisi. */
function summarize(r: AuditRow, t: (key: string) => string): string[] {
  const d = (r.details ?? {}) as Record<string, unknown>;
  const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
  const out: string[] = [];
  if (r.action === 'webhook_success' || r.action === 'webhook_failed') {
    const ts = str(d.transaction_status);
    if (ts) out.push(ts);
    const pm = str(d.payment_type);
    if (pm) out.push(pm);
    if (typeof d.email_sent === 'boolean') out.push(d.email_sent ? t('admin.auditEmailed') : t('admin.auditEmailFailed'));
  } else if (r.action === 'webhook_duplicate' || r.action === 'webhook_ignored') {
    const ts = str(d.transaction_status);
    if (ts) out.push(ts);
    const note = str(d.note);
    if (note) out.push(note);
  } else if (r.action === 'pending_expired') {
    const g = str(d.groom_name);
    const b = str(d.bride_name);
    if (g || b) out.push(`${g ?? '?'} & ${b ?? '?'}`);
  } else if (r.action === 'activate_order') {
    const s = str(d.slug);
    if (s) out.push(s);
    const src = str(d.source);
    if (src) out.push(src);
  } else if (r.action === 'update' && r.table_name === 'orders') {
    const o = str(d.template_slug_old);
    const n = str(d.template_slug_new);
    if (o || n) out.push(`${o ?? '-'} → ${n ?? '-'}`);
    const po = str(d.payment_status_old);
    const pn = str(d.payment_status_new);
    if (po && pn && po !== pn) out.push(`${po} → ${pn}`);
    if (d.pin_code_changed === true) out.push(t('admin.auditPinChanged'));
    if (Array.isArray(d.event_details_changed) && d.event_details_changed.length > 0) {
      out.push(`${t('admin.auditChangedPrefix')} ${(d.event_details_changed as unknown[]).slice(0, 3).join(', ')}`);
    }
  } else if (r.action === 'insert' && r.table_name === 'orders') {
    const s = str(d.template_slug);
    if (s) out.push(s);
    const ps = str(d.payment_status);
    if (ps) out.push(ps);
  } else if (r.table_name === 'pending_orders') {
    const s = str(d.template_slug) ?? str(d.status_new) ?? str(d.status);
    if (s) out.push(s);
  }
  return out.slice(0, 3);
}

export default function AuditTab({ toast }: AuditTabProps) {
  const { t, language } = useTranslation();
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter toolbar (pola sama seperti OrdersTab: ketik -> Terapkan).
  const [kindInput, setKindInput] = useState('all');
  const [actionInput, setActionInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [applied, setApplied] = useState({ kind: 'all', action: '', search: '', date: '' });
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const fetchRows = useCallback(async () => {
    const { data, error } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      toast.error(t('admin.auditLoadFail'));
      return;
    }
    setRows((data ?? []) as AuditRow[]);
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

  const hasActiveFilter =
    applied.kind !== 'all' || applied.action !== '' || applied.search !== '' || applied.date !== '';

  const filtered = useMemo(() => {
    const q = applied.search.trim().toLowerCase();
    return rows.filter((r) => {
      if (applied.kind !== 'all' && r.actor_kind !== applied.kind) return false;
      if (applied.action && r.action !== applied.action) return false;
      if (q) {
        const hay = `${r.actor_email ?? ''} ${r.row_id} ${JSON.stringify(r.details ?? {})}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (applied.date) {
        const day = new Date(r.created_at).toISOString().slice(0, 10);
        if (day !== applied.date) return false;
      }
      return true;
    });
  }, [rows, applied]);

  const groups = useMemo(() => groupRows(filtered), [filtered]);
  const pg = usePagination(groups, `${applied.kind}|${applied.action}|${applied.search}|${applied.date}`, 10);

  return (
    <div className="animate-fade-in">
      {/* Header Halaman */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800">{t('admin.auditTitle')}</h2>
        <p className="mt-1 text-sm text-stone-500">{t('admin.auditSubtitle')}</p>
      </div>

      {/* Filter Toolbar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setApplied({ kind: kindInput, action: actionInput, search: searchInput, date: dateInput });
        }}
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#EBDFCE] bg-white p-4 shadow-sm md:flex-row md:items-end"
      >
        <div className="min-w-[170px]">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
            <Filter size={13} className="text-[#E59A59]" />
            <span>{t('admin.auditFilterKind')}</span>
          </label>
          <select
            value={kindInput}
            onChange={(e) => setKindInput(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
          >
            <option value="all">{t('admin.auditKindAll')}</option>
            <option value="admin">admin</option>
            <option value="customer">customer</option>
            <option value="service">service</option>
            <option value="midtrans">midtrans</option>
            <option value="system">system</option>
          </select>
        </div>

        <div className="min-w-[170px]">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
            <Filter size={13} className="text-[#E59A59]" />
            <span>{t('admin.auditFilterAction')}</span>
          </label>
          <select
            value={actionInput}
            onChange={(e) => setActionInput(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
          >
            <option value="">{t('admin.auditActionAll')}</option>
            {ACTION_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[240px] flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
            <Search size={13} className="text-[#E59A59]" />
            <span>{t('admin.auditSearchPh')}</span>
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('admin.auditSearchPh')}
              className="h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] pl-9 pr-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
            />
          </div>
        </div>

        <div className="min-w-[170px]">
          <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]">
            <Calendar size={13} className="text-[#E59A59]" />
            <span>{t('admin.dateFilterLabel')}</span>
          </label>
          <input
            type="date"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
          />
        </div>

        <div className="flex shrink-0 gap-2">
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setKindInput('all');
                setActionInput('');
                setSearchInput('');
                setDateInput('');
                setApplied({ kind: 'all', action: '', search: '', date: '' });
              }}
              className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95"
            >
              <Trash2 size={13} />
              <span>{t('admin.btnResetFilter')}</span>
            </button>
          )}
          <button
            type="submit"
            className="flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#E59A59] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#d48b4b] active:scale-95"
          >
            <Search size={13} />
            <span>{t('admin.btnSearch')}</span>
          </button>
        </div>
      </form>

      {/* Tabel Audit */}
      {loading ? (
        <div className="rounded-2xl border border-[#EBDFCE] bg-white p-10 text-center text-sm text-stone-400 shadow-sm">
          {t('common.loading')}
        </div>
      ) : pg.total === 0 ? (
        <div className="rounded-2xl border border-[#EBDFCE] bg-white p-10 text-center text-sm text-stone-400 shadow-sm">
          {t('admin.auditEmpty')}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#EBDFCE] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="border-b border-[#EBDFCE] bg-[#FAF6EE] text-xs font-bold uppercase tracking-wider text-[#712E1E]">
                <tr>
                  <th className="p-4">{t('admin.auditThTime')}</th>
                  <th className="p-4">{t('admin.auditThActor')}</th>
                  <th className="p-4">{t('admin.auditThAction')}</th>
                  <th className="p-4">{t('admin.auditThSummary')}</th>
                  <th className="p-4">{t('admin.auditThTarget')}</th>
                  <th className="p-4 text-center">{t('admin.auditThDetail')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EBDF]">
                {pg.pageItems.map((g) => {
                  const main = g.rows[0];
                  const style = KIND_STYLE[main.actor_kind] ?? KIND_STYLE.service;
                  const Icon = style.icon;
                  const isOpen = !!open[g.key];
                  return (
                    <Fragment key={g.key}>
                      <tr key={g.key} className="transition hover:bg-[#FAF6EE]/60">
                        <td className="p-4">
                          <span className="text-xs font-medium text-stone-500">
                            {formatDateTime(main.created_at, language)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${style.pill}`}
                          >
                            <Icon size={12} /> {main.actor_kind}
                          </span>
                          <div className="mt-1 max-w-[220px] truncate text-xs text-stone-500">{actorLabel(main)}</div>
                        </td>
                        <td className="p-4">
                          <span className="rounded-lg border border-[#EBDFCE] bg-[#F7EEE3] px-2 py-1 text-xs font-medium text-[#B4693F]">
                            {main.action}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[260px] space-y-1">
                            {summarize(main, t).length === 0 ? (
                              <span className="text-xs text-stone-300">—</span>
                            ) : (
                              summarize(main, t).map((s, i) => (
                                <p key={i} className="truncate text-xs font-medium text-stone-600" title={s}>
                                  {s}
                                </p>
                              ))
                            )}
                            {g.rows.length > 1 && (
                              <p className="text-[11px] font-bold text-stone-400">
                                +{g.rows.length - 1} {t('admin.auditGrouped')}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="mb-1 block font-mono text-xs text-stone-400">#{main.row_id.slice(0, 8)}</span>
                          <span className="rounded-lg border border-[#EBDFCE] bg-[#FAF6EE] px-2 py-1 text-[10px] text-stone-600">
                            {main.table_name}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setOpen((p) => ({ ...p, [g.key]: !p[g.key] }))}
                            className="border border-blue-200 bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100 rounded-xl"
                            title={isOpen ? t('admin.auditHideDetail') : t('admin.auditShowDetail')}
                          >
                            {isOpen ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr key={`${g.key}-detail`} className="bg-[#FAF6EE]/40">
                          <td colSpan={6} className="space-y-2 p-4">
                            {g.rows.map((r) => (
                              <div key={r.id} className="rounded-xl bg-white p-3 text-xs shadow-sm">
                                <p className="font-bold text-stone-700">
                                  {r.action}{' '}
                                  <span className="font-normal text-stone-400">
                                    · {r.table_name} · {r.row_id.slice(0, 13)}
                                  </span>
                                </p>
                                <p className="mt-0.5 text-stone-500">
                                  {actorLabel(r)} · {formatDateTime(r.created_at, language)}
                                </p>
                                <pre className="mt-2 overflow-x-auto rounded-lg bg-stone-900 p-2.5 text-[11px] leading-relaxed text-stone-100">
                                  {JSON.stringify(r.details ?? {}, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={pg.page}
            totalPages={pg.totalPages}
            total={pg.total}
            pageSize={pg.pageSize}
            onPageChange={pg.setPage}
            onPageSizeChange={pg.setPageSize}
          />
        </div>
      )}
    </div>
  );
}
