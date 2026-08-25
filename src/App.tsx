// ============================================================
// src/App.tsx
// ------------------------------------------------------------
// Root komponen aplikasi & router: definisi seluruh route (publik, demo, undangan, dashboard, admin) dengan lazy loading per halaman.
// Dipakai di  : main.tsx
// Keterikatan : react-router-dom; layouts/PublicLayout, layouts/InvitationLayout; seluruh pages/*
// ============================================================

import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

/* --- IMPORT APP-WIDE PROVIDERS --- */
import { ToastProvider } from './components/GlobalToast';
import { LanguageProvider } from './i18n';
import ErrorBoundary from './components/ErrorBoundary';
import { PageSkeleton } from './components/ui/SkeletonLoaders';

/* --- IMPORT LAYOUTS --- */
import PublicLayout from './layouts/PublicLayout';
import InvitationLayout from './layouts/InvitationLayout';

/* --- PAGES (lazy loaded — code splitting per route) --- */
const HomePage = lazy(() => import('./pages/HomePage'));
const OrderPage = lazy(() => import('./pages/OrderPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const CustomerLoginPage = lazy(() => import('./pages/CustomerLoginPage'));
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage'));
const InvitationPage = lazy(() => import('./pages/InvitationPage'));
const TemplateDemoPage = lazy(() => import('./pages/TemplateDemoPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));
const PaymentStatusPage = lazy(() => import('./pages/PaymentStatusPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

/* Fallback saat chunk halaman sedang di-download */
function PageLoader() {
  return <PageSkeleton />;
}

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* GROUP 1: PUBLIC PAGES (Pakai Navbar Coklat) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/order" element={<OrderPage />} />
                <Route path="/order/success" element={<OrderSuccessPage />} />
                <Route path="/login" element={<CustomerLoginPage />} />

                <Route path="/payment-status" element={<PaymentStatusPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />

              {/* GROUP 2: TEMPLATE DEMO */}
              <Route path="/demo/:slug" element={<TemplateDemoPage />} />

              {/* GROUP 3: UNDANGAN TAMU (Fullscreen) */}
              <Route element={<InvitationLayout />}>
                <Route path="/wedding/:slug" element={<InvitationPage />} />
              </Route>

              {/* GROUP 4: DASHBOARD (Fullscreen app shell, tanpa Navbar —
                  sidebar punya tombol Keluar sendiri) */}
              <Route path="/dashboard/:orderId" element={<CustomerDashboardPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;