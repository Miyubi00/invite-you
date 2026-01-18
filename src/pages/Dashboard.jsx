import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/GlobalToast';
import ConfirmDialog from '../components/ConfirmDialog';
import { BASIC_TEMPLATES_SLUGS } from '../lib/constants'; // Import ini
import * as XLSX from 'xlsx'; // Import library Excel
import {
    Camera, MapPin, Users, CreditCard, Image as ImageIcon,
    Share2, Save, Trash2, Link as LinkIcon,
    MessageSquare, Download, Send, Music, Quote, Loader2, ExternalLink,
    CheckCircle2, FileSpreadsheet, Copy, Phone
} from 'lucide-react';

export default function Dashboard() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('share');

    // State Dialog & RSVP
    const [confirmData, setConfirmData] = useState({ show: false, action: null, message: '' });
    const [rsvps, setRsvps] = useState([]);
    const [replyText, setReplyText] = useState({});

    // State Share Link (NEW)
    const [shareMode, setShareMode] = useState('manual'); // 'manual' | 'excel'
    const [guestName, setGuestName] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [excelGuests, setExcelGuests] = useState([]); // Menyimpan daftar tamu dari Excel

    const [formData, setFormData] = useState({
        venue_name: '', venue_address: '', maps_link: '',
        akad_time: '', resepsi_time: '',
        groom_parents: '', bride_parents: '',
        groom_photo: '', bride_photo: '', cover_photo: '',
        gallery: [], banks: [],
        audio_url: '', quote: '', quote_src: ''
    });

    // 1. FETCH DATA
    useEffect(() => {
        const sessionID = sessionStorage.getItem('active_order_id');
        if (!sessionID || sessionID !== orderId) {
            toast.warning("Sesi berakhir. Silakan login kembali.");
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            const { data: orderData, error } = await supabase.from('orders').select('*').eq('id', orderId).single();

            if (orderData) {
                setOrder(orderData);
                setFormData(prev => ({
                    ...prev,
                    ...orderData.event_details,
                    gallery: orderData.event_details?.gallery || [],
                    banks: orderData.event_details?.banks || []
                }));

                const { data: rsvpData } = await supabase
                    .from('rsvps')
                    .select('*')
                    .eq('order_id', orderId)
                    .order('created_at', { ascending: false });

                if (rsvpData) setRsvps(rsvpData);
            } else {
                toast.error("Data tidak ditemukan.");
            }
            setDataLoading(false);
        };

        fetchData();
    }, [orderId, navigate]);

    // --- LOGIC SHARE LINK & EXCEL (NEW) ---

    // Fungsi Generate Pesan WhatsApp
    const generateWaMessage = (name, link) => {
        return `Kepada Yth.
Bapak/Ibu/Saudara/i
*${name}*

_Assalamualaikum Warahmatullahi Wabarakaatuh_

Dengan memohon rahmat dan ridho Allah SWT, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami :

🧕🏻 *${order.bride_name}*
dengan
🤵🏻 *${order.groom_name}*

*Untuk informasi detail mengenai acara, silahkan kunjungi link dibawah ini :*
${link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.
Atas kehadiran dan doa restunya kami ucapkan terima kasih.
_Wassalamualaikum Warahmatullahi Wabarakaatuh_

Hormat kami,
*${order.bride_name} & ${order.groom_name}*`;
    };

    const handleShareWa = (name) => {
        const link = `${window.location.origin}/wedding/${order.slug}?to=${encodeURIComponent(name)}`;
        const message = generateWaMessage(name, link);
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const handleGenerateManual = (e) => {
        e.preventDefault();
        if (!guestName) return;
        const link = `${window.location.origin}/wedding/${order.slug}?to=${encodeURIComponent(guestName)}`;
        setGeneratedLink(link);
        toast.success("Link berhasil dibuat!");
    };

    // --- SMART EXCEL/CSV PARSER ---
    const handleFileUploadExcel = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            // Ambil Sheet pertama
            const wsname = workbook.SheetNames[0];
            const ws = workbook.Sheets[wsname];

            // Konversi ke Array of Arrays (Baris demi baris)
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (jsonData.length === 0) {
                toast.error("File kosong!");
                return;
            }

            let targetColIndex = -1;
            let startRowIndex = 0;

            // Kata kunci untuk deteksi otomatis (Case Insensitive)
            const keywords = ['nama', 'name', 'tamu', 'guest', 'invite', 'kepada', 'yth'];

            // 1. Cari Header di 5 baris pertama
            // Kita batasi pencarian agar tidak terlalu berat jika file sangat besar
            for (let r = 0; r < Math.min(jsonData.length, 5); r++) {
                const row = jsonData[r];
                for (let c = 0; c < row.length; c++) {
                    const cellValue = String(row[c]).toLowerCase().trim();
                    if (keywords.some(key => cellValue.includes(key))) {
                        targetColIndex = c;
                        startRowIndex = r + 1; // Data dimulai setelah header
                        console.log(`Header ditemukan di Baris ${r + 1}, Kolom ${c + 1}: ${row[c]}`);
                        break;
                    }
                }
                if (targetColIndex !== -1) break;
            }

            // 2. Fallback: Jika tidak ada header, ambil kolom pertama yang ada isinya
            if (targetColIndex === -1) {
                targetColIndex = 0;
                startRowIndex = 0;
                console.log("Header tidak ditemukan, menggunakan Kolom A (Index 0)");
            }

            // 3. Ekstrak Data Nama
            const guests = [];
            for (let i = startRowIndex; i < jsonData.length; i++) {
                const row = jsonData[i];
                // Pastikan kolom tersebut ada datanya
                if (row[targetColIndex]) {
                    const rawName = String(row[targetColIndex]).trim();
                    // Filter nama yang valid (bukan kosong, bukan header ulang)
                    if (rawName && rawName.length > 1 && !keywords.includes(rawName.toLowerCase())) {
                        guests.push(rawName);
                    }
                }
            }

            if (guests.length > 0) {
                setExcelGuests(guests);
                toast.success(`Berhasil memuat ${guests.length} tamu!`);
            } else {
                toast.error("Tidak ditemukan data nama tamu yang valid.");
            }
        };

        reader.readAsBinaryString(file);
    };

    const copyLink = (name) => {
        const link = `${window.location.origin}/wedding/${order.slug}?to=${encodeURIComponent(name)}`;
        navigator.clipboard.writeText(link);
        toast.success(`Link untuk ${name} disalin!`);
    };

    // --- LOGIC LAINNYA (SAMA SEPERTI SEBELUMNYA) ---
    const handleReply = async (rsvpId) => { /* ... existing logic ... */
        const message = replyText[rsvpId];
        if (!message) return toast.warning("Tulis balasan dulu.");
        const { error } = await supabase.from('rsvps').update({ reply: message }).eq('id', rsvpId);
        if (!error) {
            toast.success("Balasan terkirim!");
            setRsvps(prev => prev.map(r => r.id === rsvpId ? { ...r, reply: message } : r));
            setReplyText(prev => ({ ...prev, [rsvpId]: '' }));
        } else toast.error("Gagal membalas.");
    };

    const downloadCSV = () => { /* ... existing logic ... */
        if (rsvps.length === 0) return toast.warning("Belum ada data.");
        const headers = ["Nama Tamu", "Status", "Jumlah", "Pesan", "Waktu"];
        const rows = rsvps.map(r => [`"${r.guest_name}"`, r.status, r.pax, `"${r.message || '-'}"`, new Date(r.created_at).toLocaleDateString('id-ID')]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `Buku_Tamu.csv`); document.body.appendChild(link); link.click();
    };

    const handleFileUpload = async (e, fieldName, isGallery = false) => { /* ... existing logic ... */
        const file = e.target.files[0]; if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("Ukuran file maksimal 5MB");
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const prefix = isGallery ? 'GALLERY_' : fieldName === 'audio_url' ? 'AUDIO_' : 'IMG_';
            const filePath = `${orderId}/${prefix}${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage.from('images').upload(filePath, file); if (error) throw error;
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            if (isGallery) { setFormData(prev => ({ ...prev, gallery: [...prev.gallery, data.publicUrl] })); toast.success('Foto ditambahkan!'); }
            else { setFormData(prev => ({ ...prev, [fieldName]: data.publicUrl })); toast.success('Upload berhasil!'); }
        } catch (error) { toast.error('Gagal upload.'); } finally { setUploading(false); }
    };

    const requestRemoveGallery = (index) => { /* ... existing logic ... */
        setConfirmData({
            show: true, message: "Hapus foto ini?", action: () => {
                const newGallery = [...formData.gallery]; newGallery.splice(index, 1);
                setFormData(prev => ({ ...prev, gallery: newGallery })); setConfirmData({ show: false }); toast.success("Dihapus.");
            }
        });
    };
    // --- LOGIC DELETE RSVP ---
    const handleDeleteRsvp = async (rsvpId) => {
        // Kita pakai window.confirm sederhana agar cepat, atau bisa pakai ConfirmDialog custom jika mau
        if (!window.confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;

        const { error } = await supabase
            .from('rsvps')
            .delete()
            .eq('id', rsvpId);

        if (!error) {
            toast.success("Pesan berhasil dihapus.");
            // Update state lokal untuk menghapus item dari tampilan tanpa reload
            setRsvps(prev => prev.filter(item => item.id !== rsvpId));
        } else {
            toast.error("Gagal menghapus pesan: " + error.message);
        }
    };

    const requestRemoveBank = (index) => { /* ... existing logic ... */
        setConfirmData({
            show: true, message: "Hapus rekening ini?", action: () => {
                const newBanks = [...formData.banks]; newBanks.splice(index, 1);
                setFormData(prev => ({ ...prev, banks: newBanks })); setConfirmData({ show: false }); toast.success("Dihapus.");
            }
        });
    };

    const addBank = () => setFormData(prev => ({ ...prev, banks: [...prev.banks, { bank: '', number: '', name: '' }] }));
    const updateBank = (index, field, value) => { const newBanks = [...formData.banks]; newBanks[index][field] = value; setFormData(prev => ({ ...prev, banks: newBanks })); };
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSaveData = async (e) => { e.preventDefault(); setLoading(true); const { error } = await supabase.from('orders').update({ event_details: formData }).eq('id', orderId); setLoading(false); error ? toast.error('Gagal') : toast.success('Tersimpan!'); };

    // --- RENDER ---
    if (dataLoading) return <div className="h-screen flex items-center justify-center text-gray-500 font-sans"><Loader2 className="animate-spin w-8 h-8 mr-2" /> Memuat data...</div>;
    if (!order) return <div className="p-20 text-center text-red-500 font-sans">Data Order Tidak Ditemukan.</div>;

    const isBasic = BASIC_TEMPLATES_SLUGS.includes(order.template_slug);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans pb-24 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard Mempelai</h1>
                    <p className="text-gray-500 text-sm">Kelola undangan pernikahan <strong>{order.groom_name} & {order.bride_name}</strong></p>
                    {isBasic && <span className="mt-2 inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Paket Basic</span>}
                </div>
                <div className="mt-4 md:mt-0">
                    <a href={`/wedding/${order.slug}`} target="_blank" className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100 transition">
                        <ExternalLink size={16} /> Lihat Undangan
                    </a>
                </div>
            </div>

            {/* TABS */}
            <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
                <button onClick={() => setActiveTab('share')} className={`px-6 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm border ${activeTab === 'share' ? 'bg-[#712E1E] text-white border-[#712E1E]' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    <Share2 className="w-4 h-4" /> Sebar Undangan
                </button>
                <button onClick={() => setActiveTab('edit')} className={`px-6 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm border ${activeTab === 'edit' ? 'bg-[#712E1E] text-white border-[#712E1E]' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    <Save className="w-4 h-4" /> Edit Konten
                </button>

                {!isBasic && (
                    <button onClick={() => setActiveTab('rsvp')} className={`px-6 py-3 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-sm border ${activeTab === 'rsvp' ? 'bg-[#712E1E] text-white border-[#712E1E]' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                        <MessageSquare className="w-4 h-4" /> Buku Tamu
                        {rsvps.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{rsvps.length}</span>}
                    </button>
                )}
            </div>

            {/* --- TAB 1: SEBAR --- */}
            {activeTab === 'share' && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-4xl mx-auto text-center animate-fade-in-up">
                    <div className="flex justify-center gap-4 mb-8 bg-gray-50 p-1 rounded-2xl w-fit mx-auto">
                        <button onClick={() => setShareMode('manual')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${shareMode === 'manual' ? 'bg-white text-[#712E1E] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                            Input Manual
                        </button>
                        <button onClick={() => setShareMode('excel')} className={`px-6 py-2 rounded-xl text-sm font-bold transition ${shareMode === 'excel' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                            Upload Excel
                        </button>
                    </div>

                    {/* MODE MANUAL */}
                    {shareMode === 'manual' && (
                        <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                            <h2 className="font-bold text-2xl text-gray-800 mb-2">Buat Link Satu Per Satu</h2>
                            <p className="text-gray-500 text-sm mb-6">Ketik nama tamu untuk membuat link undangan personal.</p>

                            <form onSubmit={handleGenerateManual} className="flex gap-3 relative mb-6">
                                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Contoh: Budi & Keluarga" className="flex-1 border-2 border-gray-100 p-4 rounded-2xl focus:border-[#E59A59] outline-none transition" />
                                <button className="bg-[#E59A59] hover:bg-[#d48b4b] text-white px-6 rounded-2xl font-bold transition shadow-lg shadow-orange-200">Buat</button>
                            </form>

                            {generatedLink && (
                                <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                                    <p className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-4">Link Berhasil Dibuat!</p>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleShareWa(guestName)} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition">
                                            <Phone size={18} /> Kirim WhatsApp
                                        </button>
                                        <button onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success('Link disalin!') }} className="bg-white border border-gray-200 text-gray-700 px-4 rounded-xl hover:bg-gray-50 transition">
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                    <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 text-left">
                                        <p className="text-xs text-gray-400 mb-1">Preview Link:</p>
                                        <p className="text-sm text-blue-600 truncate">{generatedLink}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MODE EXCEL / CSV */}
                    {shareMode === 'excel' && (
                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-3xl p-8 mb-8">
                                <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h2 className="font-bold text-xl text-gray-800 mb-2">Upload Daftar Tamu</h2>
                                <p className="text-gray-500 text-sm mb-4">
                                    Support file <strong>Excel (.xlsx, .xls)</strong> dan <strong>CSV (.csv)</strong>.<br />
                                    Sistem otomatis mencari kolom "Nama" atau "Tamu".
                                </p>

                                {/* UPDATE DI SINI: Tambahkan .csv di accept */}
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUploadExcel}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 cursor-pointer mx-auto max-w-xs"
                                />
                            </div>

                            {excelGuests.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm text-left">
                                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-700">Daftar Tamu ({excelGuests.length})</h3>
                                        <button onClick={() => setExcelGuests([])} className="text-xs text-red-500 hover:underline">Hapus Semua</button>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                                        {excelGuests.map((name, i) => (
                                            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                                                <span className="font-medium text-gray-800 mr-2 truncate">{name}</span>

                                                {/* BAGIAN INI DIUBAH: Class opacity dihapus agar tombol selalu muncul */}
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={() => copyLink(name)}
                                                        className="p-2 text-gray-500 bg-white border border-gray-200 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Salin Link"
                                                    >
                                                        <Copy size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleShareWa(name)}
                                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
                                                    >
                                                        <Send size={12} /> Kirim WA
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB 2: EDIT DATA (SAMA SEPERTI SEBELUMNYA) --- */}
            {activeTab === 'edit' && (
                <form onSubmit={handleSaveData} className="grid md:grid-cols-12 gap-6 animate-fade-in-up">
                    <div className="md:col-span-7 space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><MapPin className="text-blue-600" /> Lokasi & Waktu</h2>
                            <div className="grid gap-4">
                                <input name="venue_name" value={formData.venue_name} onChange={handleChange} className="w-full border p-3 rounded-xl focus:border-blue-500 outline-none" placeholder="Nama Gedung / Tempat" />
                                <textarea name="venue_address" value={formData.venue_address} onChange={handleChange} className="w-full border p-3 rounded-xl h-24 focus:border-blue-500 outline-none" placeholder="Alamat Lengkap" />
                                <input name="maps_link" value={formData.maps_link} onChange={handleChange} className="w-full border p-3 rounded-xl focus:border-blue-500 outline-none" placeholder="Link Google Maps (https://...)" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 ml-1">Waktu Akad</label><input name="akad_time" value={formData.akad_time} onChange={handleChange} className="w-full border p-3 rounded-xl text-center" placeholder="08:00 WIB" /></div>
                                    <div className="space-y-1"><label className="text-xs font-bold text-gray-500 ml-1">Waktu Resepsi</label><input name="resepsi_time" value={formData.resepsi_time} onChange={handleChange} className="w-full border p-3 rounded-xl text-center" placeholder="11:00 - Selesai" /></div>
                                </div>
                            </div>
                        </div>
                        {/* Keluarga & Rekening (Sama seperti kode sebelumnya, disingkat disini agar tidak terlalu panjang) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2"><Users className="text-green-600" /> Data Keluarga</h2>
                            <div className="space-y-3">
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 ml-1">Orang Tua Pria</label><input name="groom_parents" value={formData.groom_parents} onChange={handleChange} className="w-full border p-3 rounded-xl" placeholder="Bpk. Fulan & Ibu Fulanah" /></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-500 ml-1">Orang Tua Wanita</label><input name="bride_parents" value={formData.bride_parents} onChange={handleChange} className="w-full border p-3 rounded-xl" placeholder="Bpk. Fulan & Ibu Fulanah" /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                            <div className="flex justify-between items-center"><h2 className="font-bold text-lg flex gap-2"><CreditCard className="text-yellow-600" /> Rekening</h2> <button type="button" onClick={addBank} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition">+ Tambah</button></div>
                            {formData.banks.length === 0 && <p className="text-sm text-gray-400 italic">Belum ada data rekening.</p>}
                            {formData.banks.map((bank, idx) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-xl border relative group">
                                    <button type="button" onClick={() => requestRemoveBank(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pr-6">
                                        <input value={bank.bank} onChange={(e) => updateBank(idx, 'bank', e.target.value)} className="border p-2 rounded text-sm outline-none" placeholder="Bank" />
                                        <input value={bank.number} onChange={(e) => updateBank(idx, 'number', e.target.value)} className="border p-2 rounded text-sm outline-none" placeholder="No. Rek" />
                                        <input value={bank.name} onChange={(e) => updateBank(idx, 'name', e.target.value)} className="border p-2 rounded text-sm outline-none" placeholder="A/N" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-5 space-y-6">
                        {/* Foto Utama */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                            <h2 className="font-bold text-lg flex gap-2"><Camera className="text-purple-600" /> Foto Mempelai</h2>
                            <div className="flex gap-4">
                                <div className="flex-1 text-center border rounded-xl p-4 hover:bg-gray-50 transition"><div className="w-20 h-20 mx-auto rounded-full bg-gray-200 overflow-hidden mb-2"><img src={formData.groom_photo || "https://via.placeholder.com/100"} className="w-full h-full object-cover" /></div><label className="block text-xs font-bold text-purple-600 cursor-pointer hover:underline">Upload Pria <input type="file" onChange={(e) => handleFileUpload(e, 'groom_photo')} className="hidden" disabled={uploading} /></label></div>
                                <div className="flex-1 text-center border rounded-xl p-4 hover:bg-gray-50 transition"><div className="w-20 h-20 mx-auto rounded-full bg-gray-200 overflow-hidden mb-2"><img src={formData.bride_photo || "https://via.placeholder.com/100"} className="w-full h-full object-cover" /></div><label className="block text-xs font-bold text-purple-600 cursor-pointer hover:underline">Upload Wanita <input type="file" onChange={(e) => handleFileUpload(e, 'bride_photo')} className="hidden" disabled={uploading} /></label></div>
                            </div>
                            <div className="pt-2">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">Foto Sampul (Cover)</label>
                                <div className="border rounded-xl p-2 text-center relative overflow-hidden h-32 flex items-center justify-center bg-gray-100 group">
                                    {formData.cover_photo && <img src={formData.cover_photo} className="absolute inset-0 w-full h-full object-cover" />}
                                    <label className="relative z-10 bg-white/90 px-4 py-2 rounded-full text-xs font-bold cursor-pointer shadow-sm hover:scale-105 transition">Ganti Cover <input type="file" onChange={(e) => handleFileUpload(e, 'cover_photo')} className="hidden" disabled={uploading} /></label>
                                </div>
                            </div>
                        </div>
                        {/* Galeri */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                            <div className="flex justify-between items-center"><h2 className="font-bold text-lg flex gap-2"><ImageIcon className="text-pink-600" /> Galeri Foto</h2></div>
                            <label className="w-full border-2 border-dashed border-pink-200 bg-pink-50 p-4 rounded-xl text-center block cursor-pointer text-pink-600 font-bold text-xs hover:bg-pink-100 transition">+ Tambah Foto Gallery <input type="file" onChange={(e) => handleFileUpload(e, null, true)} className="hidden" disabled={uploading} /></label>
                            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                                {formData.gallery.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border"><img src={url} className="w-full h-full object-cover" /> <button type="button" onClick={() => requestRemoveGallery(idx)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button></div>
                                ))}
                            </div>
                        </div>
                        {/* Musik & Quote */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
                            <h2 className="font-bold text-lg flex gap-2"><Music className="text-indigo-600" /> Musik & Kutipan</h2>
                            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-indigo-800">Background Music</span>
                                    <label className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs cursor-pointer hover:bg-indigo-700 transition">Ganti Lagu <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio_url')} className="hidden" /></label>
                                </div>
                                {formData.audio_url ? (<audio controls src={formData.audio_url} className="w-full h-8" />) : (<div className="text-xs text-gray-400 italic text-center py-2 bg-white rounded border border-dashed">Belum ada lagu.</div>)}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500">Kutipan</label>
                                <textarea name="quote" value={formData.quote} onChange={handleChange} className="w-full border p-3 rounded-xl h-24 text-sm focus:border-indigo-500 outline-none" placeholder="Tulis kutipan..." />
                                <input name="quote_src" value={formData.quote_src} onChange={handleChange} className="w-full border p-3 rounded-xl text-sm focus:border-indigo-500 outline-none" placeholder="Sumber" />
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-12 sticky bottom-6 z-20">
                        <button type="submit" disabled={loading || uploading} className="w-full bg-[#E59A59] text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-[#d48b4b] transition transform active:scale-[0.99] flex justify-center gap-2 items-center">
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                            {loading ? 'Menyimpan Perubahan...' : 'SIMPAN PERUBAHAN'}
                        </button>
                    </div>
                </form>
            )}

            {/* --- TAB 3: BUKU TAMU / RSVP (NEW - HANYA JIKA BUKAN BASIC) --- */}
            {activeTab === 'rsvp' && !isBasic && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border shadow-sm text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Respon</p>
                            <p className="text-3xl font-extrabold text-[#712E1E]">{rsvps.length}</p>
                        </div>
                        <div className="bg-green-50 p-5 rounded-2xl border border-green-100 text-center"><p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Hadir</p><p className="text-3xl font-extrabold text-green-700">{rsvps.filter(r => r.status === 'hadir').length}</p></div>
                        <div className="bg-red-50 p-5 rounded-2xl border border-red-100 text-center"><p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Tidak Hadir</p><p className="text-3xl font-extrabold text-red-700">{rsvps.filter(r => r.status === 'tidak_hadir').length}</p></div>
                        <div className="bg-white p-5 rounded-2xl border shadow-sm text-center flex items-center justify-center"><button onClick={downloadCSV} className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-600 hover:text-black transition"><Download className="w-6 h-6" /> <span className="text-xs font-bold">Download Excel</span></button></div>
                    </div>
                    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-[#FFF0E0] text-[#712E1E] font-bold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="p-5">Nama Tamu</th>
                                        <th className="p-5">Kehadiran</th>
                                        <th className="p-5">Pesan & Doa</th>
                                        <th className="p-5 w-1/3">Balasan Anda</th>
                                    </tr>
                                </thead>
                                {/* ... (Header Tabel Tetap Sama) ... */}
                                <tbody className="divide-y divide-gray-100">
                                    {rsvps.length === 0 && (
                                        <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">Belum ada data.</td></tr>
                                    )}
                                    {rsvps.map((rsvp) => (
                                        <tr key={rsvp.id} className="hover:bg-gray-50 transition group">
                                            <td className="p-5 font-bold">
                                                {rsvp.guest_name}
                                                <br />
                                                <span className="text-[10px] font-normal text-gray-400">{new Date(rsvp.created_at).toLocaleDateString('id-ID')}</span>
                                            </td>
                                            <td className="p-5">
                                                {rsvp.status === 'hadir' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle2 size={12} /> Hadir ({rsvp.pax})</span>}
                                                {rsvp.status === 'tidak_hadir' && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold w-fit">Absen</span>}
                                                {rsvp.status === 'ragu' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold w-fit">Ragu</span>}
                                            </td>
                                            <td className="p-5 italic text-gray-600 bg-gray-50/50 max-w-xs text-sm">
                                                "{rsvp.message}"
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-2">
                                                    {/* BAGIAN BALASAN */}
                                                    {rsvp.reply ? (
                                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800 text-xs">
                                                            <span className="font-bold block mb-1">Balasan:</span>{rsvp.reply}
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <input
                                                                value={replyText[rsvp.id] || ''}
                                                                onChange={(e) => setReplyText({ ...replyText, [rsvp.id]: e.target.value })}
                                                                placeholder="Balas..."
                                                                className="border p-2 rounded-lg text-xs w-full focus:border-blue-500 outline-none transition"
                                                            />
                                                            <button onClick={() => handleReply(rsvp.id)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-sm transition">
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* TOMBOL HAPUS (Muncul saat hover row atau selalu muncul di mobile) */}
                                                    <button
                                                        onClick={() => handleDeleteRsvp(rsvp.id)}
                                                        className="text-red-400 text-xs flex items-center gap-1 hover:text-red-600 self-start mt-1 opacity-50 hover:opacity-100 transition"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Hapus Pesan
                                                    </button>
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

            <ConfirmDialog isOpen={confirmData.show} title="Konfirmasi Hapus" message={confirmData.message} isDanger={true} onCancel={() => setConfirmData({ show: false })} onConfirm={confirmData.action} />
        </div>
    );
}