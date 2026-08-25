// ============================================================
// src/components/ui/SkeletonLoaders.tsx
// ------------------------------------------------------------
// Preset placeholder (skeleton) untuk tiap halaman. Memakai primitif
// Skeleton + Tailwind `animate-pulse` — pengganti spinner `Loader2`/border
// di seluruh full-page loading.
// ============================================================
import type { HTMLAttributes } from 'react';
import { Skeleton } from './Skeleton';

const cn = (...classes: (string | false | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');

/** Full-page spinner branded (ganti PageLoader di App.tsx). */
export function PageSkeleton({ className }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-gray-50 font-sans',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full bg-[#E59A59]/40" />
        <Skeleton className="h-4 w-44 rounded-full" />
      </div>
    </div>
  );
}

/** Statistik 3-item (hero HomePage). */
export function StatsSkeleton() {
  return (
    <div className="flex gap-2 md:gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-20 rounded-xl" />
      ))}
    </div>
  );
}

/** Kartu / katalog template (loading grid HomePage). */
export function TemplateCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-2.5 md:p-4 rounded-2xl shadow-sm border border-[#EBDFCE] flex flex-col items-start h-full"
        >
          <Skeleton variant="wave" className="w-full aspect-[4/3] rounded-xl mb-3 md:mb-4" />
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded mt-1" />
        </div>
      ))}
    </>
  );
}

/** Skeleton full-page dashboard mempelai (ganti `Memuat data...` Loader2). */
export function DashboardSkeleton() {
  return (
    <div className="flex h-dvh w-full font-sans bg-[#F1E8DC]">
      {/* Mobile header */}
      <div className="lg:hidden h-16 border-b border-[#E5CBA5] p-3 flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-6 w-40 rounded" />
      </div>
      {/* Sidebar desktop */}
      <div className="hidden lg:block w-64 border-r border-[#E5CBA5] p-4">
        <Skeleton className="h-8 w-48 rounded mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </div>
      </div>
      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6 max-w-3xl">
          <Skeleton className="h-6 w-56 rounded" />
          <Skeleton className="h-4 w-64 rounded" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </main>
    </div>
  );
}

/** Skeleton undangan tamu (ganti Loader2 + Suspense fallback InvitationPage). */
export function InvitationSkeleton() {
  return (
    <div className="h-screen flex flex-col items-center justify-center font-sans text-gray-500 bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="h-4 w-44 rounded" />
        <Skeleton className="h-3 w-60 rounded mt-1" />
        <Skeleton className="h-3 w-40 rounded mt-1" />
      </div>
    </div>
  );
}

/** Skeleton status pembayaran (ganti circle animate-pulse PaymentStatusPage). */
export function PaymentStatusSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1E8DC]">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full bg-[#E59A59]/40" />
        <Skeleton className="h-4 w-48 rounded" />
      </div>
    </div>
  );
}

export default Skeleton;
