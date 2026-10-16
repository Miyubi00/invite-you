// ============================================================
// src/components/shared/SiteNoticeView.tsx
// ------------------------------------------------------------
// Render notice situs aktif (dari useSiteNotices) di halaman beranda:
// - Banner: polos di atas konten, tampil selama jadwalnya berjalan.
// - Modal popup: satu per kunjungan (prioritas maintenance > warning >
//   promo > info), bisa ditutup & ditandai sudah dilihat per session.
// Keterikatan : react-router-dom (Link), lucide-react, i18n,
// types/database (SiteNoticeRow).
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Gift, Info, Wrench, X } from 'lucide-react';
import type { SiteNoticeRow, SiteNoticeType } from '../../types/database';
import { useTranslation } from '../../i18n';

const TYPE_PRIORITY: Record<SiteNoticeType, number> = {
  maintenance: 3,
  warning: 2,
  promo: 1,
  info: 0,
};

const BANNER_STYLE: Record<SiteNoticeType, { wrap: string; icon: string; Icon: typeof Info }> = {
  info: {
    wrap: 'border-sky-200 bg-sky-50 text-sky-950',
    icon: 'bg-sky-100 text-sky-600',
    Icon: Info,
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-950',
    icon: 'bg-amber-100 text-amber-600',
    Icon: AlertTriangle,
  },
  maintenance: {
    wrap: 'border-rose-200 bg-rose-50 text-rose-950',
    icon: 'bg-rose-100 text-rose-600',
    Icon: Wrench,
  },
  promo: {
    wrap: 'border-[#712E1E] bg-gradient-to-r from-[#712E1E] to-[#9a4a2e] text-white shadow-sm',
    icon: 'bg-white/15 text-[#FFD5AF]',
    Icon: Gift,
  },
};

const MODAL_BADGE_STYLE: Record<SiteNoticeType, string> = {
  info: 'bg-sky-100 text-sky-600',
  warning: 'bg-amber-100 text-amber-600',
  maintenance: 'bg-rose-100 text-rose-600',
  promo: 'bg-[#F7EEE3] text-[#712E1E]',
};

const dismissedKey = (n: SiteNoticeRow) => `loverse_notice_dismissed:${n.id}`;

function isDismissed(n: SiteNoticeRow): boolean {
  try {
    return sessionStorage.getItem(dismissedKey(n)) === '1';
  } catch {
    return false;
  }
}

function NoticeModal({ notice, onClose }: { notice: SiteNoticeRow; onClose: () => void }) {
  const { t } = useTranslation();
  const style = MODAL_BADGE_STYLE[notice.type] ?? MODAL_BADGE_STYLE.info;
  const Icon = BANNER_STYLE[notice.type]?.Icon ?? Info;
  const href = notice.cta_href?.trim() ?? '';
  const isInternal = href.startsWith('/');
  const actionLabel = notice.cta_label?.trim() || t('siteNotice.ack');
  const ctaClass =
    'mt-5 flex h-10 w-full items-center justify-center rounded-xl bg-[#712E1E] text-sm font-bold text-white no-underline transition hover:bg-[#8a4030] active:scale-[0.98]';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(dismissedKey(notice), '1');
    } catch {
      /* sessionStorage tidak tersedia — tutup saja tanpa menyimpan */
    }
    onClose();
  };

  const renderCta = () => {
    if (!href) {
      return (
        <button type="button" onClick={dismiss} className={ctaClass}>
          {actionLabel}
        </button>
      );
    }
    if (isInternal) {
      return (
        <Link to={href} onClick={dismiss} className={ctaClass}>
          {actionLabel}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" onClick={dismiss} className={ctaClass}>
        {actionLabel}
      </a>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={notice.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={dismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style}`}>
            <Icon size={22} />
          </span>
          <button
            type="button"
            onClick={dismiss}
            aria-label={t('siteNotice.close')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          >
            <X size={17} />
          </button>
        </div>

        <h2 className="mt-4 font-brand text-xl font-bold text-[#712E1E]">{notice.title}</h2>
        {notice.body && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">{notice.body}</p>
        )}

        {renderCta()}
      </div>
    </div>
  );
}

export default function SiteNoticeView({ notices }: { notices: SiteNoticeRow[] }) {
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(() => new Set());

  // Banner: semua notice mode banner/both yang sedang berjalan.
  const banners = notices.filter((n) => n.mode === 'banner' || n.mode === 'both');

  // Modal: satu notice dengan prioritas tertinggi yang belum ditutup session ini.
  const modal = useMemo(() => {
    const candidates = notices
      .filter((n) => (n.mode === 'modal' || n.mode === 'both') && !dismissed.has(n.id) && !isDismissed(n))
      .sort((a, b) => (TYPE_PRIORITY[b.type] ?? 0) - (TYPE_PRIORITY[a.type] ?? 0));
    return candidates[0] ?? null;
  }, [notices, dismissed]);

  const dismissModal = () => {
    if (!modal) return;
    setDismissed((prev) => new Set(prev).add(modal.id));
  };

  return (
    <>
      {banners.length > 0 && (
        <div className="w-full space-y-2 bg-[#F1E8DC] px-4 pb-1 pt-4 sm:px-6 lg:px-8">
          {banners.map((n) => {
            const style = BANNER_STYLE[n.type] ?? BANNER_STYLE.info;
            const Icon = style.Icon;
            const href = n.cta_href?.trim() ?? '';
            const isInternal = href.startsWith('/');
            const actionLabel = n.cta_label?.trim();
            return (
              <div
                key={n.id}
                className={`mx-auto flex max-w-6xl items-start gap-3 rounded-xl border px-4 py-3 ${style.wrap}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.icon}`}>
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-bold">{n.title}</span>
                  {n.body && (
                    <span className="ml-1.5 opacity-90">
                      {n.body.split('\n')[0]}
                    </span>
                  )}
                  {href && actionLabel && (
                    isInternal ? (
                      <Link
                        to={href}
                        className="ml-2 inline-block font-bold underline underline-offset-2"
                      >
                        {actionLabel}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 inline-block font-bold underline underline-offset-2"
                      >
                        {actionLabel}
                      </a>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && <NoticeModal notice={modal} onClose={dismissModal} />}
    </>
  );
}
