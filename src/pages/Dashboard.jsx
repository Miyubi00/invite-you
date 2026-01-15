import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/GlobalToast'; // 1. Import Toast Hook
import ConfirmDialog from '../components/ConfirmDialog'; // 2. Import Confirm Dialog
import { 
  Camera, MapPin, Clock, Users, CreditCard, Image as ImageIcon, 
  Share2, Save, Trash2, PlusCircle, Link as LinkIcon, MessageSquare, Video
} from 'lucide-react';

export default function Dashboard() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const toast = useToast(); // 3. Init Toast

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('share'); 
  
  // State untuk Dialog Konfirmasi
  const [confirmData, setConfirmData] = useState({ show: false, action: null, message: '' });

  // State Data Form
  const [formData, setFormData] = useState({
    venue_name: '', venue_address: '', maps_link: '',
    akad_time: '', resepsi_time: '',
    groom_parents: '', bride_parents: '',
    groom_photo: '', bride_photo: '', cover_photo: '',
    gallery: [], 
    banks: [],
  });

  const [guestName, setGuestName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  // 1. PROTEKSI SESSION & FETCH DATA
  useEffect(() => {
    const sessionID = sessionStorage.getItem('active_order_id');
    if (!sessionID || sessionID !== orderId) {
        toast.warning("Sesi berakhir. Silakan login kembali."); // Ganti Alert
        navigate('/login');
        return;
    }

    const fetchOrder = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (data) {
        setOrder(data);
        if (data.event_details) {
          setFormData(prev => ({ 
            ...prev, 
            ...data.event_details,
            gallery: data.event_details.gallery || [],
            banks: data.event_details.banks || []
          }));
        }
      } else {
          toast.error("Data tidak ditemukan.");
      }
    };
    fetchOrder();
  }, [orderId, navigate]);

  // --- UPLOAD HANDLER ---
  const handleFileUpload = async (e, fieldName, isGallery = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${orderId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, data.publicUrl] }));
        toast.success('Foto berhasil ditambahkan!'); // Toast Sukses
      } else {
        setFormData(prev => ({ ...prev, [fieldName]: data.publicUrl }));
        toast.success(`Foto berhasil diupload!`); // Toast Sukses
      }
    } catch (error) {
      toast.error('Gagal upload: ' + error.message); // Toast Error
    } finally {
      setUploading(false);
    }
  };

  // --- CONFIRMATION HANDLERS (Ganti window.confirm) ---
  const requestRemoveGallery = (index) => {
      setConfirmData({
          show: true,
          message: "Apakah Anda yakin ingin menghapus foto ini dari galeri?",
          action: () => {
              const newGallery = [...formData.gallery];
              newGallery.splice(index, 1);
              setFormData(prev => ({ ...prev, gallery: newGallery }));
              setConfirmData({ show: false, action: null, message: '' }); // Tutup Dialog
              toast.success("Foto galeri dihapus.");
          }
      });
  };

  const requestRemoveBank = (index) => {
      setConfirmData({
          show: true,
          message: "Hapus rekening ini dari daftar?",
          action: () => {
              const newBanks = [...formData.banks];
              newBanks.splice(index, 1);
              setFormData(prev => ({ ...prev, banks: newBanks }));
              setConfirmData({ show: false, action: null, message: '' }); // Tutup Dialog
              toast.success("Rekening dihapus.");
          }
      });
  };

  // --- LOGIC TAMBAH/EDIT REKENING ---
  const addBank = () => {
    setFormData(prev => ({ ...prev, banks: [...prev.banks, { bank: '', number: '', name: '' }] }));
  };

  const updateBank = (index, field, value) => {
    const newBanks = [...formData.banks];
    newBanks[index][field] = value;
    setFormData(prev => ({ ...prev, banks: newBanks }));
  };

  // --- SAVE DATA ---
  const handleSaveData = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('orders').update({ event_details: formData }).eq('id', orderId);
    setLoading(false);
    
    if (!error) {
        toast.success('Data tersimpan!'); // Ganti Alert
    } else {
        toast.error('Gagal menyimpan: ' + error.message); // Ganti Alert
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!order) return;
    const link = `${window.location.origin}/wedding/${order.slug}?to=${encodeURIComponent(guestName)}`;
    setGeneratedLink(link);
    toast.success("Link undangan berhasil dibuat!");
  };

  if (!order) return <div className="p-20 text-center text-gray-500 font-sans">Sedang memuat data...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans pb-20">
      
      {/* MENU TABS */}
      <div className="flex justify-center gap-2 md:gap-4 mb-8 mt-4">
          <button 
            onClick={() => setActiveTab('share')} 
            className={`px-4 md:px-8 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm
              ${activeTab === 'share' ? 'bg-white text-[#712E1E] ring-2 ring-[#712E1E]' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
          >
            <Share2 className="w-4 h-4" /> <span className="hidden md:inline">Sebar</span> Undangan
          </button>
          <button 
            onClick={() => setActiveTab('edit')} 
            className={`px-4 md:px-8 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm
              ${activeTab === 'edit' ? 'bg-white text-[#712E1E] ring-2 ring-[#712E1E]' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
          >
            <Save className="w-4 h-4" /> Edit Data
          </button>
          <a href={`/wedding/${order.slug}`} target="_blank" className="px-6 py-3 rounded-xl text-sm font-bold bg-[#E59A59]/20 text-[#E59A59] hover:bg-[#E59A59]/30 transition flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Lihat Hasil
          </a>
      </div>

      {/* --- TAB 1: SEBAR UNDANGAN --- */}
      {activeTab === 'share' && (
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto text-center animate-fade-in-up">
             <div className="w-16 h-16 bg-[#E59A59]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-[#E59A59]" />
             </div>
             <h2 className="font-bold text-2xl text-gray-800 mb-2">Buat Link Tamu</h2>
             <p className="text-gray-500 mb-8 text-sm max-w-sm mx-auto">Kirim undangan personal dengan menyantumkan nama tamu.</p>
             
             <form onSubmit={handleGenerate} className="flex gap-3 max-w-md mx-auto relative">
               <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Nama Tamu (Cth: Budi & Istri)" className="flex-1 border-2 border-gray-100 p-4 rounded-2xl focus:border-[#E59A59] outline-none transition font-medium text-gray-700"/>
               <button className="bg-[#E59A59] text-white px-6 md:px-8 rounded-2xl font-bold hover:bg-[#d48b4b] transition shadow-lg shadow-orange-200">Buat</button>
             </form>
             
             {generatedLink && (
               <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-xs text-gray-400 mb-2 text-left uppercase font-bold tracking-widest">Link Hasil:</p>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border">
                      <input readOnly value={generatedLink} className="flex-1 text-sm text-gray-600 outline-none bg-transparent px-2" />
                      <button onClick={() => {navigator.clipboard.writeText(generatedLink); toast.success('Link tersalin!')}} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800">Copy</button>
                  </div>
               </div>
             )}
         </div>
      )}

      {/* --- TAB 2: EDIT DATA --- */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveData} className="grid md:grid-cols-12 gap-6 animate-fade-in-up pb-20">
          
          {/* KOLOM KIRI (7 Kolom) */}
          <div className="md:col-span-7 space-y-6">

            {/* 2. LOKASI & WAKTU */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
               <div className="flex items-center gap-3 mb-6 border-b pb-4">
                  <div className="bg-blue-50 p-2 rounded-lg"><MapPin className="w-6 h-6 text-blue-600" /></div>
                  <div>
                    <h2 className="font-bold text-lg text-gray-800">Lokasi & Waktu</h2>
                  </div>
               </div>
               <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-600 mb-1 block">Nama Gedung</label>
                    <input name="venue_name" value={formData.venue_name} onChange={handleChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Cth: Hotel Aston" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600 mb-1 block">Alamat Lengkap</label>
                    <textarea name="venue_address" value={formData.venue_address} onChange={handleChange} className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-100 outline-none transition h-20" placeholder="Jl. Sudirman No. 1..." />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600 mb-1 block">Link Google Maps</label>
                    <div className="flex items-center border rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-3 py-3 text-gray-400 border-r"><LinkIcon className="w-4 h-4"/></div>
                      <input name="maps_link" value={formData.maps_link} onChange={handleChange} className="w-full p-3 outline-none" placeholder="https://maps.google..." />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-gray-600 mb-1 block">Jam Akad</label>
                      <input name="akad_time" value={formData.akad_time} onChange={handleChange} className="w-full border p-3 rounded-xl text-center" placeholder="08:00 WIB" />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-gray-600 mb-1 block">Jam Resepsi</label>
                      <input name="resepsi_time" value={formData.resepsi_time} onChange={handleChange} className="w-full border p-3 rounded-xl text-center" placeholder="11:00 WIB" />
                    </div>
                  </div>
               </div>
            </div>

            {/* 4. KELUARGA & BANK */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
               
               {/* Keluarga */}
               <div>
                   <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-50 p-2 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
                      <h2 className="font-bold text-lg text-gray-800">Data Orang Tua</h2>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="groom_parents" value={formData.groom_parents} onChange={handleChange} className="w-full border p-3 rounded-xl" placeholder="Ortu Pria" />
                      <input name="bride_parents" value={formData.bride_parents} onChange={handleChange} className="w-full border p-3 rounded-xl" placeholder="Ortu Wanita" />
                   </div>
               </div>

               <div className="border-t pt-6"></div>

               {/* Bank */}
               <div>
                   <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <div className="bg-yellow-50 p-2 rounded-lg"><CreditCard className="w-5 h-5 text-yellow-600" /></div>
                        <h2 className="font-bold text-lg text-gray-800">Amplop Digital</h2>
                     </div>
                     <button type="button" onClick={addBank} className="text-xs bg-black text-white px-3 py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-gray-800 transition"><PlusCircle className="w-3 h-3" /> Tambah</button>
                   </div>
                   
                   <div className="space-y-3">
                     {formData.banks.map((bank, idx) => (
                       <div key={idx} className="bg-gray-50 p-4 rounded-xl border relative group">
                          {/* TOMBOL HAPUS MENGGUNAKAN CONFIRM DIALOG */}
                          <button type="button" onClick={() => requestRemoveBank(idx)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4"/></button>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <input value={bank.bank} onChange={(e) => updateBank(idx, 'bank', e.target.value)} className="col-span-1 border p-2 rounded-lg text-sm" placeholder="Bank"/>
                            <input value={bank.number} onChange={(e) => updateBank(idx, 'number', e.target.value)} className="col-span-2 border p-2 rounded-lg text-sm font-mono" placeholder="No. Rek"/>
                            <input value={bank.name} onChange={(e) => updateBank(idx, 'name', e.target.value)} className="col-span-3 border p-2 rounded-lg text-sm" placeholder="A.n"/>
                          </div>
                       </div>
                     ))}
                   </div>
               </div>
            </div>
          </div>

          {/* KOLOM KANAN (5 Kolom - Sticky) */}
          <div className="md:col-span-5 space-y-6">
              
             {/* 5. FOTO UTAMA */}
             <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6 border-b pb-4">
                   <div className="bg-purple-50 p-2 rounded-lg"><Camera className="w-6 h-6 text-purple-600" /></div>
                   <div><h2 className="font-bold text-lg text-gray-800">Foto Utama</h2></div>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                      <div className="flex-1 text-center">
                         <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-2 overflow-hidden border">
                            {formData.groom_photo ? <img src={formData.groom_photo} className="w-full h-full object-cover"/> : <UserPlaceholder/>}
                         </div>
                         <label className="text-xs font-bold text-purple-600 cursor-pointer hover:underline">
                            Upload Pria <input type="file" onChange={(e) => handleFileUpload(e, 'groom_photo')} className="hidden" disabled={uploading} />
                         </label>
                      </div>
                      <div className="flex-1 text-center">
                         <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-2 overflow-hidden border">
                            {formData.bride_photo ? <img src={formData.bride_photo} className="w-full h-full object-cover"/> : <UserPlaceholder/>}
                         </div>
                         <label className="text-xs font-bold text-purple-600 cursor-pointer hover:underline">
                            Upload Wanita <input type="file" onChange={(e) => handleFileUpload(e, 'bride_photo')} className="hidden" disabled={uploading} />
                         </label>
                      </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block">Cover Undangan</label>
                    <div className="relative w-full h-32 bg-gray-100 rounded-xl overflow-hidden border border-dashed flex items-center justify-center group">
                        {formData.cover_photo ? <img src={formData.cover_photo} className="w-full h-full object-cover"/> : <span className="text-xs text-gray-400">Belum ada cover</span>}
                        <input type="file" onChange={(e) => handleFileUpload(e, 'cover_photo')} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                    </div>
                  </div>
                </div>
             </div>

             {/* 6. GALERI */}
             <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                   <div className="flex items-center gap-3">
                        <div className="bg-pink-50 p-2 rounded-lg"><ImageIcon className="w-6 h-6 text-pink-600" /></div>
                        <div><h2 className="font-bold text-lg text-gray-800">Galeri</h2></div>
                   </div>
                </div>
                <label className="w-full h-16 border-2 border-dashed border-pink-200 rounded-xl bg-pink-50 hover:bg-pink-100 transition flex flex-col items-center justify-center cursor-pointer mb-4">
                    <span className="text-pink-600 font-bold text-xs flex items-center gap-2"><PlusCircle className="w-4 h-4"/> Tambah Foto</span>
                    <input type="file" onChange={(e) => handleFileUpload(e, null, true)} className="hidden" disabled={uploading} />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {formData.gallery.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img src={url} className="w-full h-full object-cover" />
                      {/* TOMBOL HAPUS MENGGUNAKAN CONFIRM DIALOG */}
                      <button type="button" onClick={() => requestRemoveGallery(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          {/* TOMBOL SIMPAN (Sticky) */}
          <div className="md:col-span-12 sticky bottom-6 z-20">
            <button type="submit" disabled={loading || uploading} className="w-full bg-[#E59A59] text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-[#d48b4b] transition transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Menyimpan...' : <><Save className="w-5 h-5" /> SIMPAN PERUBAHAN</>}
            </button>
          </div>

        </form>
      )}

      {/* --- RENDER CONFIRM DIALOG --- */}
      <ConfirmDialog 
        isOpen={confirmData.show}
        title="Konfirmasi Hapus"
        message={confirmData.message}
        isDanger={true}
        onCancel={() => setConfirmData({ show: false, action: null })}
        onConfirm={confirmData.action}
      />

    </div>
  );
}

function UserPlaceholder() {
    return (
        <svg className="w-full h-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}