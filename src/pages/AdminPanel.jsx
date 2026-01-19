import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/GlobalToast';
import ConfirmDialog from '../components/ConfirmDialog';
import { TEMPLATE_OPTIONS } from '../lib/constants'; 
import { 
  Trash2, Edit, Search, Clock, CheckCircle, XCircle, 
  ShieldCheck, LogOut, Save, X, Calendar, User, Image as ImageIcon, 
  MapPin, Loader2, PlusCircle, Grid, Gift, Music, Link as LinkIcon, Layout, UploadCloud, Eye, MessageSquare
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function AdminPanel() {
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State Dialog
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Edit Modal State
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  
  // State Khusus Komentar (RSVP)
  const [rsvps, setRsvps] = useState([]);

  // 1. CEK SESSION & FETCH DATA
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchOrders(); else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchOrders();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) toast.error("Login Gagal: " + error.message);
    else toast.success("Selamat datang, Admin!");
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setOrders([]); toast.success("Berhasil Logout"); };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) toast.error("Gagal ambil data"); else setOrders(data);
    setLoading(false);
  };

  // 4. HAPUS DATA ORDER
  const openDeleteDialog = (id) => { setDeleteId(id); setShowConfirm(true); };
  const executeDelete = async () => {
    setShowConfirm(false);
    const { error } = await supabase.from('orders').delete().eq('id', deleteId);
    if (!error) { toast.success("Data dihapus"); fetchOrders(); } else { toast.error("Gagal hapus"); }
  };

  // 5. BUKA MODAL EDIT (PREPARE DATA)
  const openEditModal = async (order) => {
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
      audio_url: order.event_details?.audio_url || '',
      quote: order.event_details?.quote || '',
      quote_src: order.event_details?.quote_src || ''
    });

    // Fetch RSVPs (Komentar) untuk Order ini
    const { data: rsvpData } = await supabase
        .from('rsvps')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });
    
    setRsvps(rsvpData || []);
  };

  // 6. SIMPAN PERUBAHAN
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const { groom_name, bride_name, wedding_date, payment_status, slug, template_slug, ...eventDetailsJSON } = editFormData;
    const { error } = await supabase.from('orders').update({
        groom_name, bride_name, wedding_date, payment_status, slug, template_slug, event_details: eventDetailsJSON
      }).eq('id', editingOrder.id);

    if (!error) {
      toast.success("Berhasil disimpan!");
      setEditingOrder(null);
      fetchOrders();
    } else {
      toast.error("Gagal update: " + error.message);
    }
  };

  const handleInputChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  // --- LOGIC HAPUS KOMENTAR ---
  const handleDeleteRsvp = async (rsvpId) => {
      if(!window.confirm("Hapus komentar ini?")) return;
      
      const { error } = await supabase.from('rsvps').delete().eq('id', rsvpId);
      if(!error) {
          setRsvps(prev => prev.filter(r => r.id !== rsvpId));
          toast.success("Komentar dihapus");
      } else {
          toast.error("Gagal hapus komentar");
      }
  };

  // --- LOGIC UTILS ---
  const addAdminBank = () => setEditFormData(prev => ({ ...prev, banks: [...(prev.banks || []), { bank: '', number: '', name: '' }] }));
  const updateAdminBank = (index, field, value) => { const newBanks = [...(editFormData.banks || [])]; newBanks[index][field] = value; setEditFormData(prev => ({ ...prev, banks: newBanks })); };
  const removeAdminBank = (index) => { const newBanks = [...(editFormData.banks || [])]; newBanks.splice(index, 1); setEditFormData(prev => ({ ...prev, banks: newBanks })); };

  const handleAdminUpload = async (e, fieldName) => {
    const file = e.target.files[0]; if (!file) return; setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const prefix = fieldName === 'audio_url' ? 'AUDIO_' : 'ADMIN_IMG_';
        const filePath = `${editingOrder.id}/${prefix}${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('images').upload(filePath, file); if (error) throw error;
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        setEditFormData(prev => ({ ...prev, [fieldName]: data.publicUrl })); toast.success("Upload berhasil.");
    } catch (err) { toast.error("Gagal: " + err.message); } finally { setUploading(false); }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return; setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${editingOrder.id}/GALLERY_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('images').upload(filePath, file); if (error) throw error;
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        setEditFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), data.publicUrl] })); toast.success("Foto ditambahkan");
    } catch (err) { toast.error("Gagal: " + err.message); } finally { setUploading(false); }
  };

  const removeGalleryItem = (index) => setEditFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  const calculateDuration = (dateString) => { const diff = Math.abs(new Date() - new Date(dateString)); return Math.ceil(diff / (1000 * 60 * 60 * 24)); }; 

  if (!session) return (
      <div className="min-h-screen bg-[#FFD5AF] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border-2 border-[#712E1E] text-center">
          <div className="bg-[#712E1E] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><ShieldCheck className="w-8 h-8 text-[#FFD5AF]" /></div>
          <h1 className="text-2xl font-bold text-[#712E1E] mb-2">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required placeholder="admin@invyta.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#712E1E] outline-none" />
            <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#712E1E] outline-none" />
            <button disabled={loginLoading} className="w-full bg-[#E59A59] text-white py-3 rounded-xl font-bold hover:bg-[#d48b4b] transition flex justify-center shadow-lg">{loginLoading ? <Loader2 className="animate-spin" /> : "Masuk Dashboard"}</button>
          </form>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <div className="bg-[#712E1E] text-[#FFD5AF] p-6 shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div><h1 className="text-xl md:text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> Admin Panel</h1><p className="text-xs opacity-80">Superuser: {session.user.email}</p></div>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm flex items-center gap-2 font-medium"><LogOut className="w-4 h-4" /> Keluar</button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center">
           <div className="bg-white px-5 py-3 rounded-xl shadow-sm border flex items-center gap-3 text-[#712E1E] w-full md:w-auto">
              <div className="bg-[#FFF0E0] p-2 rounded-lg"><Clock className="w-5 h-5"/></div>
              <div><p className="text-xs text-gray-400 font-bold uppercase">Total Undangan</p><p className="text-xl font-bold">{orders.length} Pesanan</p></div>
           </div>
           <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input placeholder="Cari Mempelai..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 p-3 rounded-xl border shadow-sm outline-none focus:ring-2 focus:ring-[#E59A59]" />
           </div>
        </div>

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
                {loading ? (<tr><td colSpan="5" className="p-10 text-center text-gray-400">Sedang memuat data...</td></tr>) : 
                orders.filter(o => o.groom_name?.toLowerCase().includes(searchTerm) || o.bride_name?.toLowerCase().includes(searchTerm)).map((order) => (
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

      <ConfirmDialog isOpen={showConfirm} title="Hapus Data Permanen?" message="Data undangan ini akan dihapus selamanya." isDanger={true} onCancel={() => setShowConfirm(false)} onConfirm={executeDelete} />

      {/* --- MODAL BENTO EDIT LAYOUT --- */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#F3F4F6] rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden relative">
            
            {/* Header Modal */}
            <div className="bg-white p-4 px-6 flex justify-between items-center shrink-0 border-b">
              <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><Edit className="w-5 h-5"/></div>
                  <div><h2 className="text-xl font-bold text-gray-800">Edit Data Undangan</h2><p className="text-xs text-gray-500 font-mono">ID: {editingOrder.id}</p></div>
              </div>
              <div className="flex gap-3">
                  <button onClick={() => setEditingOrder(null)} className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition">Batal</button>
                  <button onClick={handleSaveUpdate} className="px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"><Save className="w-4 h-4"/> Simpan</button>
              </div>
            </div>

            {/* BENTO GRID CONTENT */}
            <div className="flex-1 overflow-y-auto p-6">
                <form id="editForm" className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* 1. MAIN INFO */}
                    <BentoCard title="Informasi Mempelai" icon={<User className="text-pink-500"/>} colSpan="md:col-span-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <InputGroup label="Mempelai Pria" name="groom_name" val={editFormData.groom_name} onChange={handleInputChange} />
                            <InputGroup label="Mempelai Wanita" name="bride_name" val={editFormData.bride_name} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <InputGroup label="Ortu Pria" name="groom_parents" val={editFormData.groom_parents} onChange={handleInputChange} />
                            <InputGroup label="Ortu Wanita" name="bride_parents" val={editFormData.bride_parents} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t pt-4">
                            <InputGroup label="Tanggal Acara" name="wedding_date" type="date" val={editFormData.wedding_date} onChange={handleInputChange} />
                            <div><label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Status Pembayaran</label><select name="payment_status" value={editFormData.payment_status} onChange={handleInputChange} className="w-full border p-2.5 rounded-lg bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"><option value="pending">Pending</option><option value="success">Success (Lunas)</option><option value="failed">Failed</option></select></div>
                        </div>
                    </BentoCard>

                    {/* 2. SETTINGS */}
                    <BentoCard title="Pengaturan Sistem" icon={<Layout className="text-indigo-500"/>} colSpan="md:col-span-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Tema Undangan</label>
                                <select name="template_slug" value={editFormData.template_slug} onChange={handleInputChange} className="w-full border p-2.5 rounded-lg bg-indigo-50 font-medium text-indigo-900 outline-none">
                                    {TEMPLATE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <InputGroup label="Link Slug (URL)" name="slug" val={editFormData.slug} onChange={handleInputChange} placeholder="misal: romeo-juliet" />
                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-xs text-yellow-700 italic">
                                *Mengubah slug akan mengubah link undangan yang sudah disebar.
                            </div>
                        </div>
                    </BentoCard>

                    {/* 3. EVENT DETAILS */}
                    <BentoCard title="Lokasi & Acara" icon={<MapPin className="text-red-500"/>} colSpan="md:col-span-6">
                        <div className="space-y-4">
                            <InputGroup label="Nama Gedung / Tempat" name="venue_name" val={editFormData.venue_name} onChange={handleInputChange} />
                            <div><label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Alamat Lengkap</label><textarea name="venue_address" value={editFormData.venue_address || ''} onChange={handleInputChange} className="w-full border p-3 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Alamat..."></textarea></div>
                            <InputGroup label="Link Google Maps" name="maps_link" val={editFormData.maps_link} onChange={handleInputChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputGroup label="Jam Akad" name="akad_time" val={editFormData.akad_time} onChange={handleInputChange} />
                                <InputGroup label="Jam Resepsi" name="resepsi_time" val={editFormData.resepsi_time} onChange={handleInputChange} />
                            </div>
                        </div>
                    </BentoCard>

                    {/* 4. MAIN PHOTOS */}
                    <BentoCard title="Foto Utama" icon={<ImageIcon className="text-green-500"/>} colSpan="md:col-span-6">
                        <div className="grid grid-cols-3 gap-4 items-end">
                            {[
                                { field: 'groom_photo', label: 'Groom', style: 'aspect-square rounded-full' },
                                { field: 'bride_photo', label: 'Bride', style: 'aspect-square rounded-full' },
                                { field: 'cover_photo', label: 'Cover', style: 'aspect-[3/4] rounded-lg' }
                            ].map((item) => (
                                <div key={item.field} className="text-center">
                                    <div className={`${item.style} w-full bg-gray-100 border border-dashed border-gray-300 relative overflow-hidden group mb-2 mx-auto shadow-sm`}>
                                        <img 
                                            src={editFormData[item.field] || "https://via.placeholder.com/150"} 
                                            className="w-full h-full object-cover"
                                            alt={item.label}
                                        />
                                        <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs">
                                            <UploadCloud className="w-6 h-6 mb-1"/> Ganti
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                disabled={uploading} 
                                                onChange={(e) => handleAdminUpload(e, item.field)} 
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </BentoCard>

                    {/* 5. GALLERY */}
                    <BentoCard title="Galeri Foto" icon={<Grid className="text-purple-500"/>} colSpan="md:col-span-12">
                        <div className="flex flex-wrap gap-4">
                            <label className="w-32 h-32 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition text-purple-600">
                                <PlusCircle className="w-8 h-8 mb-2"/> <span className="text-xs font-bold">Tambah</span>
                                <input type="file" className="hidden" disabled={uploading} onChange={handleGalleryUpload} />
                            </label>
                            {editFormData.gallery && editFormData.gallery.map((url, idx) => (
                                <div key={idx} className="w-32 h-32 relative group rounded-xl overflow-hidden shadow-sm border">
                                    <img src={url} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeGalleryItem(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"><X className="w-3 h-3" /></button>
                                </div>
                            ))}
                        </div>
                    </BentoCard>

                    {/* 6. AUDIO & QUOTE */}
                    <BentoCard title="Musik & Kutipan" icon={<Music className="text-blue-500"/>} colSpan="md:col-span-6">
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-4 flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm"><Music className="w-4 h-4 text-blue-500"/></div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-blue-900 truncate">{editFormData.audio_url ? 'Musik Terpasang' : 'Belum ada musik'}</p>
                                <audio controls src={editFormData.audio_url} className="h-6 w-full mt-1 max-w-[200px]"/>
                            </div>
                            <label className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-blue-700">Upload <input type="file" accept="audio/*" onChange={(e) => handleAdminUpload(e, 'audio_url')} className="hidden" disabled={uploading}/></label>
                        </div>
                        <div className="space-y-3">
                            <div><label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Kutipan / Quote</label><textarea name="quote" value={editFormData.quote || ''} onChange={handleInputChange} className="w-full border p-3 rounded-lg h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tulis kutipan..."></textarea></div>
                            <InputGroup label="Sumber Kutipan" name="quote_src" val={editFormData.quote_src} onChange={handleInputChange} placeholder="Contoh: QS. Ar-Rum" />
                        </div>
                    </BentoCard>

                    {/* 7. GIFT / BANK */}
                    <BentoCard title="Rekening & Gift" icon={<Gift className="text-orange-500"/>} colSpan="md:col-span-6">
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
                            {(!editFormData.banks || editFormData.banks.length === 0) && <p className="text-center text-gray-400 text-sm py-4 italic">Belum ada rekening.</p>}
                            {editFormData.banks && editFormData.banks.map((bank, idx) => (
                                <div key={idx} className="bg-white border p-3 rounded-xl relative group hover:border-orange-300 transition">
                                    <button type="button" onClick={() => removeAdminBank(idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    <div className="grid grid-cols-3 gap-2 pr-6">
                                        <input value={bank.bank} onChange={(e) => updateAdminBank(idx, 'bank', e.target.value)} className="border-b border-dashed p-1 text-sm outline-none font-bold text-gray-700" placeholder="Bank"/>
                                        <input value={bank.number} onChange={(e) => updateAdminBank(idx, 'number', e.target.value)} className="border-b border-dashed p-1 text-sm outline-none font-mono" placeholder="No. Rek"/>
                                        <input value={bank.name} onChange={(e) => updateAdminBank(idx, 'name', e.target.value)} className="border-b border-dashed p-1 text-sm outline-none" placeholder="Atas Nama"/>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addAdminBank} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold border border-dashed border-gray-300 flex items-center justify-center gap-2">+ Tambah Rekening</button>
                        </div>
                    </BentoCard>

                    {/* 8. KOMENTAR (BARU) - FULL WIDTH */}
                    <BentoCard title="Buku Tamu / Komentar" icon={<MessageSquare className="text-teal-500"/>} colSpan="md:col-span-12">
                        {rsvps.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-6 italic">Belum ada komentar masuk.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {rsvps.map((rsvp) => (
                                    <div key={rsvp.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition relative group">
                                        <button 
                                            type="button" 
                                            onClick={() => handleDeleteRsvp(rsvp.id)} 
                                            className="absolute top-3 right-3 text-red-300 hover:text-red-500 transition"
                                            title="Hapus Komentar"
                                        >
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-bold text-gray-800 text-sm">{rsvp.guest_name}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${rsvp.status === 'hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {rsvp.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded mb-2">"{rsvp.message}"</p>
                                        <p className="text-[10px] text-gray-400">{new Date(rsvp.created_at).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </BentoCard>

                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB COMPONENTS (BENTO UI) ---
function BentoCard({ title, icon, children, colSpan = "col-span-12" }) {
    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full ${colSpan}`}>
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{title}</h3>
            </div>
            {children}
        </div>
    )
}

function InputGroup({ label, name, val, onChange, type="text", placeholder="" }) {
  return (
    <div>
        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">{label}</label>
        <input type={type} name={name} value={val || ''} onChange={onChange} placeholder={placeholder} className="w-full border p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
    </div>
  )
}