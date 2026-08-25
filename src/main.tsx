// ============================================================
// src/main.tsx
// ------------------------------------------------------------
// Entry point aplikasi: mount <App> ke DOM, pasang BrowserRouter, muat index.css (Tailwind), dan inisialisasi Midtrans Snap.
// Dipakai di  : -(entry point, direferensikan index.html)
// Keterikatan : react-dom, react-router-dom, ./App, lib/midtransConfig
// ============================================================

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css' // Import CSS yang sudah ada Tailwind
import { initializeMidtrans } from './lib/midtransConfig'
import { initMonitoring } from './lib/monitoring'

// Monitoring (Sentry) — no-op bila VITE_SENTRY_DSN tidak diset.
void initMonitoring();

// Initialize Midtrans payment gateway if configured
if (import.meta.env.VITE_MIDTRANS_CLIENT_KEY) {
  initializeMidtrans();
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* BrowserRouter membungkus seluruh aplikasi */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );
}