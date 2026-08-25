// ============================================================
// src/pages/CustomerLoginPage.tsx
// ------------------------------------------------------------
// Halaman /login - login customer (identitas order + PIN): verifikasi via Edge Function customer-login, simpan JWT, redirect ke dashboard.
// Dipakai di  : App.tsx
// Keterikatan : lib/supabaseClient, lib/customerClient, components/GlobalToast, react-router-dom
// ============================================================

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { setCustomerToken } from '../lib/customerClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/GlobalToast';
import { Lock, LogIn, HeartHandshake, Eye, EyeOff, Phone } from 'lucide-react';

interface CustomerLoginResponse {
  access_token: string;
  expires_at: number;
  order: {
    id: string;
    slug: string;
    groom_name: string;
    bride_name: string;
  };
}

/** Ambil pesan error dari Edge Function bila tersedia. */
async function extractInvokeError(err: unknown): Promise<string> {
  try {
    const ctx = (err as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      const body = (await ctx.json()) as { error?: string };
      if (body?.error) return body.error;
    }
  } catch {
    /* fallback di bawah */
  }
  return 'Terjadi kesalahan sistem. Pastikan data benar.';
}

export default function DashboardLogin() {
  const navigate = useNavigate();
  const toast = useToast(); 
  const [loading, setLoading] = useState(false);
  
  // State UX PIN
  const [showPin, setShowPin] = useState(false);
  const [pinValue, setPinValue] = useState('');

  const handlePinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 6) {
      setPinValue(val);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const whatsappInput = form.elements.namedItem('whatsapp') as HTMLInputElement | null;
    let whatsapp = (whatsappInput?.value ?? '').trim();

    // --- FITUR AUTO-FORMAT NOMOR WHATSAPP ---
    // 1. Bersihkan spasi atau tanda strip (jika klien iseng mengetik 0812-3456-7890)
    whatsapp = whatsapp.replace(/[^0-9+]/g, '');

    // 2. Format awalan angka
    if (whatsapp.startsWith('0')) {
        // Jika berawalan 0 (0812...), ubah 0 menjadi +62
        whatsapp = '+62' + whatsapp.substring(1);
    } else if (whatsapp.startsWith('62')) {
        // Jika berawalan 62 (62812...), tambahkan + di depannya
        whatsapp = '+' + whatsapp;
    } else if (!whatsapp.startsWith('+')) {
        // Jika langsung berawalan 8 (812...), tambahkan +62 di depannya
        whatsapp = '+62' + whatsapp;
    }
    // ----------------------------------------

    try {
      const { data, error } = await supabase.functions.invoke('customer-login', {
        body: {
          whatsapp, // Sudah format +62
          pin: pinValue,
        },
      });

      if (error) {
        console.error('Login Error:', error);
        throw new Error(await extractInvokeError(error));
      }

      const login = data as CustomerLoginResponse | null;
      if (!login?.access_token || !login.order?.id) {
        throw new Error('Data tidak ditemukan. Cek kembali No. WhatsApp atau PIN Anda.');
      }

      // Login Sukses
      toast.success('Login Berhasil! Mengalihkan...');

      // Simpan JWT ber-scope pesanan (RLS memvalidasi claim order_id).
      setCustomerToken(login.access_token);

      // Simpan Session ID untuk gating UI dashboard.
      // CATATAN KEAMANAN: PIN TIDAK disimpan di sessionStorage (plaintext).
      sessionStorage.setItem('active_order_id', login.order.id);
      sessionStorage.removeItem('order_pin'); // bersihkan sisa legacy jika ada

      setTimeout(() => {
          navigate(`/dashboard/${login.order.id}`);
      }, 1000);

    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-[#EBDFCE]">
        
        {/* Header Login */}
        <div className="text-center mb-8">
          <div className="bg-[#E59A59]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
             <HeartHandshake className="w-8 h-8 text-[#E59A59]" />
          </div>
          <h1 className="text-3xl font-bold text-[#712E1E]">Login Mempelai</h1>
          <p className="text-stone-400 mt-2 text-sm">Masuk untuk mengedit undanganmu</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Input No WhatsApp */}
          <div>
            <label className="block text-sm font-bold text-[#712E1E] mb-1">No. WhatsApp</label>
            <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                <input 
                  type="tel" 
                  name="whatsapp" 
                  required 
                  placeholder="Contoh: 081234567890" 
                  className="pl-10 w-full p-3 rounded-xl border border-stone-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition" 
                />
            </div>
          </div>

          {/* Input PIN */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <label className="block text-sm font-bold text-[#712E1E] mb-1">PIN Keamanan</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400" />
                
                <input 
                  name="pin" 
                  required 
                  type={showPin ? "text" : "password"} 
                  inputMode="numeric" 
                  maxLength={6} 
                  placeholder="6 Digit Angka" 
                  value={pinValue}
                  onChange={handlePinChange} 
                  className="pl-10 pr-12 w-full p-3 rounded-xl border border-stone-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition bg-white font-mono tracking-widest text-lg" 
                />

                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-[#E59A59] transition"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-stone-500 mt-2">PIN yang Anda terima saat pemesanan.</p>
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