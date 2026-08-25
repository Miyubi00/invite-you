// ============================================================
// src/hooks/useCopyToClipboard.ts
// ------------------------------------------------------------
// Salin teks ke clipboard dengan fallback konteks non-secure (HTTP) + feedback otomatis via toast.
// Dipakai di  : src/templates/themes/*
// Keterikatan : components/GlobalToast
// ============================================================

// Salin teks ke clipboard dengan fallback untuk konteks non-secure (HTTP)
// dan feedback otomatis via GlobalToast. Dipakai semua tema undangan.

import { useCallback } from 'react';
import { useToast } from '../components/GlobalToast';
import { useTranslation } from '../i18n';

export function useCopyToClipboard() {
  const toast = useToast();
  const { t } = useTranslation();

  return useCallback(
    async (text: string, label = 'Nomor rekening') => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        toast.success(t('toast.copied', { label }));
      } catch {
        toast.error(t('toast.copyFailed'));
      }
    },
    [toast, t],
  );
}
