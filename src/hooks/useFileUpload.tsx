// ============================================================
// src/hooks/useFileUpload.tsx
// ------------------------------------------------------------
// Upload media ke Cloudflare R2 via Edge Function r2-upload: crop wajib foto pengantin/cover, kompres WebP otomatis galeri, konversi audio WebM.
// Dipakai di  : EditOrderModal (admin), EditTab (customer)
// Keterikatan : lib/apiHeaders, lib/customerClient, ImageCropModal, utils/imageProcessing, utils/audioProcessing
// ============================================================

// Hook upload media ke Cloudflare R2 via proxy Edge Function `r2-upload`,
// dengan pemrosesan gambar sisi klien:
//
//   groom_photo / bride_photo : WAJIB crop manual (rasio 3:4) -> WebP <=1200x1600
//   cover_photo               : WAJIB crop manual (rasio 16:9) -> WebP <=1920x1080
//   gallery                   : kompres WebP otomatis (sisi terpanjang 1400), rasio asli
//   audio_url                 : diteruskan apa adanya
//
// Setelah unggah sukses, URL langsung di-patch ke event_details (auto-save).
// Kredensial R2 hidup sebagai Supabase secrets - tidak menyentuh browser.

import { useState, type ChangeEvent, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { buildApiHeaders, functionsUrl } from '../lib/apiHeaders';
import { resolveDbClient } from '../lib/customerClient';
import { enqueuePersist } from '../lib/persistQueue';
import { useToast } from '../components/GlobalToast';
import ImageCropModal, { type CropAreaPixels } from '../components/shared/ImageCropModal';
import { processImage, type CropRect } from '../utils/imageProcessing';
import { convertToWebMAudio } from '../utils/audioProcessing';
import type { EventDetails } from '../types/database';

const MAX_FILE_SIZE = 8 * 1024 * 1024;

type UploadData = Partial<EventDetails> & { gallery?: string[] };

/** Field gambar yang wajib melalui modal crop. */
const CROP_RULES: Partial<Record<string, { aspect: number; title: string }>> = {
  groom_photo: { aspect: 3 / 4, title: 'Atur Foto Mempelai Pria' },
  bride_photo: { aspect: 3 / 4, title: 'Atur Foto Mempelai Wanita' },
  cover_photo: { aspect: 16 / 9, title: 'Atur Banner Cover' },
};

/** Batas resolusi hasil per field. */
const SIZE_LIMITS: Record<string, { maxWidth: number; maxHeight: number }> = {
  groom_photo: { maxWidth: 1200, maxHeight: 1600 },
  bride_photo: { maxWidth: 1200, maxHeight: 1600 },
  cover_photo: { maxWidth: 1920, maxHeight: 1080 },
};

interface PendingCrop {
  file: File;
  aspect: number;
  title: string;
  resolve: (area: CropAreaPixels | null) => void;
}

export function useFileUpload<T extends UploadData>(
  orderId: string | undefined,
  setFormData: Dispatch<SetStateAction<T>>,
  imagePrefix = 'IMG_',
  autoSave = true,
  getFormData?: () => T | undefined,
) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertPercent, setConvertPercent] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);
  const [activeUploadField, setActiveUploadField] = useState<string | null>(null);
  const [pendingCrop, setPendingCrop] = useState<PendingCrop | null>(null);

  /** Header untuk memanggil edge function (apikey + token pelanggan/sesi admin). */
  const buildFunctionHeaders = async (): Promise<Record<string, string>> =>
    buildApiHeaders();

  /**
   * Auto-save: patch atomik satu field / push galeri ke event_details.
   * Penulisan dilakukan via RPC SECURITY DEFINER (update_event_details_field
   * / push_gallery_item) yang melakukan read-modify-write DALAM SATU
   * STATEMENT SQL di server — dua upload paralel tidak saling menimpa.
   * Antrean klien menjaga urutan antar-operasi dalam satu sesi.
   */
  const persistUrl = async (
    fieldName: keyof EventDetails,
    url: string,
    isGallery: boolean,
  ): Promise<boolean> => {
    try {
      if (!orderId) return false;

      const { error } = isGallery
        ? await enqueuePersist(() =>
            resolveDbClient().rpc('push_gallery_item', {
              p_order_id: orderId,
              p_url: url,
            }),
          )
        : await enqueuePersist(() =>
            resolveDbClient().rpc('update_event_details_field', {
              p_order_id: orderId,
              p_key: String(fieldName),
              p_value: url,
            }),
          );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Upload] Auto-save gagal:', error);
      return false;
    }
  };

  /** Munculkan modal crop; resolve dengan area piksel atau null saat dibatalkan. */
  const requestUserCrop = (
    file: File,
    rule: { aspect: number; title: string },
  ): Promise<CropAreaPixels | null> =>
    new Promise((resolve) => {
      setPendingCrop({ file, aspect: rule.aspect, title: rule.title, resolve });
    });

  /** Auto-cleanup: hapus objek R2 yang digantikan/dibuang dari form. */
  const cleanupOldObjects = async (urls: string[]): Promise<void> => {
    if (!orderId || urls.length === 0) return;
    try {
      const headers = await buildFunctionHeaders();
      await fetch(functionsUrl('r2-delete'), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, urls }),
      });
    } catch (error) {
      console.warn('[Upload] Pembersihan file lama gagal:', error);
    }
  };

  const handleFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof EventDetails,
    isGallery = false,
  ) => {
    const originalFile = e.target.files?.[0];
    // Reset nilai input agar memilih file yang SAMA lagi tetap memicu onChange
    // (browser tidak menembakkan event change untuk path file identik).
    e.target.value = '';
    if (!originalFile) return;
    if (!orderId) return toast.error('Sesi pesanan tidak ditemukan. Muat ulang halaman.');
    if (originalFile.size > MAX_FILE_SIZE) return toast.error('Ukuran file maksimal 8MB.');

    const isAudio = fieldName === 'audio_url' || originalFile.type.startsWith('audio/');
    const cropRule = !isAudio ? CROP_RULES[String(fieldName)] : undefined;

    // Modal crop memblok alur - spinner upload baru aktif setelah user selesai.
    let cropArea: CropRect | null = null;
    if (cropRule) {
      const area = await requestUserCrop(originalFile, cropRule);
      if (!area) return; // user membatalkan
      cropArea = area;
    }

    // Musik: coba konversi ke WebM/Opus di Web Worker (bila tak didukung -> pakai file asli).
    let mediaSource: Blob = originalFile;
    if (isAudio) {
      setConverting(true);
      setConvertPercent(0);
      try {
        const result = await convertToWebMAudio(originalFile, (pct) =>
          setConvertPercent(pct),
        );
        if (result.ok) {
          mediaSource = result.blob;
          console.info(
            `[AudioConvert] Output ${(result.blob.size / 1024).toFixed(0)}KB audio/webm.`,
          );
        } else {
          toast.warning(`Konversi musik dilewati (${result.reason}) — file asli digunakan.`);
        }
      } finally {
        setConverting(false);
        setConvertPercent(null);
      }
    }

    setUploading(true);
    setActiveUploadField(isGallery ? 'gallery' : String(fieldName));

    try {
      // --- Pemrosesan gambar sisi klien ---
      let workBlob: Blob = mediaSource;
      let workName =
        isAudio && mediaSource !== originalFile
          ? originalFile.name.replace(/\.[^.]+$/, '') + '.webm'
          : originalFile.name;

      if (!isAudio) {
        const limits = SIZE_LIMITS[String(fieldName)] ?? { maxWidth: 1400, maxHeight: 1400 };
        const processed = await processImage(originalFile, {
          crop: cropArea,
          maxWidth: limits.maxWidth,
          maxHeight: limits.maxHeight,
          quality: 0.82,
        });
        workBlob = processed.blob;
        const ext = processed.blob.type.includes('webp') ? '.webp' : '.png';
        workName = originalFile.name.replace(/\.[^.]+$/, '') + ext;
      }

      // --- Kirim ke R2 (presigned utama, fallback proxy) ---
      const bodyPayload = {
        orderId,
        fileName: workName,
        contentType: workBlob.type || 'application/octet-stream',
        prefix: imagePrefix,
      };

      let publicUrl = '';

      try {
      const { data, error } = await resolveDbClient().functions.invoke('r2-upload-url', {
        body: bodyPayload,
      });
        if (error) throw new Error(error.message);
        if (!data?.uploadUrl || !data?.publicUrl) throw new Error(data?.error || 'Presigned URL tidak valid.');

        const put = await fetch(data.uploadUrl, {
          method: 'PUT',
          body: workBlob,
          headers: data.contentType ? { 'Content-Type': data.contentType } : undefined,
        });
        if (!put.ok) throw new Error(`R2 menolak unggahan (${put.status}).`);

        publicUrl = data.publicUrl;
      } catch (directError) {
        console.warn('[Upload] Jalur langsung gagal, mencoba jalur cadangan:', directError);
      }

      if (!publicUrl) {
        const form = new FormData();
        form.append('file', workBlob, workName);
        form.append('orderId', orderId);
        form.append('prefix', imagePrefix);

        const headers = await buildFunctionHeaders();
        const response = await fetch(functionsUrl('r2-upload'), {
          method: 'POST',
          headers,
          body: form,
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.publicUrl) {
          throw new Error(data?.error || `Jalur cadangan juga gagal (${response.status}).`);
        }
        publicUrl = data.publicUrl;
      }

      // --- Tangkap URL lama sebelum state berubah (untuk pembersihan) ---
      const previousUrls: string[] = [];
      if (!isGallery && getFormData) {
        const prev = getFormData()?.[fieldName];
        if (
          typeof prev === 'string' &&
          prev &&
          prev !== publicUrl &&
          prev.includes(`/${orderId}/`)
        ) {
          previousUrls.push(prev);
        }
      }

      // --- Update state form agar preview instan ---
      if (isGallery) {
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), publicUrl] }));
      } else {
        setFormData(prev => ({ ...prev, [fieldName]: publicUrl }) as T);
      }

      // --- Auto-save ke database ---
      if (autoSave) {
        const saved = await persistUrl(fieldName, publicUrl, isGallery);
        if (saved) {
          toast.success(isGallery ? 'Foto ditambahkan & tersimpan.' : 'Berhasil diunggah & tersimpan.');
        } else {
          toast.warning('Terunggah, namun belum tersimpan - klik Simpan Perubahan untuk mencoba lagi.');
        }
      } else {
        toast.success(isGallery ? 'Foto ditambahkan!' : 'Upload berhasil!');
      }

      // --- Bersihkan file lama yang digantikan ---
      void cleanupOldObjects(previousUrls);
    } catch (err) {
      console.error('[Upload] Error:', err);
      toast.error('Gagal upload: ' + (err instanceof Error ? err.message : 'Kesalahan tidak diketahui.'));
    } finally {
      setUploading(false);
      setActiveUploadField(null);
    }
  };

  /**
   * Hapus musik: kosongkan state, patch '' ke event_details (auto-save),
   * lalu bersihkan objek lama di bucket R2 (fire-and-forget).
   */
  const removeAudio = async (): Promise<void> => {
    if (!orderId || removing) return;
    const oldUrl = getFormData?.()?.audio_url;

    setRemoving(true);
    try {
      setFormData(prev => ({ ...prev, audio_url: '' }) as T);
      const saved = await persistUrl('audio_url', '', false);

      if (typeof oldUrl === 'string' && oldUrl && oldUrl.includes(`/${orderId}/`)) {
        void cleanupOldObjects([oldUrl]);
      }

      if (saved) toast.success('Musik berhasil dihapus & tersimpan.');
      else toast.warning('Dihapus dari tampilan — klik Simpan Perubahan untuk mencoba lagi.');
    } finally {
      setRemoving(false);
    }
  };

  const cropModal: ReactNode = pendingCrop ? (
    <ImageCropModal
      file={pendingCrop.file}
      aspect={pendingCrop.aspect}
      title={pendingCrop.title}
      onCancel={() => {
        pendingCrop.resolve(null);
        setPendingCrop(null);
      }}
      onConfirm={(area) => {
        pendingCrop.resolve(area);
        setPendingCrop(null);
      }}
    />
  ) : null;

  return {
    uploading,
    setUploading,
    converting,
    convertPercent,
    removing,
    activeUploadField,
    handleFileUpload,
    removeAudio,
    cropModal,
  };
}
