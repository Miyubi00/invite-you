// ============================================================
// src/components/ui/SkeletonImage.tsx
// ------------------------------------------------------------
// Kombinasi Skeleton overlay + <img>: tampilkan shimmer (wave)
// sampai gambar selesai dimuat, lalu fade-in. Cocok untuk kartu
// katalog / galeri agar tidak ada "flash" kosong.
// ============================================================
import { useState, type ImgHTMLAttributes } from 'react';
import { Skeleton } from './Skeleton';

export interface SkeletonImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Dipanggil setelah gambar selesai dimuat. */
  onLoadingComplete?: () => void;
}

export function SkeletonImage({
  src,
  alt,
  className,
  onLoadingComplete,
  ...rest
}: SkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && (
        <Skeleton
          variant="wave"
          className="absolute inset-0 w-full h-full"
          aria-label={alt ? `memuat ${alt}` : 'memuat gambar'}
        />
      )}
      <img
        {...rest}
        src={src}
        alt={alt || ''}
        loading="lazy"
        decoding="async"
        onLoad={() => {
          setLoaded(true);
          onLoadingComplete?.();
        }}
        className={[
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className ?? '',
        ].join(' ')}
      />
    </>
  );
}

export default SkeletonImage;
