// ============================================================
// src/hooks/useEditActions.ts
// ------------------------------------------------------------
// Aksi edit/destruktif bersama (admin & customer): hapus foto/galeri/rekening, tambah/ubah rekening, pola dialog konfirmasi persist-first.
// Dipakai di  : EditOrderModal (admin), EditTab (customer)
// Keterikatan : lib/apiHeaders, lib/customerClient, lib/persistQueue, types/database
// ============================================================

// Hook bersama Dashboard mempelai & Admin Panel: pola dialog konfirmasi
// serta aksi hapus foto/galeri/rekening dan tambah/ubah rekening.
//
// KONSISTENSI PENGHAPUSAN (persist-first):
//   konfirmasi → persist ke DB (RPC atomik) → update UI → toast sukses.
//   Bila persist gagal: UI TIDAK diubah, toast error.
//   Pembersihan objek R2 bersifat best-effort SETELAH persist sukses.

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { useToast } from "../components/GlobalToast";
import { buildApiHeaders, functionsUrl } from "../lib/apiHeaders";
import { resolveDbClient } from "../lib/customerClient";
import { enqueuePersist } from "../lib/persistQueue";
import type { BankAccount, EventDetails } from "../types/database";
import { useTranslation } from "../i18n";

export interface ConfirmState {
  show: boolean;
  message: string;
  action: (() => void) | null;
}

export const CLOSED_CONFIRM: ConfirmState = { show: false, action: null, message: "" };

export function useConfirmAction() {
  const [confirmData, setConfirmData] = useState<ConfirmState>(CLOSED_CONFIRM);

  const ask = useCallback((message: string, action: () => void) => {
    setConfirmData({ show: true, message, action });
  }, []);

  const close = useCallback(() => {
    setConfirmData((prev) => ({ ...prev, show: false }));
  }, []);

  return { confirmData, ask, close };
}

type EditableData = Partial<EventDetails> & { gallery?: string[]; banks?: BankAccount[] };

export type PhotoField = "groom_photo" | "bride_photo" | "cover_photo";

/** Fire-and-forget: hapus objek media milik pesanan ini dari bucket R2. */
async function deleteR2Objects(orderId: string, urls: string[]): Promise<void> {
  if (urls.length === 0) return;
  try {
    // Endpoint r2-delete mewajibkan otorisasi (JWT pelanggan / sesi admin).
    const headers = await buildApiHeaders();
    const res = await fetch(functionsUrl('r2-delete'), {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, urls }),
    });
    if (!res.ok) {
      console.warn('[EditActions] Pembersihan objek ditolak server:', res.status);
    }
  } catch (error) {
    console.warn('[EditActions] Pembersihan objek gagal:', error);
  }
}

export function useEditActions<T extends EditableData>(
  setData: Dispatch<SetStateAction<T>>,
  options?: { orderId?: string; getData?: () => T | undefined },
) {
  const toast = useToast();
  const { t } = useTranslation();
  const { confirmData, ask, close } = useConfirmAction();

  const requireOrderId = (): string | null => {
    if (!options?.orderId) {
      toast.error(t('toast.sessionNotFound'));
      return null;
    }
    return options.orderId;
  };

  /**
   * Hapus foto tunggal (groom/bride/cover): persist dulu lewat RPC
   * update_event_details_field, baru update UI + toast + cleanup R2.
   */
  const requestRemovePhoto = (field: PhotoField, label: string) =>
    ask(`Hapus ${label}?`, () => {
      const orderId = requireOrderId();
      if (!orderId) return;
      const previousUrl = options?.getData?.()?.[field];

      void (async () => {
        try {
          const { data: persisted, error } = await enqueuePersist(() =>
            resolveDbClient().rpc('update_event_details_field', {
              p_order_id: orderId,
              p_key: field,
              p_value: '',
            }),
          );
          if (error) throw new Error(error.message);
          if (persisted === false) throw new Error('Pesanan tidak ditemukan di server.');

          setData((prev) => ({ ...prev, [field]: "" }) as T);
          close();
          toast.success(t('toast.itemDeleted', { label }));

          if (typeof previousUrl === 'string' && previousUrl && previousUrl.includes(`/${orderId}/`)) {
            void deleteR2Objects(orderId, [previousUrl]);
          }
        } catch (err) {
          console.error('[EditActions] Gagal menghapus foto:', err);
          close();
          toast.error(
            t('toast.deleteFailed', {
              error: err instanceof Error ? err.message : 'Unknown error',
            }),
          );
        }
      })();
    });

  /**
   * Hapus item galeri: persist dulu lewat RPC remove_gallery_item
   * (atomik di server), baru update UI + toast; R2 best-effort sesudahnya.
   */
  const requestRemoveGallery = (index: number) =>
    ask("Hapus foto ini dari galeri?", () => {
      const orderId = requireOrderId();
      if (!orderId) return;
      const removedUrl = options?.getData?.()?.gallery?.[index];
      if (!removedUrl) {
        close();
        toast.error(t('toast.photoUndefined'));
        return;
      }

      void (async () => {
        try {
          const { data: affected, error } = await enqueuePersist(() =>
            resolveDbClient().rpc('remove_gallery_item', {
              p_order_id: orderId,
              p_url: removedUrl,
            }),
          );

          // affected=false => URL tidak ada di galeri server; jangan bohong sukses.
          if (error) throw new Error(error.message);
          if (affected === false) throw new Error('Foto tidak ditemukan di server.');

          setData((prev) => ({
            ...prev,
            gallery: (prev.gallery || []).filter((_, i) => i !== index),
          }));
          close();
          toast.success(t('toast.galleryPhotoDeleted'));

          // Bersihkan objek dari bucket (best-effort, setelah persist sukses).
          if (removedUrl.includes(`/${orderId}/`)) {
            void deleteR2Objects(orderId, [removedUrl]);
          }
        } catch (err) {
          console.error('[EditActions] Gagal menghapus foto galeri:', err);
          close();
          toast.error(
            t('toast.deleteFailed', {
              error: err instanceof Error ? err.message : 'Unknown error',
            }),
          );
        }
      })();
    });

  const requestRemoveBank = (index: number) =>
    ask("Hapus rekening ini?", () => {
      setData((prev) => ({
        ...prev,
        banks: (prev.banks || []).filter((_, i) => i !== index),
      }));
      close();
      toast.success(t('toast.bankDeleted'));
    });

  const addBank = () =>
    setData((prev) => ({
      ...prev,
      banks: [...(prev.banks || []), { bank: "", number: "", name: "" }],
    }));

  const updateBank = (index: number, field: keyof BankAccount, value: string) =>
    setData((prev) => ({
      ...prev,
      banks: (prev.banks || []).map((b, i) =>
        i === index ? { ...b, [field]: value } : b,
      ),
    }));

  return {
    confirmData,
    ask,
    closeConfirm: close,
    requestRemovePhoto,
    requestRemoveGallery,
    requestRemoveBank,
    addBank,
    updateBank,
  };
}
