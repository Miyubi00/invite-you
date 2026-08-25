import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "../../i18n";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZES = [10, 25, 50];

function buildPageNumbers(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "…")[] = [1];
  if (page > 3) pages.push("…");
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push("…");
  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { t, language } = useTranslation();
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const navButton =
    "grid h-8 min-w-8 place-items-center rounded-xl px-2 text-xs font-bold transition active:scale-95";
  const idleButton = `${navButton} border border-[#EBDFCE] bg-white text-stone-600 hover:bg-[#FAF6EE] hover:text-[#712E1E]`;

  return (
    <div className="flex flex-col gap-3 border-t border-[#EBDFCE] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-stone-500">
          {language === 'en' ? (
            <>
              Showing <span className="font-bold text-stone-700">{start}–{end}</span> of{" "}
              <span className="font-bold text-stone-700">{total}</span> entries
            </>
          ) : (
            <>
              Menampilkan <span className="font-bold text-stone-700">{start}–{end}</span> dari{" "}
              <span className="font-bold text-stone-700">{total}</span> entri
            </>
          )}
        </p>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-8 rounded-xl border border-[#EBDFCE] bg-[#FAF6EE] px-2 text-xs font-medium text-stone-800 outline-none transition focus:border-[#E59A59] focus:bg-white focus:ring-2 focus:ring-[#E59A59]/20"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} {language === 'en' ? '/ page' : '/ halaman'}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={`${idleButton} ${page <= 1 ? "cursor-not-allowed opacity-40" : ""}`}
          title={t('common.prev')}
        >
          <ChevronLeft size={14} />
        </button>

        {buildPageNumbers(page, totalPages).map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-stone-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={
                p === page
                  ? `${navButton} bg-[#712E1E] text-white shadow-sm`
                  : idleButton
              }
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={`${idleButton} ${page >= totalPages ? "cursor-not-allowed opacity-40" : ""}`}
          title={t('common.next')}
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
