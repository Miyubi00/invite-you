import { useState, useEffect } from 'react';
import { Search, Filter, Zap, ToggleRight, ToggleLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function TemplatesTab({ templates, searchTerm, setSearchTerm, confirmAction, fetchData, toast, loading }) {
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('All');
  const [editPrices, setEditPrices] = useState({}); 
  const [bulkPrice, setBulkPrice] = useState(''); 

  // Sinkronisasi state harga lokal saat data templates masuk/berubah
  useEffect(() => {
    const initialPrices = {};
    templates.forEach(t => initialPrices[t.slug] = t.price);
    setEditPrices(initialPrices);
  }, [templates]);

  // Filter
  const filteredTemplates = templates.filter(t => {
    const matchSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = templateCategoryFilter === 'All' || t.category === templateCategoryFilter;
    return matchSearch && matchCategory;
  });

  // Action Functions
  const handleToggleTemplateActive = async (slug, currentStatus) => {
    const { error } = await supabase.from('templates').update({ is_active: !currentStatus }).eq('slug', slug);
    if (!error) { toast.success(`Template ${!currentStatus ? 'Diaktifkan' : 'Dinonaktifkan'}!`); fetchData(); } 
    else toast.error("Gagal mengubah status.");
  };

  const handleUpdateTemplatePrice = async (slug) => {
    const newPrice = editPrices[slug];
    if (!newPrice || isNaN(newPrice)) return toast.error("Harga tidak valid");
    const { error } = await supabase.from('templates').update({ price: parseInt(newPrice) }).eq('slug', slug);
    if (!error) { toast.success("Harga berhasil diperbarui!"); fetchData(); } 
    else toast.error("Gagal update harga.");
  };

  const handleBulkPriceUpdate = async () => {
    if (!bulkPrice || isNaN(bulkPrice)) return toast.warning("Masukkan nominal harga yang valid.");
    if (filteredTemplates.length === 0) return toast.warning("Tidak ada template yang difilter.");

    confirmAction(
      "Ubah Harga Massal?",
      `Anda yakin ingin mengubah harga untuk ${filteredTemplates.length} template yang tampil saat ini menjadi Rp ${new Intl.NumberFormat('id-ID').format(bulkPrice)}?`,
      false, 
      async () => {
        const slugsToUpdate = filteredTemplates.map(t => t.slug);
        const { error } = await supabase.from('templates').update({ price: parseInt(bulkPrice) }).in('slug', slugsToUpdate);
        if (!error) { toast.success("Harga massal berhasil diterapkan!"); setBulkPrice(''); fetchData(); } 
        else toast.error("Gagal update massal.");
      }
    );
  };

  return (
    <div className="animate-fade-in">
        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-end justify-between">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <div className="relative min-w-[250px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Cari Template</label>
                    <Search className="absolute left-3 top-7 w-4 h-4 text-gray-400" />
                    <input 
                        placeholder="Nama atau slug..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-9 p-2 rounded-lg border shadow-sm outline-none focus:ring-2 focus:ring-[#E59A59] text-sm" 
                    />
                </div>
                <div className="min-w-[150px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Filter className="w-3 h-3"/> Kategori</label>
                    <select 
                        value={templateCategoryFilter} onChange={(e) => setTemplateCategoryFilter(e.target.value)} 
                        className="w-full p-2 rounded-lg border shadow-sm outline-none focus:ring-2 focus:ring-[#E59A59] text-sm"
                    >
                        <option value="All">Semua Kategori</option>
                        <option value="Basic">Basic</option>
                        <option value="RSVP">RSVP</option>
                    </select>
                </div>
            </div>
            
            {/* Fitur Ubah Harga Massal */}
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center gap-3 w-full md:w-auto">
                <div>
                    <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> Ubah Harga Massal</label>
                    <div className="relative">
                        <span className="absolute left-2 top-2 text-gray-400 text-sm font-medium">Rp</span>
                        <input 
                            type="number" placeholder="Harga baru" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)}
                            className="border border-orange-200 p-2 pl-8 rounded-lg w-32 outline-none focus:ring-2 focus:ring-orange-500 text-sm font-bold text-gray-700"
                        />
                    </div>
                </div>
                <button onClick={handleBulkPriceUpdate} className="bg-orange-600 text-white h-10 px-4 mt-[18px] rounded-lg text-sm font-bold shadow-md hover:bg-orange-700 transition">
                    Terapkan
                </button>
            </div>
        </div>

        {/* TABEL TEMPLATE */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-[#FFF0E0] text-[#712E1E] uppercase font-bold text-xs tracking-wider border-b border-[#E59A59]/20">
                        <tr>
                            <th className="p-4">Nama Template</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">Harga (Rp)</th>
                            <th className="p-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (<tr><td colSpan="4" className="p-10 text-center text-gray-400">Sedang memuat data template...</td></tr>) : 
                        filteredTemplates.length === 0 ? (<tr><td colSpan="4" className="p-10 text-center text-gray-400">Template tidak ditemukan</td></tr>) :
                        filteredTemplates.map((template) => (
                            <tr key={template.slug} className={`transition group ${template.is_active ? 'hover:bg-gray-50' : 'bg-gray-100/50 opacity-70'}`}>
                                <td className="p-4">
                                    <div className="font-bold text-[#712E1E] text-base">{template.name}</div>
                                    <div className="text-xs text-gray-400 font-mono mt-1">Slug: {template.slug}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs border font-bold ${template.category === 'RSVP' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        {template.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-400 text-sm">Rp</span>
                                            <input 
                                                type="number" value={editPrices[template.slug] || ''} onChange={(e) => setEditPrices({...editPrices, [template.slug]: e.target.value})}
                                                className="border p-2 pl-8 rounded-lg w-32 outline-none focus:ring-2 focus:ring-[#E59A59] font-bold text-gray-700"
                                            />
                                        </div>
                                        {editPrices[template.slug] != template.price && (
                                            <button onClick={() => handleUpdateTemplatePrice(template.slug)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition shadow-md" title="Simpan Harga Baru">
                                                <Save className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleToggleTemplateActive(template.slug, template.is_active)}
                                        className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl transition font-bold text-xs border ${template.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                                    >
                                        {template.is_active ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-red-600" />}
                                        {template.is_active ? 'AKTIF' : 'NONAKTIF'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}