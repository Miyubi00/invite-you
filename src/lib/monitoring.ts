// ============================================================
// src/lib/monitoring.ts
// ------------------------------------------------------------
// Error monitoring via Sentry — opsional: hanya aktif bila env
// VITE_SENTRY_DSN tersedia. SDK dimuat via dynamic import sehingga
// bundle utama tidak terbebani saat monitoring tidak dipakai.
// Dipakai di  : main.tsx (init), components/ErrorBoundary
// Keterikatan : @sentry/react (lazy), env VITE_SENTRY_DSN
// ============================================================

type SentryClient = typeof import('@sentry/react');

let client: SentryClient | null = null;

/** Init monitoring — panggil sekali di entry point. No-op tanpa DSN. */
export async function initMonitoring(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  try {
    client = await import('@sentry/react');
    client.init({
      dsn,
      environment:
        (import.meta.env.VITE_MIDTRANS_ENVIRONMENT as string) === 'production'
          ? 'production'
          : 'development',
      // Performance tracing dimatikan agar hemat kuota gratis tier.
      tracesSampleRate: 0,
    });
  } catch (e) {
    console.warn('[monitoring] Gagal inisialisasi Sentry:', e);
  }
}

/** Laporkan error ke Sentry (jika aktif) — selalu ikut log ke console. */
export function captureError(error: unknown, context?: Record<string, unknown>): void {
  console.error('[monitoring]', error, context ?? '');
  client?.captureException(error, context ? { extra: context } : undefined);
}