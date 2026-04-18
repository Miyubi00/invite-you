import { Edit, Save, User, Layout, MapPin, Image as ImageIcon, Grid, Music, Gift, MessageSquare, UploadCloud, PlusCircle, X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { BentoCard, InputGroup } from '../ui/BentoUI';

export default function EditOrderModal({ 
    editingOrder, setEditingOrder, editFormData, setEditFormData, rsvps, setRsvps, 
    templates, uploading, setUploading, fetchData, confirmAction, toast 
}) {

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
        fetchData(); 
    } else {
        toast.error("Gagal update: " + error.message);
    }
  };

  const handleInputChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  // Logic Upload & Utils
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

  const handleDeleteRsvp = (rsvpId) => {
    confirmAction("Hapus Komentar?", "Komentar dari tamu ini akan dihapus permanen.", true,
      async () => {
        const { error } = await supabase.from('rsvps').delete().eq('id', rsvpId);
        if(!error) { setRsvps(prev => prev.filter(r => r.id !== rsvpId)); toast.success("Komentar dihapus"); } 
        else toast.error("Gagal hapus komentar");
      }
    );
  };

  return (
    // Tambahkan z-50 agar modal ini benar-benar menutupi seluruh halaman admin
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-[#F3F4F6] rounded-3xl shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden relative">
        
        {/* Header Modal */}
        <div className="bg-white p-4 px-6 flex justify-between items-center shrink-0 border-b z-10 shadow-sm">
          <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-xl hidden sm:block"><Edit className="w-5 h-5"/></div>
              <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-800">Edit Undangan</h2>
                  <p className="text-[10px] md:text-xs text-gray-500 font-mono">ID: {editingOrder.id.slice(0,12)}...</p>
              </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
              <button onClick={() => setEditingOrder(null)} className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-100 transition">Batal</button>
              <button onClick={handleSaveUpdate} className="px-4 sm:px-6 py-2 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center gap-2"><Save className="w-4 h-4"/> Simpan</button>
          </div>
        </div>

        {/* Konten Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll">
            <form id="editForm" className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
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
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Status Pembayaran</label>
                            <select name="payment_status" value={editFormData.payment_status} onChange={handleInputChange} className="w-full border p-2.5 rounded-lg bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                <option value="pending">Pending</option>
                                <option value="success">Success (Lunas)</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard title="Pengaturan Sistem" icon={<Layout className="text-indigo-500"/>} colSpan="md:col-span-4">
                    <div className="space-y-5">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <label className="block text-[10px] font-bold text-indigo-800 mb-2 uppercase tracking-wider flex items-center gap-1"><Grid className="w-3 h-3"/> Ganti Tema Undangan</label>
                            <select 
                                name="template_slug" value={editFormData.template_slug} onChange={handleInputChange} 
                                className="w-full border border-indigo-200 p-2.5 rounded-lg bg-white font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                            >
                                {templates.map((tpl) => (
                                    <option key={tpl.slug} value={tpl.slug}>{tpl.name} ({tpl.category})</option>
                                ))}
                            </select>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                            <InputGroup label="Custom Link URL (Slug)" name="slug" val={editFormData.slug} onChange={handleInputChange} placeholder="misal: romeo-juliet" />
                            <p className="text-[10px] text-yellow-700 italic mt-2 leading-relaxed">
                                *Hati-hati! Mengubah slug akan membuat link undangan lama menjadi tidak bisa diakses tamu.
                            </p>
                        </div>
                    </div>
                </BentoCard>

                <BentoCard title="Lokasi & Acara" icon={<MapPin className="text-red-500"/>} colSpan="md:col-span-6">
                    <div className="space-y-4">
                        <InputGroup label="Nama Gedung / Tempat" name="venue_name" val={editFormData.venue_name} onChange={handleInputChange} />
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Alamat Lengkap</label>
                            <textarea name="venue_address" value={editFormData.venue_address || ''} onChange={handleInputChange} className="w-full border p-3 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Jalan Sudirman No.123..."></textarea>
                        </div>
                        <InputGroup label="Link Google Maps" name="maps_link" val={editFormData.maps_link} onChange={handleInputChange} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="Jam Akad" name="akad_time" val={editFormData.akad_time} onChange={handleInputChange} placeholder="08:00 WIB" />
                            <InputGroup label="Jam Resepsi" name="resepsi_time" val={editFormData.resepsi_time} onChange={handleInputChange} placeholder="11:00 - Selesai" />
                        </div>
                    </div>
                </BentoCard>

                {/* --- UI FOTO UTAMA DIPERBAIKI --- */}
                <BentoCard title="Foto Utama" icon={<ImageIcon className="text-green-500"/>} colSpan="md:col-span-6">
                    <div className="flex flex-wrap md:flex-nowrap justify-around items-center gap-6 pt-4 h-full">
                        
                        {/* Pria */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 border border-dashed border-gray-300 relative overflow-hidden group shadow-sm flex-shrink-0">
                                <img src={editFormData.groom_photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Pria" />
                                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] sm:text-xs">
                                    <UploadCloud className="w-5 h-5 mb-1"/> Ganti
                                    <input type="file" className="hidden" disabled={uploading} onChange={(e) => handleAdminUpload(e, 'groom_photo')} />
                                </label>
                            </div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase text-gray-500">Pria</p>
                        </div>

                        {/* Wanita */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-100 border border-dashed border-gray-300 relative overflow-hidden group shadow-sm flex-shrink-0">
                                <img src={editFormData.bride_photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Wanita" />
                                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] sm:text-xs">
                                    <UploadCloud className="w-5 h-5 mb-1"/> Ganti
                                    <input type="file" className="hidden" disabled={uploading} onChange={(e) => handleAdminUpload(e, 'bride_photo')} />
                                </label>
                            </div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase text-gray-500">Wanita</p>
                        </div>

                        {/* Cover Depan */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-24 h-32 sm:w-28 sm:h-40 rounded-lg bg-gray-100 border border-dashed border-gray-300 relative overflow-hidden group shadow-sm flex-shrink-0">
                                <img src={editFormData.cover_photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" alt="Cover" />
                                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-[10px] sm:text-xs">
                                    <UploadCloud className="w-5 h-5 mb-1"/> Ganti
                                    <input type="file" className="hidden" disabled={uploading} onChange={(e) => handleAdminUpload(e, 'cover_photo')} />
                                </label>
                            </div>
                            <p className="text-[10px] sm:text-xs font-bold uppercase text-gray-500">Cover Depan</p>
                        </div>

                    </div>
                </BentoCard>

                <BentoCard title="Galeri Foto" icon={<Grid className="text-purple-500"/>} colSpan="md:col-span-12">
                    <div className="flex flex-wrap gap-4">
                        <label className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-100 transition text-purple-600 shadow-sm">
                            <PlusCircle className="w-6 h-6 sm:w-8 sm:h-8 mb-2"/> <span className="text-[10px] sm:text-xs font-bold">Tambah</span>
                            <input type="file" className="hidden" disabled={uploading} onChange={handleGalleryUpload} />
                        </label>
                        {editFormData.gallery && editFormData.gallery.map((url, idx) => (
                            <div key={idx} className="w-24 h-24 sm:w-28 sm:h-28 relative group rounded-xl overflow-hidden shadow-sm border border-gray-200">
                                <img src={url} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeGalleryItem(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700 shadow-md"><X className="w-3 h-3" /></button>
                            </div>
                        ))}
                    </div>
                </BentoCard>

                <BentoCard title="Musik & Kutipan" icon={<Music className="text-blue-500"/>} colSpan="md:col-span-6">
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-4 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full shadow-sm"><Music className="w-4 h-4 text-blue-500"/></div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-blue-900 truncate">{editFormData.audio_url ? 'Musik Terpasang' : 'Belum ada musik'}</p>
                            <audio controls src={editFormData.audio_url} className="h-7 w-full mt-1 max-w-[200px] text-sm"/>
                        </div>
                        <label className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-blue-700 shadow-sm font-bold">
                            Upload <input type="file" accept="audio/*" onChange={(e) => handleAdminUpload(e, 'audio_url')} className="hidden" disabled={uploading}/>
                        </label>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">Kutipan / Quote</label>
                            <textarea name="quote" value={editFormData.quote || ''} onChange={handleInputChange} className="w-full border p-3 rounded-lg h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tulis kutipan indah di sini..."></textarea>
                        </div>
                        <InputGroup label="Sumber Kutipan" name="quote_src" val={editFormData.quote_src} onChange={handleInputChange} placeholder="Contoh: QS. Ar-Rum" />
                    </div>
                </BentoCard>

                <BentoCard title="Rekening & Gift" icon={<Gift className="text-orange-500"/>} colSpan="md:col-span-6">
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scroll">
                        {(!editFormData.banks || editFormData.banks.length === 0) && <p className="text-center text-gray-400 text-sm py-4 italic">Belum ada rekening.</p>}
                        {editFormData.banks && editFormData.banks.map((bank, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-200 p-3 rounded-xl relative group hover:border-orange-300 transition">
                                <button type="button" onClick={() => removeAdminBank(idx)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition"><Trash2 className="w-4 h-4"/></button>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:pr-6">
                                    <input value={bank.bank} onChange={(e) => updateAdminBank(idx, 'bank', e.target.value)} className="border-b border-dashed border-gray-300 bg-transparent p-1 text-sm outline-none font-bold text-gray-700 focus:border-orange-400" placeholder="Bank (BCA)"/>
                                    <input value={bank.number} onChange={(e) => updateAdminBank(idx, 'number', e.target.value)} className="border-b border-dashed border-gray-300 bg-transparent p-1 text-sm outline-none font-mono focus:border-orange-400" placeholder="No. Rek"/>
                                    <input value={bank.name} onChange={(e) => updateAdminBank(idx, 'name', e.target.value)} className="border-b border-dashed border-gray-300 bg-transparent p-1 text-sm outline-none focus:border-orange-400" placeholder="Atas Nama"/>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addAdminBank} className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-dashed border-gray-300 flex items-center justify-center gap-2 transition shadow-sm">+ Tambah Rekening</button>
                    </div>
                </BentoCard>

                <BentoCard title="Buku Tamu / Komentar" icon={<MessageSquare className="text-teal-500"/>} colSpan="md:col-span-12">
                    {rsvps.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-6 italic">Belum ada komentar masuk dari tamu.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rsvps.map((rsvp) => (
                                <div key={rsvp.id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition relative group">
                                    <button 
                                        type="button" onClick={() => handleDeleteRsvp(rsvp.id)} 
                                        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition" title="Hapus Komentar"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                    <div className="flex items-center gap-2 mb-2 pr-6">
                                        <h4 className="font-bold text-gray-800 text-sm truncate">{rsvp.guest_name}</h4>
                                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${rsvp.status === 'hadir' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {rsvp.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 italic bg-gray-50 border border-gray-100 p-2.5 rounded-lg mb-2 line-clamp-3">"{rsvp.message}"</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{new Date(rsvp.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </BentoCard>

            </form>
        </div>
      </div>
    </div>
  );
}