// ============================================================
// src/components/admin/AdminLogin.tsx
// ------------------------------------------------------------
// Form login admin (email + password via Supabase Auth). Gerbang masuk AdminPanel sebelum sesi auth aktif.
// Dipakai di  : pages/AdminPanelPage.tsx
// Keterikatan : lib/supabaseClient, components/GlobalToast, lucide-react
// ============================================================

import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { ToastApi } from '../GlobalToast';
import { ShieldCheck, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  toast: ToastApi;
}

export default function AdminLogin({ toast }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoginLoading(false);

    if (error) {
      toast.error('Login Gagal: ' + error.message);
    } else {
      toast.success('Selamat datang, Admin!');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFD5AF] p-4 font-sans selection:bg-[#E59A59] selection:text-white">
      <div className="relative w-full max-w-md rounded-3xl border border-[#712E1E]/20 bg-white p-8 shadow-2xl sm:p-10">
        {/* Header / Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#712E1E] text-[#FFD5AF] shadow-md shadow-[#712E1E]/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#712E1E]">
            Admin Login
          </h1>
          <p className="mt-1 text-xs font-medium text-stone-500">
            Masuk dengan akun terdaftar untuk mengelola undangan.
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Email */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-stone-700">Email</label>
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
            <label className="text-xs font-bold text-stone-700">Password</label>
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

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loginLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E59A59] py-3.5 text-sm font-bold text-white shadow-md shadow-[#E59A59]/25 transition hover:bg-[#d48b4b] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loginLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-8 text-center text-[11px] font-medium text-stone-400">
          Akses terbatas hanya untuk administrator resmi.
        </p>
      </div>
    </div>
  );
}