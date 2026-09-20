// ============================================================
// src/pages/ForgotPinPage.tsx
// ------------------------------------------------------------
// Halaman "Lupa PIN?" — dipisah dari halaman login agar form login tetap
// ringkas. Pemohon cukup mengisi EMAIL pemesanan + TANGGAL PERNIKAHAN;
// PIN baru dikirim ke email yang tersimpan pada pesanan (lihat Edge Function
// supabase/functions/resend-pin).
// Dipakai di  : routes ("/forgot-pin")
// Keterikatan : lib/supabaseClient, components/GlobalToast,
//               components/ui/TurnstileWidget, components/order/constants, i18n
// ============================================================

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../components/GlobalToast';
import { KeyRound, Mail, Calendar, Send, ArrowLeft, HeartHandshake } from 'lucide-react';
import { useTranslation } from '../i18n';
import { EMAIL_RE } from '../components/order/constants';
import TurnstileWidget, { type TurnstileWidgetRef } from '../components/ui/TurnstileWidget';

/** Ambil pesan error dari Edge Function bila tersedia. */
async function extractInvokeError(err: unknown, fallback: string): Promise<string> {
  try {
    const ctx = (err as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      const body = (await ctx.json()) as { error?: string };
      if (body?.error) return body.error;
    }
  } catch {
    /* fallback di bawah */
  }
  return fallback;
}

export default function ForgotPinPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [email, setEmail] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const coolingDown = cooldown > 0;

  useEffect(() => {
    if (!coolingDown) return;
    const id = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [coolingDown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const emailTrim = email.trim().toLowerCase();

    if (!emailTrim) {
      toast.warning(t('forgotPin.needEmail'));
      return;
    }
    if (!EMAIL_RE.test(emailTrim)) {
      toast.warning(t('validation.emailInvalid'));
      return;
    }
    if (!weddingDate) {
      toast.warning(t('forgotPin.needDate'));
      return;
    }
    if (!captchaToken) {
      toast.warning(t('common.captchaRequired'));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('resend-pin', {
        body: { email: emailTrim, wedding_date: weddingDate, captcha_token: captchaToken },
      });
      if (error) {
        console.error('Resend PIN Error:', error);
        throw new Error(await extractInvokeError(error, t('toast.systemError')));
      }
      const msg = (data as { message?: string } | null)?.message;
      toast.success(msg || t('forgotPin.sent'));
      setCooldown(60);
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

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="bg-[#E59A59]/10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <KeyRound className="w-7 h-7 sm:w-8 sm:h-8 text-[#E59A59]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#712E1E]">{t('forgotPin.title')}</h1>
          <p className="text-stone-400 mt-1.5 text-xs sm:text-sm">{t('forgotPin.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Email pemesanan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
              {t('forgotPin.emailLabel')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('forgotPin.emailPlaceholder')}
                className="w-full py-3 pl-11 pr-3.5 rounded-xl border border-stone-200 bg-white focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Tanggal pernikahan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#712E1E] mb-1.5">
              {t('forgotPin.dateLabel')}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                required
                name="wedding_date"
                type="date"
                value={weddingDate}
                onChange={(e) => setWeddingDate(e.target.value)}
                className="w-full py-3 pl-11 pr-3.5 rounded-xl border border-stone-200 bg-white text-stone-600 focus:border-[#E59A59] focus:ring-2 focus:ring-[#E59A59]/20 outline-none transition text-sm sm:text-base"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">{t('forgotPin.dateHelp')}</p>
          </div>

          <TurnstileWidget
            ref={turnstileRef}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />

          <button
            disabled={loading || !captchaToken || coolingDown}
            className="w-full bg-[#E59A59] text-white py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:bg-[#d48b4b] transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? t('forgotPin.btnSubmitting') : coolingDown ? (
              t('forgotPin.cooldown', { s: cooldown })
            ) : (
              <>
                <Send className="w-5 h-5" /> {t('forgotPin.btnSubmit')}
              </>
            )}
          </button>
        </form>

        {/* Bantuan tambahan */}
        <div className="mt-5 sm:mt-6 space-y-2.5 border-t border-stone-200/70 pt-4">
          <p className="text-[11px] sm:text-xs text-stone-400 text-center">{t('forgotPin.note')}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Link
              to="/login"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-[#712E1E] bg-[#FAF6EE] hover:bg-[#F1E8DC] transition"
            >
              <ArrowLeft className="w-4 h-4" /> {t('forgotPin.backToLogin')}
            </Link>
            <Link
              to="/contact"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-stone-500 bg-[#FAF6EE] hover:bg-[#F1E8DC] transition"
            >
              <HeartHandshake className="w-4 h-4" /> {t('forgotPin.contactAdmin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
