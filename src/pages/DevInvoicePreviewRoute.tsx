// ============================================================
// src/pages/DevInvoicePreviewRoute.tsx
// ------------------------------------------------------------
// Penjaga route /dev/invoice: hanya render di `npm run dev`.
// Di production: tampilkan NotFoundPage (tak ada kebocoran route dev).
// Keterikatan : react-router-dom; InvoicePreviewPage; NotFoundPage.
// ============================================================

import { lazy, Suspense } from 'react';
import { PageSkeleton } from '../components/ui/SkeletonLoaders';

const InvoicePreviewPage = lazy(() => import('./InvoicePreviewPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

export default function DevInvoicePreviewRoute() {
  if (!import.meta.env.DEV) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <NotFoundPage />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InvoicePreviewPage />
    </Suspense>
  );
}
