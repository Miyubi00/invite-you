// ============================================================
// src/components/GlobalToast.tsx
// ------------------------------------------------------------
// Sistem toast global: ToastProvider (context) + hook useToast() untuk notifikasi sukses/error/info di seluruh aplikasi.
// Dipakai di  : Sangat luas: App, hampir semua pages, hooks, dan komponen admin/customer
// Keterikatan : react (createContext), lucide-react
// ============================================================

/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning';

/** Durasi toast tampil (ms). */
const TOAST_DURATION_MS = 3000;
/** Batas toast aktif simultan — mencegah tumpukan tak terbatas. */
const MAX_ACTIVE_TOASTS = 5;

export interface ToastApi {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
}

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<ToastApi | null>(null);

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextToastId = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextToastId.current;
    nextToastId.current += 1;
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      // Cap jumlah toast aktif — buang yang tertua agar spam error
      // tidak menumpuk tanpa batas menutupi layar.
      return next.length > MAX_ACTIVE_TOASTS ? next.slice(next.length - MAX_ACTIVE_TOASTS) : next;
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  // API context dibuat reference-stable: tanpa ini, objek toast baru di
  // SETIAP render provider memicu re-render seluruh konsumen useToast()
  // (25+ file: pages besar, hooks dashboard, semua tema via clipboard).
  const toast = useMemo<ToastApi>(
    () => ({
      success: (msg: string) => addToast(msg, 'success'),
      error: (msg: string) => addToast(msg, 'error'),
      warning: (msg: string) => addToast(msg, 'warning'),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Container Alert (Pojok Kanan Atas/Tengah) */}
      <div className="fixed top-5 right-5 z-[9999] space-y-3 flex flex-col items-end pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto transform transition-all duration-300 animate-slide-in flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border w-full max-w-sm
            ${t.type === 'success' ? 'bg-white border-green-200 text-green-700' : ''}
            ${t.type === 'error' ? 'bg-white border-red-200 text-red-700' : ''}
            ${t.type === 'warning' ? 'bg-white border-yellow-200 text-yellow-700' : ''}
            `}
          >
            {/* ICON */}
            <div className={`p-2 rounded-full shrink-0
              ${t.type === 'success' ? 'bg-green-100' : ''}
              ${t.type === 'error' ? 'bg-red-100' : ''}
              ${t.type === 'warning' ? 'bg-yellow-100' : ''}
            `}>
              {t.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {t.type === 'error' && <XCircle className="w-5 h-5" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
            </div>

            {/* MESSAGE */}
            <div className="flex-1">
              <h4 className="font-bold text-sm uppercase tracking-wide">{t.type}</h4>
              <p className="text-sm opacity-90 font-medium">{t.message}</p>
            </div>

            {/* CLOSE BUTTON */}
            <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};