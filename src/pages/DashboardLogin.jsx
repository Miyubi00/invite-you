import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/GlobalToast'; 
import { User, Calendar, Lock, LogIn, HeartHandshake, Eye, EyeOff } from 'lucide-react';

export default function DashboardLogin() {
  const navigate = useNavigate();
  const toast = useToast(); 
  const [loading, setLoading] = useState(false);
  
  // State UX PIN
  const [showPin, setShowPin] = useState(false);
  const [pinValue, setPinValue] = useState('');

  const handlePinChange = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 6) {
      setPinValue(val);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const groom = e.target.groom.value.trim();
    const bride = e.target.bride.value.trim();
    const date = e.target.date.value;

    try {
      // --- PERBAIKAN DI SINI ---
      // Menggunakan RPC (Function) agar bisa bypass RLS dengan aman
      const { data, error } = await supabase
        .rpc('login_client', { // Panggil fungsi SQL yang kita buat
            p_groom: groom,
            p_bride: bride,
            p_date: date,
            p_pin: pinValue
        })
        .single(); // Ambil 1 hasil saja

      if (error) {
          console.error("Login Error:", error);
          throw new Error('Terjadi kesalahan sistem.');
      }

      if (!data) {
        throw new Error('Data tidak ditemukan. Cek Nama, Tanggal, atau PIN.');
      }

      if (data.payment_status !== 'success' && data.payment_status !== 'paid') {
        throw new Error('Undangan ditemukan tapi status belum lunas.');
      }

      // Login Sukses
      toast.success('Login Berhasil! Mengalihkan...'); 
      
      // Simpan Session ID (PENTING untuk Dashboard.jsx)
      sessionStorage.setItem('active_order_id', data.id);
      sessionStorage.setItem('order_pin', pinValue);
      
      setTimeout(() => {
          // Redirect ke Dashboard dengan ID Order
          navigate(`/dashboard/${data.id}`);
      }, 1000);

    } catch (err) {
      toast.error(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFD5AF]/20 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-[#FFD5AF]">
        
        {/* Header Login */}
        <div className="text-center mb-8">
          <div className="bg-[#E59A59]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
             <HeartHandshake className="w-8 h-8 text-[#E59A59]" />
          </div>
          <h1 className="text-3xl font-bold text-[#712E1E]">Login Mempelai</h1>
          <p className="text-[#888870] mt-2 text-sm">Masuk untuk mengedit undanganmu</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Input Nama Pria */}
          <div>
            <label className="block text-sm font-bold text-[#712E1E] mb-1">Mempelai Pria</label>
            <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  name="groom" required placeholder="Contoh: Romeo" 
                  className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition" 
                />
            </div>
          </div>

          {/* Input Nama Wanita */}
          <div>
            <label className="block text-sm font-bold text-[#712E1E] mb-1">Mempelai Wanita</label>
            <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  name="bride" required placeholder="Contoh: Juliet" 
                  className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition" 
                />
            </div>
          </div>

          {/* Input Tanggal */}
          <div>
            <label className="block text-sm font-bold text-[#712E1E] mb-1">Tanggal Pernikahan</label>
            <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                  type="date" name="date" required 
                  className="pl-10 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition text-gray-600" 
                />
            </div>
          </div>

          {/* --- INPUT PIN --- */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <label className="block text-sm font-bold text-[#712E1E] mb-1">PIN Keamanan</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                
                <input 
                  name="pin" 
                  required 
                  type={showPin ? "text" : "password"} 
                  inputMode="numeric" 
                  maxLength={6} 
                  placeholder="6 Digit Angka" 
                  value={pinValue}
                  onChange={handlePinChange} 
                  className="pl-10 pr-12 w-full p-3 rounded-xl border border-gray-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition bg-white font-mono tracking-widest text-lg" 
                />

                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-[#E59A59] transition"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">PIN yang Anda buat saat pemesanan.</p>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-[#E59A59] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-[#d48b4b] transition flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengecek Data...' : (
                <>
                  <LogIn className="w-5 h-5" /> Masuk Dashboard
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}