import { useState } from 'react';
import { Search, Filter, Zap, ToggleRight, ToggleLeft, Save, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import type { Dispatch, SetStateAction } from 'react';
import type { TemplateRow } from '../../types/database';
import type { ToastApi } from '../GlobalToast';
import Pagination from '../shared/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useTranslation } from '../../i18n';

interface TemplatesTabProps {
  templates: TemplateRow[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  confirmAction: (title: string, message: string, isDanger: boolean, onConfirm: () => void) => void;
  fetchData: () => Promise<void>;
  toast: ToastApi;
  loading: boolean;
}

const INPUT_CLASS =
  'h-10 w-full rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-3 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20';

const LABEL_CLASS =
  'mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#712E1E]';

export default function TemplatesTab({ templates, searchTerm, setSearchTerm, confirmAction, fetchData, toast, loading }: TemplatesTabProps) {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState(searchTerm);
  const [categoryInput, setCategoryInput] = useState('All');

  const [appliedCategory, setAppliedCategory] = useState('All');

  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [bulkPrice, setBulkPrice] = useState('');

  const handleApplyFilters = () => {
    setSearchTerm(searchInput);
    setAppliedCategory(categoryInput);
  };

  const hasFilter = Boolean(searchTerm) || appliedCategory !== 'All';

  const resetFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setCategoryInput('All');
    setAppliedCategory('All');
  };

  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = appliedCategory === 'All' || t.category === appliedCategory;
    return matchSearch && matchCategory;
  });

  const tplPg = usePagination(filteredTemplates, `${searchTerm}|${appliedCategory}`);

  const handleToggleTemplateActive = async (slug: string, currentStatus: boolean) => {
    const { count, error } = await supabase
      .from('templates')
      .update({ is_active: !currentStatus }, { count: 'exact' })
      .eq('slug', slug);
    if (!error && (count ?? 0) > 0) {
      toast.success(t('toast.templateStatusChanged', { status: !currentStatus ? t('common.active') : t('common.inactive') }));
      fetchData();
    } else if (!error) {
      toast.error(t('toast.changeStatusNoChange'));
    } else {
      toast.error(t('toast.changeStatusFailed'));
    }
  };

  const handleUpdateTemplatePrice = async (slug: string) => {
    const newPrice = editPrices[slug];
    if (!newPrice || isNaN(Number(newPrice))) return toast.error(t('toast.invalidPrice'));
    const { count, error } = await supabase
      .from('templates')
      .update({ price: parseInt(newPrice) }, { count: 'exact' })
      .eq('slug', slug);
    if (!error && (count ?? 0) > 0) {
      toast.success(t('toast.priceUpdatedSuccess'));
      fetchData();
    } else if (!error) {
      toast.error(t('toast.priceUpdateNoChange'));
    } else {
      toast.error(t('toast.priceUpdateFailed'));
    }
  };

  const handleBulkPriceUpdate = async () => {
    if (!bulkPrice || isNaN(Number(bulkPrice))) return toast.warning(t('toast.invalidPrice'));
    if (filteredTemplates.length === 0) return toast.warning(t('admin.templateNotFound'));

    confirmAction(
      "Ubah Harga Massal?",
      `Anda yakin ingin mengubah harga untuk ${filteredTemplates.length} template yang tampil saat ini menjadi Rp ${new Intl.NumberFormat('id-ID').format(Number(bulkPrice))}?`,
      false,
      async () => {
        const slugsToUpdate = filteredTemplates.map(t => t.slug);
        const expected = slugsToUpdate.length;
        const { count, error } = await supabase
          .from('templates')
          .update({ price: parseInt(bulkPrice) }, { count: 'exact' })
          .in('slug', slugsToUpdate);

        if (!error && (count ?? 0) === expected) {
          toast.success(t('toast.bulkPriceApplied'));
          setBulkPrice('');
          fetchData();
        } else if (!error && (count ?? 0) > 0) {
          toast.warning(`Sebagian berhasil: ${count} dari ${expected} template terupdate.`);
          fetchData();
        } else if (!error) {
          toast.error(t('toast.bulkPriceNoChange'));
        } else {
          toast.error(t('toast.bulkPriceFailed'));
        }
      }
    );
  };

  return (
    <div className="animate-fade-in">

        {/* Header Halaman */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-800">{t('admin.templatesTitle')}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {t('admin.templatesSubtitle')}
          </p>
        </div>

        {/* TOOLBAR */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}
          className="bg-white p-4 rounded-2xl shadow-sm border border-[#EBDFCE] mb-6 flex flex-col md:flex-row gap-4 md:items-end justify-between"
        >
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-end">
                {/* Cari Template */}
                <div className="min-w-[240px] flex-1">
                    <label className={LABEL_CLASS}>
                        <Search size={13} className="text-[#E59A59]" />
                        <span>{t('admin.tplSearchLabel')}</span>
                    </label>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder={t('admin.tplSearchPlaceholder')}
                            value={searchInput}
                            onChange={e => setSearchInput(e.target.value)}
                            className={`${INPUT_CLASS} pl-9`}
                        />
                    </div>
                </div>

                {/* Filter Kategori */}
                <div className="min-w-[170px]">
                    <label className={LABEL_CLASS}>
                        <Filter size={13} className="text-[#E59A59]" />
                        <span>{t('admin.tplCategoryLabel')}</span>
                    </label>
                    <select
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        className={INPUT_CLASS}
                    >
                        <option value="All">{t('admin.tplCategoryAll')}</option>
                        <option value="Basic">Basic</option>
                        <option value="RSVP">RSVP</option>
                    </select>
                </div>

                {/* Reset / Cari */}
                <div className="flex shrink-0 gap-2">
                    {hasFilter && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95 whitespace-nowrap"
                        >
                            <Trash2 size={13} />
                            <span>{t('admin.btnResetFilter')}</span>
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#E59A59] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#d48b4b] active:scale-95 whitespace-nowrap"
                    >
                        <Search size={13} />
                        <span>{t('admin.btnSearch')}</span>
                    </button>
                </div>
            </div>

            {/* Fitur Ubah Harga Massal */}
            <div className="rounded-xl border border-[#EBDFCE] bg-[#F7EEE3] p-3 flex items-end gap-3 w-full md:w-auto">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-0 flex items-center gap-1 text-[#B4693F]"><Zap size={13}/> {t('admin.bulkPriceLabel')}</label>
                    <div className="relative mt-1.5">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">Rp</span>
                        <input
                            type="number" placeholder={t('admin.bulkPricePlaceholder')} value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)}
                            className="h-10 border border-[#EBDFCE] bg-white p-2 pl-8 rounded-xl w-32 outline-none focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 transition text-sm font-bold text-stone-700"
                        />
                    </div>
                </div>
                <button type="button" onClick={handleBulkPriceUpdate} className="h-10 bg-[#712E1E] text-white px-4 rounded-xl text-sm font-bold shadow-md hover:bg-[#8a4030] transition active:scale-95">
                    {t('admin.btnApplyBulk')}
                </button>
            </div>
        </form>

        {/* TABEL TEMPLATE */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EBDFCE] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-stone-600">
                    <thead className="bg-[#FAF6EE] text-[#712E1E] uppercase font-bold text-xs tracking-wider border-b border-[#EBDFCE]">
                        <tr>
                            <th className="p-4">{t('admin.thTemplateName')}</th>
                            <th className="p-4">{t('admin.thCategory')}</th>
                            <th className="p-4">{t('admin.thPrice')}</th>
                            <th className="p-4 text-center">{t('admin.thStatus')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3EBDF]">
                        {loading ? (<tr><td colSpan={4} className="p-10 text-center text-stone-400">{t('admin.loadingTemplates')}</td></tr>) :
                        filteredTemplates.length === 0 ? (<tr><td colSpan={4} className="p-10 text-center text-stone-400">{t('admin.templateNotFound')}</td></tr>) :
                        tplPg.pageItems.map((template) => (
                            <tr key={template.slug} className={`transition group ${template.is_active ? 'hover:bg-[#FAF6EE]/60' : 'bg-[#FAF6EE]/50 opacity-70'}`}>
                                <td className="p-4">
                                    <div className="font-bold text-[#712E1E] text-base">{template.name}</div>
                                    <div className="text-xs text-stone-400 font-mono mt-1">Slug: {template.slug}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs border font-bold ${template.category === 'RSVP' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        {template.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">Rp</span>
                                            <input
                                                type="number" value={editPrices[template.slug] ?? template.price} onChange={(e) => setEditPrices((prev) => ({ ...prev, [template.slug]: e.target.value }))}
                                                className="border border-[#EBDFCE] p-2 pl-8 rounded-xl w-32 outline-none focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 transition font-bold text-stone-700"
                                            />
                                        </div>
                                        {Number(editPrices[template.slug]) != template.price && (
                                            <button onClick={() => handleUpdateTemplatePrice(template.slug)} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition shadow-md" title="Simpan Harga Baru">
                                                <Save className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => handleToggleTemplateActive(template.slug, template.is_active ?? false)}
                                        className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl transition font-bold text-xs border ${template.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                                    >
                                        {template.is_active ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-red-600" />}
                                        {template.is_active ? t('admin.statusActive') : t('admin.statusInactive')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {!loading && filteredTemplates.length > 0 && (
                <Pagination
                    page={tplPg.page}
                    totalPages={tplPg.totalPages}
                    total={tplPg.total}
                    pageSize={tplPg.pageSize}
                    onPageChange={tplPg.setPage}
                    onPageSizeChange={tplPg.setPageSize}
                />
            )}
        </div>
    </div>
  );
}
