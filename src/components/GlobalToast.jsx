import React, { createContext, useContext, useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Fungsi memunculkan alert
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Hilang otomatis setelah 3 detik
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper functions biar manggilnya gampang
  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
  };

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