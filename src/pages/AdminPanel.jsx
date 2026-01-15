import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/GlobalToast'; // Pastikan path ini benar
import ConfirmDialog from '../components/ConfirmDialog'; // Pastikan path ini benar
import { 
  Trash2, Edit, Search, Clock, CheckCircle, XCircle, 
  ShieldCheck, LogOut, Save, X, Calendar, User, Image as ImageIcon, 
  MapPin, Loader2, PlusCircle, Grid, Eye, Gift, MessageCircle
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function AdminPanel() {
  const toast = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk Dialog Konfirmasi
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Edit Modal State
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [activeTab, setActiveTab] = useState('data'); // data | photo | gallery | gift | details
  const [uploading, setUploading] = useState(false);

  // 1. CEK SESSION
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchOrders();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchOrders();
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoginLoading(false);
    if (error) {
       toast.error("Login Gagal: " + error.message);
    } else {
       toast.success("Selamat datang, Admin!");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOrders([]);
    toast.success("Berhasil Logout");
  };

  // 3. FETCH DATA
  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) toast.error("Gagal ambil data");
    else setOrders(data);
    setLoading(false);
  };

  // 4. HAPUS DATA (DENGAN CONFIRM DIALOG)
  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const executeDelete = async () => {
    setShowConfirm(false);
    const { error } = await supabase.from('orders').delete().eq('id', deleteId);
    if (!error) {
      toast.success("Data berhasil dihapus permanen");
      fetchOrders();
    } else {
      toast.error("Gagal menghapus (Cek Permission RLS): " + error.message);
    }
  };

  // 5. BUKA MODAL EDIT
  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditFormData({
      ...order.event_details,
      groom_name: order.groom_name, 
      bride_name: order.bride_name,
      wedding_date: order.wedding_date,
      payment_status: order.payment_status,
      gallery: order.event_details?.gallery || [],
      banks: order.event_details?.banks || [] 
    });
    setActiveTab('data');
  };

  // 6. SIMPAN PERUBAHAN
  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    // Pisahkan data kolom tabel & JSON
    const { groom_name, bride_name, wedding_date, payment_status, ...eventDetailsJSON } = editFormData;

    const { error } = await supabase
      .from('orders')
      .update({
        groom_name,
        bride_name,
        wedding_date,
        payment_status,
        event_details: eventDetailsJSON
      })
      .eq('id', editingOrder.id);

    if (!error) {
      toast.success("Data berhasil disimpan!");
      setEditingOrder(null);
      fetchOrders();
    } else {
      toast.error("Gagal update: " + error.message);
    }
  };

  const handleInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // --- LOGIC BANK / GIFT ---
  const addAdminBank = () => {
    setEditFormData(prev => ({
      ...prev,
      banks: [...(prev.banks || []), { bank: '', number: '', name: '' }]
    }));
  };

  const updateAdminBank = (index, field, value) => {
    const newBanks = [...(editFormData.banks || [])];
    newBanks[index][field] = value;
    setEditFormData(prev => ({ ...prev, banks: newBanks }));
  };

  const removeAdminBank = (index) => {
    const newBanks = [...(editFormData.banks || [])];
    newBanks.splice(index, 1);
    setEditFormData(prev => ({ ...prev, banks: newBanks }));
  };

  // --- LOGIC GAMBAR ---
  const handleAdminUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${editingOrder.id}/ADMIN_${fieldName}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        setEditFormData(prev => ({ ...prev, [fieldName]: data.publicUrl }));
        toast.success("Foto berhasil diupload.");
    } catch (err) { toast.error("Upload Gagal: " + err.message); } finally { setUploading(false); }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${editingOrder.id}/GALLERY_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        setEditFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), data.publicUrl] }));
        toast.success("Foto galeri ditambahkan");
    } catch (err) { toast.error("Gagal upload galeri: " + err.message); } finally { setUploading(false); }
  };

  const removeGalleryItem = (index) => {
      setEditFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  const calculateDuration = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  }; 

  // --- LOGIN VIEW ---
  if (!session) {
    return (
      <div className="min-h-screen bg-[#FFD5AF] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border-2 border-[#712E1E] text-center">
          <div className="bg-[#712E1E] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
             <ShieldCheck className="w-8 h-8 text-[#FFD5AF]" />
          </div>
          <h1 className="text-2xl font-bold text-[#712E1E] mb-2">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required placeholder="admin@nikahyuk.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#712E1E] outline-none" />
            <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:border-[#712E1E] outline-none" />
            <button disabled={loginLoading} className="w-full bg-[#E59A59] text-white py-3 rounded-xl font-bold hover:bg-[#d48b4b] transition flex justify-center shadow-lg">{loginLoading ? <Loader2 className="animate-spin" /> : "Masuk Dashboard"}</button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* Header */}
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
                      {order.payment_status === 'success' ? (
                        <span className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-green-100"><CheckCircle className="w-3 h-3" /> Lunas</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold w-fit border border-red-100"><XCircle className="w-3 h-3" /> {order.payment_status}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        {/* 1. Preview */}
                        <a href={`/wedding/${order.slug}`} target="_blank" rel="noreferrer" className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100 transition border border-green-200" title="Lihat Website">
                          <Eye className="w-4 h-4" />
                        </a>
                        
                        {/* 2. WhatsApp (Menggunakan Icon MessageCircle Hijau) */}
                        {order.whatsapp && (
                          <a 
                            href={`https://wa.me/${order.whatsapp.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-emerald-50 text-emerald-600 p-2 rounded-lg hover:bg-emerald-100 transition border border-emerald-200" 
                            title="Chat WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                          </a>
                        )}

                        {/* 3. Edit */}
                        <button onClick={() => openEditModal(order)} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition border border-blue-200" title="Edit Full Data"><Edit className="w-4 h-4" /></button>
                        
                        {/* 4. Delete */}
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

      {/* --- CONFIRM DIALOG (CUSTOM) --- */}
      <ConfirmDialog 
        isOpen={showConfirm}
        title="Hapus Data Permanen?"
        message="Data undangan ini akan dihapus selamanya dari database. Akses link undangan akan hilang. Lanjutkan?"
        isDanger={true}
        onCancel={() => setShowConfirm(false)}
        onConfirm={executeDelete}
      />

      {/* --- MODAL SUPER EDIT --- */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden transform transition-all scale-100">
            
            <div className="bg-[#712E1E] p-4 px-6 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-lg"><Edit className="w-5 h-5"/></div><div><h2 className="text-lg font-bold leading-tight">Edit Data Klien</h2><p className="text-xs opacity-80 font-mono">ID: {editingOrder.id}</p></div></div>
              <button onClick={() => setEditingOrder(null)} className="hover:bg-white/20 p-2 rounded-full transition"><X className="w-6 h-6"/></button>
            </div>

            <div className="flex border-b bg-gray-50 shrink-0 overflow-x-auto">
               <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={<User className="w-4 h-4"/>} label="Data Utama" />
               <TabButton active={activeTab === 'photo'} onClick={() => setActiveTab('photo')} icon={<ImageIcon className="w-4 h-4"/>} label="Foto" />
               <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')} icon={<Grid className="w-4 h-4"/>} label="Galeri" />
               <TabButton active={activeTab === 'gift'} onClick={() => setActiveTab('gift')} icon={<Gift className="w-4 h-4"/>} label="Amplop & Gift" />
               <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<MapPin className="w-4 h-4"/>} label="Acara & Lokasi" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white relative">
               <form id="editForm" onSubmit={handleSaveUpdate} className="space-y-6">
                  
                  {/* DATA UTAMA */}
                  {activeTab === 'data' && (
                    <div className="space-y-5 animate-fade-in">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <InputGroup label="Mempelai Pria" name="groom_name" val={editFormData.groom_name} onChange={handleInputChange} />
                          <InputGroup label="Mempelai Wanita" name="bride_name" val={editFormData.bride_name} onChange={handleInputChange} />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <InputGroup label="Ortu Pria" name="groom_parents" val={editFormData.groom_parents} onChange={handleInputChange} />
                          <InputGroup label="Ortu Wanita" name="bride_parents" val={editFormData.bride_parents} onChange={handleInputChange} />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t">
                          <InputGroup label="Tanggal Pernikahan" name="wedding_date" type="date" val={editFormData.wedding_date} onChange={handleInputChange} />
                          <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Status Pembayaran</label><select name="payment_status" value={editFormData.payment_status} onChange={handleInputChange} className="w-full border p-3 rounded-xl bg-yellow-50 font-bold text-[#712E1E] focus:ring-2 focus:ring-[#E59A59] outline-none"><option value="pending">Pending</option><option value="success">Success (Lunas)</option><option value="failed">Failed</option></select></div>
                       </div>
                    </div>
                  )}

                  {/* FOTO UTAMA */}
                  {activeTab === 'photo' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {['groom_photo', 'bride_photo', 'cover_photo'].map((field) => (
                               <div key={field} className="text-center p-4 border rounded-xl bg-gray-50">
                                  <p className="text-xs font-bold mb-3 uppercase text-gray-500">{field.replace('_photo', '')}</p>
                                  <img src={editFormData[field] || "https://via.placeholder.com/150"} className="w-full h-32 object-cover rounded-lg mx-auto mb-3 border-4 border-white shadow-md bg-gray-200"/>
                                  <input type="file" className="text-xs w-full" disabled={uploading} onChange={(e) => handleAdminUpload(e, field)} />
                               </div>
                           ))}
                        </div>
                    </div>
                  )}

                  {/* GALERI */}
                  {activeTab === 'gallery' && (
                    <div className="space-y-6 animate-fade-in">
                       <div className="border-2 border-dashed border-[#E59A59]/50 bg-[#FFF0E0]/30 rounded-xl p-6 text-center hover:bg-[#FFF0E0] transition">
                          <label className="cursor-pointer block">
                             <PlusCircle className="w-8 h-8 text-[#E59A59] mx-auto mb-2" />
                             <span className="text-sm font-bold text-[#712E1E]">{uploading ? 'Mengupload...' : 'Tambah Foto Galeri'}</span>
                             <input type="file" className="hidden" disabled={uploading} onChange={handleGalleryUpload} />
                          </label>
                       </div>
                       <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                          {editFormData.gallery && editFormData.gallery.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100">
                                   <img src={url} className="w-full h-full object-cover" />
                                   <button type="button" onClick={() => removeGalleryItem(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"><X className="w-3 h-3" /></button>
                                </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* GIFT / BANK */}
                  {activeTab === 'gift' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-[#712E1E]">Daftar Rekening & E-Wallet</h3>
                            <button type="button" onClick={addAdminBank} className="text-xs bg-black text-white px-3 py-2 rounded-lg flex items-center gap-1">+ Tambah</button>
                        </div>
                        
                        {(!editFormData.banks || editFormData.banks.length === 0) && <p className="text-center text-gray-400 text-sm">Belum ada rekening.</p>}

                        <div className="space-y-4">
                            {editFormData.banks && editFormData.banks.map((bank, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-xl border relative group">
                                    <button type="button" onClick={() => removeAdminBank(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4"/></button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div><label className="text-[10px] text-gray-400 uppercase font-bold">Nama Bank/Dompet</label><input value={bank.bank} onChange={(e) => updateAdminBank(idx, 'bank', e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="BCA / DANA"/></div>
                                        <div><label className="text-[10px] text-gray-400 uppercase font-bold">Nomor Rekening</label><input value={bank.number} onChange={(e) => updateAdminBank(idx, 'number', e.target.value)} className="w-full border p-2 rounded text-sm font-mono" placeholder="123xxxxx"/></div>
                                        <div><label className="text-[10px] text-gray-400 uppercase font-bold">Atas Nama</label><input value={bank.name} onChange={(e) => updateAdminBank(idx, 'name', e.target.value)} className="w-full border p-2 rounded text-sm" placeholder="Nama Pemilik"/></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  {/* ACARA & LOKASI */}
                  {activeTab === 'details' && (
                     <div className="space-y-5 animate-fade-in">
                        <InputGroup label="Nama Gedung / Hotel" name="venue_name" val={editFormData.venue_name} onChange={handleInputChange} />
                        <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Alamat Lengkap</label><textarea name="venue_address" value={editFormData.venue_address || ''} onChange={handleInputChange} className="w-full border p-3 rounded-xl h-24 focus:ring-2 focus:ring-[#E59A59] outline-none" placeholder="Jl. Sudirman No..."></textarea></div>
                        <InputGroup label="Link Google Maps" name="maps_link" val={editFormData.maps_link} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-5 pt-2 border-t">
                           <InputGroup label="Waktu Akad" name="akad_time" val={editFormData.akad_time} onChange={handleInputChange} placeholder="08:00 WIB" />
                           <InputGroup label="Waktu Resepsi" name="resepsi_time" val={editFormData.resepsi_time} onChange={handleInputChange} placeholder="11:00 WIB" />
                        </div>
                     </div>
                  )}

               </form>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3 shrink-0">
               <button onClick={() => setEditingOrder(null)} className="px-6 py-3 rounded-xl bg-white border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition">Batal</button>
               <button type="submit" form="editForm" className="px-8 py-3 rounded-xl bg-[#E59A59] font-bold text-white hover:bg-[#d48b4b] transition flex items-center gap-2 shadow-lg"><Save className="w-4 h-4" /> Simpan Perubahan</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

function InputGroup({ label, name, val, onChange, type="text", placeholder="" }) {
  return (
    <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{label}</label><input type={type} name={name} value={val || ''} onChange={onChange} placeholder={placeholder} className="w-full border p-3 rounded-xl outline-none focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 transition" /></div>
  )
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button type="button" onClick={onClick} className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${active ? 'border-[#712E1E] text-[#712E1E] bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{icon} {label}</button>
  )
}