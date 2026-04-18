import { Clock, CheckCircle, XCircle, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';

export default function OrdersTab({ 
    orders, pendingOrders, searchTerm, setSearchTerm, confirmAction, 
    fetchData, setEditingOrder, setEditFormData, setRsvps, toast 
}) {

  // --- LOGIC ORDERS ---
  const handleApprovePending = (pendingOrder) => {
    confirmAction("Aktifkan Pesanan?", `Pesanan atas nama ${pendingOrder.groom_name} & ${pendingOrder.bride_name} akan dimasukkan ke data utama.`, false, 
      async () => {
        const cleanGroom = pendingOrder.groom_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const cleanBride = pendingOrder.bride_name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const randomNumber = Math.floor(1000 + Math.random() * 9000);
        const generatedSlug = `${cleanGroom}-${cleanBride}-${randomNumber}`;

        const { error: insertError } = await supabase.from('orders').insert([{
            groom_name: pendingOrder.groom_name, bride_name: pendingOrder.bride_name,
            wedding_date: pendingOrder.wedding_date, whatsapp: pendingOrder.whatsapp,
            pin_code: pendingOrder.pin_code, template_slug: pendingOrder.template_slug,
            slug: generatedSlug, payment_status: 'success', event_details: {}
        }]);

        if (insertError) return toast.error("Gagal mengaktifkan: " + insertError.message);
        
        await supabase.from('pending_orders').delete().eq('id', pendingOrder.id);
        toast.success("Pesanan diaktifkan! Slug unik berhasil dibuat.");
        fetchData(); 
      }
    );
  };

  const handleRejectPending = (id) => {
    confirmAction("Tolak & Hapus Pesanan?", "Pesanan ini akan ditolak dan dihapus secara permanen.", true, 
      async () => {
        const { error } = await supabase.from('pending_orders').delete().eq('id', id);
        if (!error) { toast.success("Pesanan ditolak & dihapus."); fetchData(); } 
        else toast.error("Gagal menghapus.");
      }
    );
  };

  const openDeleteDialog = (id) => {
    confirmAction("Hapus Data Permanen?", "Data undangan ini akan dihapus selamanya. Tindakan ini tidak bisa dibatalkan.", true,
      async () => {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (!error) { toast.success("Data dihapus"); fetchData(); } 
        else toast.error("Gagal hapus");
      }
    );
  };

  const openEditModal = async (order) => {
    setEditingOrder(order);
    setEditFormData({
      ...order.event_details,
      groom_name: order.groom_name, bride_name: order.bride_name,
      wedding_date: order.wedding_date, payment_status: order.payment_status,
      slug: order.slug, template_slug: order.template_slug,
      gallery: order.event_details?.gallery || [], banks: order.event_details?.banks || [],
      audio_url: order.event_details?.audio_url || '', quote: order.event_details?.quote || '', quote_src: order.event_details?.quote_src || ''
    });
    
    const { data: rsvpData } = await supabase.from('rsvps').select('*').eq('order_id', order.id).order('created_at', { ascending: false });
    setRsvps(rsvpData || []);
  };

  const calculateDuration = (dateString) => { 
      const diff = Math.abs(new Date() - new Date(dateString)); 
      return Math.ceil(diff / (1000 * 60 * 60 * 24)); 
  }; 

  // --- FILTER ---
  const filteredPending = pendingOrders.filter(o => o.groom_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.bride_name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = orders.filter(o => o.groom_name?.toLowerCase().includes(searchTerm.toLowerCase()) || o.bride_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="animate-fade-in">
        
        {/* Search Bar Khusus Order */}
        <div className="relative w-full max-w-md mb-6">
            <input 
                placeholder="Cari Nama Mempelai..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full p-3 rounded-xl border shadow-sm outline-none focus:ring-2 focus:ring-[#E59A59]" 
            />
        </div>

        {/* Tabel Pending Orders */}
        {filteredPending.length > 0 && (
        <div className="mb-10">
            <h2 className="text-lg font-bold text-orange-600 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Menunggu Persetujuan (Via WhatsApp)
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-orange-50 text-orange-800 uppercase font-bold text-xs tracking-wider border-b border-orange-200">
                    <tr>
                    <th className="p-4">Tanggal Order</th>
                    <th className="p-4">Mempelai</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Kontak Info</th>
                    <th className="p-4 text-center">Tindakan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredPending.map((order) => (
                    <tr key={order.id} className="hover:bg-orange-50/50 transition group">
                        <td className="p-4"><span className="text-xs text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString('id-ID')}</span></td>
                        <td className="p-4"><div className="font-bold text-orange-800 text-base">{order.groom_name} & {order.bride_name}</div><div className="text-xs text-gray-500 mt-1">Acara: {order.wedding_date}</div></td>
                        <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs border border-orange-200 font-medium">{order.template_slug}</span></td>
                        <td className="p-4">
                        <a href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 w-fit px-2 py-1 rounded border border-emerald-100 transition"><FaWhatsapp className="w-3 h-3"/> Chat Pembeli</a>
                        </td>
                        <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                            <button onClick={() => handleApprovePending(order)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition shadow-sm font-bold text-xs flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Aktifkan</button>
                            <button onClick={() => handleRejectPending(order.id)} className="bg-red-50 text-red-600 p-1.5 rounded-lg hover:bg-red-100 transition border border-red-200" title="Tolak / Hapus"><XCircle className="w-4 h-4" /></button>
                        </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        )}

        {/* Tabel Data Undangan Aktif */}
        <div>
        <h2 className="text-lg font-bold text-[#712E1E] mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Data Undangan Aktif
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-[#FFF0E0] text-[#712E1E] uppercase font-bold text-xs tracking-wider border-b border-[#E59A59]/20">
                <tr>
                    <th className="p-4">Info Order</th>
                    <th className="p-4">Mempelai & Tanggal</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Pembayaran</th>
                    <th className="p-4 text-center">Kontrol</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (<tr><td colSpan="5" className="p-10 text-center text-gray-400">Tidak ada data ditemukan</td></tr>) :
                filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition group">
                    <td className="p-4"><span className="font-mono text-xs text-gray-400 block mb-1">#{order.id.slice(0,8)}</span><span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-1 rounded border">{calculateDuration(order.created_at)} Hari Yg Lalu</span></td>
                    <td className="p-4"><div className="font-bold text-[#712E1E] text-base">{order.groom_name} & {order.bride_name}</div><div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar className="w-3 h-3"/> {order.wedding_date}</div></td>
                    <td className="p-4"><span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs border border-orange-100 font-medium">{order.template_slug}</span></td>
                    <td className="p-4">
                        {order.payment_status === 'success' ? <span className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-green-100"><CheckCircle className="w-3 h-3" /> Lunas</span> : <span className="flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-red-100"><XCircle className="w-3 h-3" /> {order.payment_status}</span>}
                    </td>
                    <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                        <a href={`/wedding/${order.slug}`} target="_blank" rel="noreferrer" className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition border border-green-200" title="Lihat Website"><Eye className="w-4 h-4" /></a>
                        {order.whatsapp && <a href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-100 transition border border-emerald-200" title="Chat WhatsApp"><FaWhatsapp className="w-4 h-4" /></a>}
                        <button onClick={() => openEditModal(order)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition border border-blue-200" title="Edit Full Data"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => openDeleteDialog(order.id)} className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition border border-red-200" title="Hapus Permanen"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    </div>
  );
}