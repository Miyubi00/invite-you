import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../components/GlobalToast'; // 1. Import Toast
import ConfirmDialog from '../components/ConfirmDialog'; // 2. Import Confirm
import { TEMPLATE_OPTIONS } from '../lib/constants'; // Import ini
import { User, Calendar, Phone, Lock, CreditCard, ShieldCheck, Palette, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

export default function OrderForm() {
  const navigate = useNavigate();
  const toast = useToast(); // Init Toast
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // State Confirm Dialog

  // Ambil template default
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

  // Auto-select template jika URL berubah
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
      setFormData({ ...formData, pin_code: val });
    }
  };

  const handleTemplateChange = (e) => {
    const slug = e.target.value;
    const template = TEMPLATE_OPTIONS.find(t => t.slug === slug);
    setSelectedTemplate(template);
    setFormData({ ...formData, template_slug: slug });
  };

  // Logic Reset Form dengan Konfirmasi
  const handleReset = () => {
    setFormData(initialFormState);
    setShowConfirm(false);
    toast.success("Formulir dikosongkan.");
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi Manual dengan Toast
    if (formData.pin_code.length !== 6) {
      toast.error('PIN harus pas 6 digit angka!');
      setLoading(false);
      return;
    }

    if (!formData.whatsapp || formData.whatsapp.length < 9) {
      toast.error('Nomor WhatsApp tidak valid!');
      setLoading(false);
      return;
    }

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

      // Buka Snap Midtrans
      window.snap.pay(data.snap_token, {
        onSuccess: function (result) {
          toast.success("Pesanan Dibuat! Cek status pembayaran.");
          // REDIRECT KE HALAMAN STATUS (Menggunakan ID Transaksi dari Midtrans)
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
          // Opsional: Tetap redirect agar user bisa bayar nanti
          // navigate(`/payment-status?order_id=${data.order_id}`); // order_id dari DB, bukan result midtrans (karena popup ditutup resultnya beda)
        }
      });

    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFD5AF]/20 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-[#FFD5AF] relative">

        {/* Tombol Reset (Contoh penggunaan ConfirmDialog) */}
        <button
          onClick={() => setShowConfirm(true)}
          className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
          title="Reset Form"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="bg-[#E59A59]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#E59A59]" />
          </div>
          <h2 className="text-3xl font-bold text-[#712E1E]">Buat Undangan</h2>
          <p className="mt-2 text-[#888870]">Lengkapi data pesananmu.</p>
        </div>

        <form onSubmit={handleCheckout} className="space-y-5">

          {/* Pilih Template */}
          <div>
            <label className="block text-sm font-semibold text-[#712E1E] mb-1">Pilih Desain Template</label>
            <div className="relative">
              <Palette className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select
                name="template_slug"
                value={formData.template_slug}
                onChange={handleTemplateChange}
                className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition bg-white cursor-pointer"
              >
                {TEMPLATE_OPTIONS.map(t => (
                  <option key={t.slug} value={t.slug}>
                    {t.name} - {t.category}
                  </option>
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

          {/* WHATSAPP INPUT */}
          <div>
            <label className="block text-sm font-semibold text-[#712E1E] mb-1">Nomor WhatsApp</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10 pointer-events-none">
                <FaWhatsapp className="w-5 h-5" />
              </div>

              <div className="absolute left-10 top-0 bottom-0 flex items-center justify-center bg-gray-100 px-2 border-y border-l border-gray-200 rounded-l-xl text-gray-500 font-bold text-sm">
                +62
              </div>

              <input
                required
                name="whatsapp"
                type="tel"
                placeholder="81234567890"
                value={formData.whatsapp}
                onChange={handleWhatsappChange}
                className="pl-24 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition font-medium tracking-wide"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-1">*Untuk link pembayaran dan notifikasi.</p>
          </div>

          {/* PIN KEAMANAN */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
            <label className="block text-sm font-bold text-[#712E1E] mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              Buat PIN Keamanan (6 Digit)
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

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-3 text-gray-400 hover:text-[#E59A59] transition"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">PIN ini wajib diingat untuk <b>Login Dashboard</b>.</p>
          </div>

          {/* TOTAL HARGA */}
          <div className="bg-[#712E1E] text-[#FFD5AF] p-5 rounded-xl flex justify-between items-center shadow-lg transition-all">
            <div>
              <p className="text-xs opacity-80 uppercase tracking-wide">Total Pembayaran</p>
              <p className="font-bold text-lg">{selectedTemplate.name} ({selectedTemplate.category})</p>
            </div>
            <span className="text-2xl font-bold">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(selectedTemplate.price)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition transform hover:-translate-y-1
              ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#E59A59] text-white hover:bg-[#d48b4b]'}`}
          >
            {loading ? 'Memproses Pesanan...' : 'Bayar Sekarang →'}
          </button>
        </form>
      </div>

      {/* DIALOG KONFIRMASI RESET */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Reset Formulir?"
        message="Semua data yang kamu isi akan dihapus. Yakin?"
        isDanger={true}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleReset}
      />

    </div>
  );
}