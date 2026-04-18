import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/GlobalToast';
import ConfirmDialog from '../components/ConfirmDialog';
import { TEMPLATE_OPTIONS } from '../lib/constants';
import { User, Calendar, Lock, CreditCard, ShieldCheck, Palette, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function OrderForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [loadingWA, setLoadingWA] = useState(false);
  const [loadingMidtrans, setLoadingMidtrans] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const urlSlug = searchParams.get('template');
  const defaultTemplate = TEMPLATE_OPTIONS.find(t => t.slug === urlSlug) || TEMPLATE_OPTIONS[0];

  const initialFormState = {
    groom_name: '',
    bride_name: '',
    wedding_date: '',
    whatsapp: '',
    pin_code: '',
    template_slug: defaultTemplate.slug
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);

  useEffect(() => {
    const currentSlug = searchParams.get('template');
    const newTemplate = TEMPLATE_OPTIONS.find(t => t.slug === currentSlug);
    if (newTemplate) {
      setSelectedTemplate(newTemplate);
      setFormData(prev => ({ ...prev, template_slug: newTemplate.slug }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsappChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('0')) val = val.substring(1);
    if (val.startsWith('62')) val = val.substring(2);
    setFormData({ ...formData, whatsapp: val });
  };

  const handlePinChange = (e) => {
    const val = e.target.value;

    if (/^\d*$/.test(val) && val.length <= 6) {
      // --- TAMBAHKAN PENGECEKAN PIN LEMAH DI SINI ---
      if (val === '123456' || val === '654321') {
        // Jika Anda sudah meng-import toast di file ini, gunakan:
        toast.error("PIN terlalu mudah ditebak! Silakan gunakan kombinasi lain.");

        // Atau gunakan alert bawaan browser:
        //alert("PIN terlalu mudah ditebak! Silakan gunakan kombinasi angka lain.");
        return; // Menghentikan proses agar angka ke-6 tidak tersimpan
      }
      // ----------------------------------------------

      setFormData({ ...formData, pin_code: val });
    }
  };

  const handleTemplateChange = (e) => {
    const slug = e.target.value;
    const template = TEMPLATE_OPTIONS.find(t => t.slug === slug);
    setSelectedTemplate(template);
    setFormData({ ...formData, template_slug: slug });
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setShowConfirm(false);
    toast.success("Formulir dikosongkan.");
  };

  // Fungsi Validasi agar tidak diulang-ulang
  const validateForm = () => {
    if (!formData.groom_name || !formData.bride_name || !formData.wedding_date) {
      toast.error('Harap lengkapi semua data mempelai dan tanggal!');
      return false;
    }
    if (formData.pin_code.length !== 6) {
      toast.error('PIN harus pas 6 digit angka!');
      return false;
    }
    if (!formData.whatsapp || formData.whatsapp.length < 9) {
      toast.error('Nomor WhatsApp tidak valid!');
      return false;
    }
    return true;
  };

  // ==========================================
  // LOGIKA 1: CHECKOUT VIA WHATSAPP (TABLE BARU)
  // ==========================================
  const handleWhatsappCheckout = async () => {
    if (!validateForm()) return;
    setLoadingWA(true);

    try {
      const finalWhatsapp = `+62${formData.whatsapp}`;

      // Insert ke tabel "pending_orders" (BUKAN orders)
      const { error } = await supabase
        .from('pending_orders')
        .insert([{
          groom_name: formData.groom_name,
          bride_name: formData.bride_name,
          wedding_date: formData.wedding_date,
          whatsapp: finalWhatsapp,
          pin_code: formData.pin_code,
          template_slug: formData.template_slug
        }]);

      if (error) throw error;

      const NOMOR_WA_ADMIN = "6281234567890"; // GANTI DENGAN NOMOR WA ADMIN

      const message = `Halo Admin, saya ingin memesan Undangan Digital:%0A
*Data Mempelai:*
Pria: ${formData.groom_name}
Wanita: ${formData.bride_name}
Tanggal: ${formData.wedding_date}
%0A*Order:*
Template: ${selectedTemplate.name}
Total Harga: Rp ${selectedTemplate.price.toLocaleString('id-ID')}
%0AMohon info cara pembayarannya.`;

      const waUrl = `https://wa.me/${6285179880092}?text=${message}`;
      toast.success("Berhasil! Mengarahkan ke WhatsApp...");

      window.open(waUrl, '_blank');
      navigate(`/payment-status`);

    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan database: ' + err.message);
    } finally {
      setLoadingWA(false);
    }
  };

  // ==========================================
  // LOGIKA 2: CHECKOUT VIA MIDTRANS (EDGE FUNCTION)
  // ==========================================
  const handleMidtransCheckout = async () => {
    if (!validateForm()) return;
    setLoadingMidtrans(true);

    try {
      const finalWhatsapp = `+62${formData.whatsapp}`;

      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          groom_name: formData.groom_name,
          bride_name: formData.bride_name,
          wedding_date: formData.wedding_date,
          whatsapp: finalWhatsapp,
          pin_code: formData.pin_code,
          template_slug: formData.template_slug
        }
      });

      if (error) throw error;
      if (!data?.snap_token) throw new Error("Gagal mendapatkan Token Pembayaran");

      window.snap.pay(data.snap_token, {
        onSuccess: function (result) {
          toast.success("Pesanan Dibuat! Cek status pembayaran.");
          navigate(`/payment-status?order_id=${result.order_id}`);
        },
        onPending: function (result) {
          toast.warning("Menunggu pembayaran...");
          navigate(`/payment-status?order_id=${result.order_id}`);
        },
        onError: function (result) {
          toast.error("Pembayaran gagal!");
          navigate(`/payment-status?order_id=${result.order_id}`);
        },
        onClose: function () {
          toast.warning('Kamu menutup popup sebelum bayar.');
        }
      });

    } catch (err) {
      console.error(err);
      toast.error('Midtrans Error: ' + err.message);
    } finally {
      setLoadingMidtrans(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFD5AF]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-[#FFD5AF] relative">

        <button
          onClick={() => setShowConfirm(true)}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
          title="Reset Form"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <div className="text-center mb-10">
          <div className="bg-[#E59A59]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#E59A59]" />
          </div>
          <h2 className="text-3xl font-bold text-[#712E1E]">Buat Undangan</h2>
          <p className="mt-2 text-[#888870]">Lengkapi data pesananmu.</p>
        </div>

        {/* MENGUBAH <form> MENJADI <div> KARENA ADA 2 TOMBOL SUBMIT */}
        <div className="space-y-5">

          {/* ... (KODE INPUT TEMPLATE, MEMPELAI, TANGGAL, WA, PIN SAMA SEPERTI SEBELUMNYA) ... */}

          {/* Pilih Template */}
          <div>
            <label className="block text-sm font-semibold text-[#712E1E] mb-1">Pilih Desain Template</label>
            <div className="relative">
              <Palette className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select name="template_slug" value={formData.template_slug} onChange={handleTemplateChange} className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition bg-white cursor-pointer">
                {TEMPLATE_OPTIONS.map(t => (
                  <option key={t.slug} value={t.slug}>{t.name} - {t.category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nama Mempelai */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#712E1E] mb-1">Mempelai Pria</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input required name="groom_name" value={formData.groom_name} type="text" placeholder="Romeo" onChange={handleChange} className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#712E1E] mb-1">Mempelai Wanita</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input required name="bride_name" value={formData.bride_name} type="text" placeholder="Juliet" onChange={handleChange} className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition" />
              </div>
            </div>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-semibold text-[#712E1E] mb-1">Tanggal Pernikahan</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input required name="wedding_date" value={formData.wedding_date} type="date" onChange={handleChange} className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition text-gray-600" />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-semibold text-[#712E1E] mb-1">Nomor WhatsApp</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10 pointer-events-none"><FaWhatsapp className="w-5 h-5" /></div>
              <div className="absolute left-10 top-0 bottom-0 flex items-center justify-center bg-gray-100 px-2 border-y border-l border-gray-200 rounded-l-xl text-gray-500 font-bold text-sm">+62</div>
              <input required name="whatsapp" type="tel" placeholder="81234567890" value={formData.whatsapp} onChange={handleWhatsappChange} className="pl-24 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition font-medium tracking-wide" />
            </div>
          </div>

          {/* PIN */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <label className="block text-sm font-bold text-[#712E1E] mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />Buat PIN Keamanan (6 Digit)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                required
                name="pin_code"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={formData.pin_code}
                onChange={handlePinChange}
                className="pl-10 pr-12 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition tracking-widest font-mono"
              />
              <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-3 text-gray-400 hover:text-[#E59A59] transition">
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">PIN ini wajib diingat untuk Login setelah Admin menyetujui. <span className="text-red-500 font-medium">Hindari PIN berurutan seperti 123456.</span></p>
          </div>

          {/* TOTAL HARGA */}
          <div className="bg-[#712E1E] text-[#FFD5AF] p-5 rounded-xl flex justify-between items-center shadow-lg transition-all">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-wide">Total Pembayaran</p>
              <p className="font-bold text-lg">{selectedTemplate.name}</p>
            </div>
            <span className="text-2xl font-bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedTemplate.price)}
            </span>
          </div>

          {/* DUA TOMBOL PEMBAYARAN */}
          <div className="flex flex-col gap-3 mt-4">
            {/* Tombol WhatsApp (Aktif) */}
            <button
              type="button"
              onClick={handleWhatsappCheckout}
              disabled={loadingWA}
              className={`w-full py-3.5 rounded-xl font-bold text-lg shadow-md transition flex items-center justify-center gap-2
                ${loadingWA ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#25D366] text-white hover:bg-[#20bd5a]'}`}
            >
              {loadingWA ? 'Memproses...' : <><FaWhatsapp className="w-6 h-6" /> Pesan via WhatsApp</>}
            </button>

            {/* Tombol Midtrans (Maintenance) */}
            <button
              type="button"
              disabled
              className="w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              title="Fitur pembayaran otomatis sedang dalam tahap verifikasi."
            >
              Bayar Otomatis (Sedang Maintenance)
            </button>
          </div>

        </div>
      </div>

      <ConfirmDialog isOpen={showConfirm} title="Reset Formulir?" message="Semua data yang kamu isi akan dihapus. Yakin?" isDanger={true} onCancel={() => setShowConfirm(false)} onConfirm={handleReset} />
    </div>
  );
}