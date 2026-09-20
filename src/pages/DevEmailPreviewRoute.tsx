// ============================================================
// src/pages/DevEmailPreviewRoute.tsx
// ------------------------------------------------------------
// Penjaga route /dev/email: hanya render di `npm run dev`.
// Di production: tampilkan NotFoundPage (tak ada kebocoran route dev).
// Keterikatan : react-router-dom; EmailPreviewPage; NotFoundPage.
// ============================================================

import { lazy, Suspense } from 'react';
import { PageSkeleton } from '../components/ui/SkeletonLoaders';

const EmailPreviewPage = lazy(() => import('./EmailPreviewPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

export default function DevEmailPreviewRoute() {
  if (!import.meta.env.DEV) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <NotFoundPage />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EmailPreviewPage />
    </Suspense>
  );
}
