// ============================================================
// src/utils/imageProcessing.ts
// ------------------------------------------------------------
// Pemrosesan gambar sisi klien via Canvas API: crop area -> scale batas resolusi -> encode WebP (hemat storage R2).
// Dipakai di  : hooks/useFileUpload.tsx
// Keterikatan : -(Canvas API murni, tanpa dependency)
// ============================================================

// Pemrosesan gambar sisi klien memakai Canvas API (tanpa dependensi):
// crop area tertentu → scale ke batas resolusi → encode WebP.
//
// Dipakai oleh alur upload foto (useFileUpload) sebelum file dikirim
// ke Cloudflare R2 agar hemat storage & loading tema lebih cepat.

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessImageOptions {
  /** Area sumber dalam piksel citra asli (hasil cropper). Tanpa ini = citra utuh. */
  crop?: CropRect | null;
  /** Batas lebar hasil (rasio dipertahankan). */
  maxWidth?: number;
  /** Batas tinggi hasil (rasio dipertahankan). */
  maxHeight?: number;
  /** Kualitas encoding WebP (0–1). Default 0.82. */
  quality?: number;
}

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
}

function loadImage(source: File | Blob, objectUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Gambar tidak dapat dibaca.'));
    img.src = objectUrl;
    void source; // sumber sudah direpresentasikan lewat objectUrl
  });
}

/**
 * Proses satu gambar: crop opsional → scale opsional → WebP.
 * Selalu mengembalikan blob valid; bila browser tidak mendukung encoder
 * WebP, fallback otomatis ke PNG (pemanggil membaca blob.type).
 */
export async function processImage(
  source: File | Blob,
  options: ProcessImageOptions = {},
): Promise<ProcessedImage> {
  const { crop = null, maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options;

  const objectUrl = URL.createObjectURL(source);
  try {
    const img = await loadImage(source, objectUrl);

    const sx = Math.max(0, Math.round(crop?.x ?? 0));
    const sy = Math.max(0, Math.round(crop?.y ?? 0));
    const sw = Math.max(1, Math.round(crop ? crop.width : img.naturalWidth));
    const sh = Math.max(1, Math.round(crop ? crop.height : img.naturalHeight));

    let dw = sw;
    let dh = sh;
    if (dw > maxWidth) {
      dh = dh * (maxWidth / dw);
      dw = maxWidth;
    }
    if (dh > maxHeight) {
      dw = dw * (maxHeight / dh);
      dh = maxHeight;
    }
    dw = Math.max(1, Math.round(dw));
    dh = Math.max(1, Math.round(dh));

    const canvas = document.createElement('canvas');
    canvas.width = dw;
    canvas.height = dh;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas tidak didukung browser ini.');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    );
    if (!blob) throw new Error('Konversi WebP gagal di browser ini.');

    return { blob, width: dw, height: dh };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Kompres tanpa mengubah rasio — untuk foto galeri. */
export function compressToWebP(
  source: File | Blob,
  maxLongSide = 1400,
  quality = 0.82,
): Promise<ProcessedImage> {
  return processImage(source, { maxWidth: maxLongSide, maxHeight: maxLongSide, quality });
}
