import { useState, useRef, type FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { ToastApi } from '../GlobalToast';
import { ShieldCheck, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '../../i18n';
import LanguageSwitcher from '../shared/LanguageSwitcher';
import TurnstileWidget, { type TurnstileWidgetRef } from '../ui/TurnstileWidget';

interface AdminLoginProps {
  toast: ToastApi;
}

export default function AdminLogin({ toast }: AdminLoginProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!captchaToken) {
      toast.warning(t('common.captchaRequired'));
      return;
    }

    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoginLoading(false);

    if (error) {
      setCaptchaToken(null);
      turnstileRef.current?.reset();
      toast.error(t('toast.loginFailed', { error: error.message }));
    } else {
      toast.success(t('toast.adminWelcome'));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFD5AF] p-4 font-sans selection:bg-[#E59A59] selection:text-white relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="light" />
      </div>

      <div className="relative w-full max-w-md rounded-2xl border border-[#712E1E]/20 bg-white p-8 shadow-2xl sm:p-10">
        {/* Header / Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#712E1E] text-[#FFD5AF] shadow-md shadow-[#712E1E]/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#712E1E]">
            {t('admin.loginTitle')}
          </h1>
          <p className="mt-1 text-xs font-medium text-stone-500">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Email */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-stone-700">{t('admin.loginEmail')}</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                disabled={loginLoading}
                placeholder="admin@loverse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 pl-10 pr-4 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#712E1E] focus:bg-white focus:ring-4 focus:ring-[#712E1E]/10 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-stone-700">{t('admin.loginPassword')}</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loginLoading}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-3 pl-10 pr-11 text-xs font-medium text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#712E1E] focus:bg-white focus:ring-4 focus:ring-[#712E1E]/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 transition hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Cloudflare Turnstile Captcha Widget */}
          <TurnstileWidget
            ref={turnstileRef}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loginLoading || !captchaToken}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E59A59] py-3.5 text-sm font-bold text-white shadow-md shadow-[#E59A59]/25 transition hover:bg-[#d48b4b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loginLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('admin.loginBtnLoading')}</span>
              </>
            ) : (
              <span>{t('admin.loginBtnSubmit')}</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-8 text-center text-[11px] font-medium text-stone-400">
          {t('admin.loginFooter')}
        </p>
      </div>
    </div>
  );
}