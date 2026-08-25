// ============================================================
// src/vite-env.d.ts
// ------------------------------------------------------------
// Deklarasi tipe bawaan Vite untuk import.meta.env dan asset.
// Dipakai di  : -(tipe global, tidak diimpor)
// Keterikatan : vite/client
// ============================================================

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_MIDTRANS_CLIENT_KEY?: string;
  readonly VITE_MIDTRANS_ENVIRONMENT?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_ANALYTICS_ID?: string;
  readonly VITE_FEATURE_FLAGS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// --- Midtrans Snap widget global types ---
interface SnapResult {
  order_id: string;
  status_code?: string;
  transaction_status?: string;
  [key: string]: unknown;
}

interface SnapOptions {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

interface Window {
  snap?: {
    pay?: (token: string, options?: SnapOptions) => void;
  };
  // App-specific confirmation hook used by Navbar.
  confirm?: (message: string) => boolean;
}
