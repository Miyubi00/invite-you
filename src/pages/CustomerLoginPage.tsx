import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import { setCustomerToken } from '../lib/customerClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/GlobalToast';
import { Lock, LogIn, HeartHandshake, Eye, EyeOff, Phone } from 'lucide-react';
import { useTranslation } from '../i18n';
import TurnstileWidget, { type TurnstileWidgetRef } from '../components/ui/TurnstileWidget';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast(); 
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  
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

    if (!captchaToken) {
      toast.warning(t('common.captchaRequired'));
      return;
    }

    setLoading(true);

    const form = e.currentTarget;
    const whatsappInput = form.elements.namedItem('whatsapp') as HTMLInputElement | null;
    let whatsapp = (whatsappInput?.value ?? '').trim();

    // --- FITUR AUTO-FORMAT NOMOR WHATSAPP ---
    whatsapp = whatsapp.replace(/[^0-9+]/g, '');

    if (whatsapp.startsWith('0')) {
        whatsapp = '+62' + whatsapp.substring(1);
    } else if (whatsapp.startsWith('62')) {
        whatsapp = '+' + whatsapp;
    } else if (!whatsapp.startsWith('+')) {
        whatsapp = '+62' + whatsapp;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-login', {
        body: {
          whatsapp,
          pin: pinValue,
          captcha_token: captchaToken,
        },
      });

      if (error) {
        console.error('Login Error:', error);
        throw new Error(await extractInvokeError(error));
      }

      const login = data as CustomerLoginResponse | null;
      if (!login?.access_token || !login.order?.id) {
        throw new Error(t('login.errorNotFound'));
      }

      // Login Sukses
      toast.success(t('login.toastSuccess'));

      setCustomerToken(login.access_token);
      sessionStorage.setItem('active_order_id', login.order.id);
      sessionStorage.removeItem('order_pin');

      setTimeout(() => {
          navigate(`/dashboard/${login.order.id}`);
      }, 1000);

    } catch (err) {
      setCaptchaToken(null);
      turnstileRef.current?.reset();
      toast.error(err instanceof Error ? err.message : t('toast.systemError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1E8DC] flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl w-full max-w-md border border-[#EBDFCE]">
        
        {/* Header Login */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-[#E59A59]/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
             <HeartHandshake className="w-7 h-7 sm:w-8 sm:h-8 text-[#E59A59]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E]">{t('login.title')}</h1>
          <p className="text-stone-400 mt-1.5 text-xs sm:text-sm">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
          
          {/* Input No WhatsApp */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#712E1E] mb-1">{t('login.whatsappLabel')}</label>
            <div className="relative w-full min-w-0">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-stone-400 pointer-events-none" />
                <input 
                  type="tel" 
                  name="whatsapp" 
                  required 
                  placeholder={t('login.whatsappPlaceholder')} 
                  className="w-full min-w-0 py-2.5 sm:py-3 pr-3.5 pl-11 rounded-xl border border-stone-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition text-sm sm:text-base" 
                />
            </div>
          </div>

          {/* Input PIN */}
          <div className="bg-yellow-50 p-3.5 sm:p-4 rounded-xl border border-yellow-100">
              <label className="block text-xs sm:text-sm font-bold text-[#712E1E] mb-1">{t('login.pinLabel')}</label>
              <div className="relative w-full min-w-0">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-stone-400 pointer-events-none" />
                
                <input 
                  name="pin" 
                  required 
                  type={showPin ? "text" : "password"} 
                  inputMode="numeric" 
                  maxLength={6} 
                  placeholder={t('login.pinPlaceholder')} 
                  value={pinValue}
                  onChange={handlePinChange} 
                  className="w-full min-w-0 py-2.5 sm:py-3 pr-12 pl-11 rounded-xl border border-stone-200 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition bg-white font-mono tracking-widest text-base sm:text-lg" 
                />

                <button 
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#E59A59] transition"
                >
                  {showPin ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 mt-1.5 sm:mt-2">{t('login.pinHelp')}</p>
          </div>

          {/* Cloudflare Turnstile Captcha Widget */}
          <TurnstileWidget
            ref={turnstileRef}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />

          <button 
            disabled={loading || !captchaToken}
            className="w-full bg-[#E59A59] text-white py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:bg-[#d48b4b] transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? t('login.btnSubmitting') : (
                <>
                  <LogIn className="w-5 h-5" /> {t('login.btnSubmit')}
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}