'use client';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function IArrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === 'left' ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

/**
 * Tạo dãy số trang hiển thị, chèn '...' khi nhiều trang.
 * Ví dụ trang 5/10: 1 … 4 5 6 … 10
 */
function buildPages(current: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const pages = buildPages(page, totalPages);

  const btnBase =
    'flex h-10 w-10 items-center justify-center rounded-md border text-sm font-semibold transition';

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${btnBase} border-gray-200 bg-white text-gray-500 hover:border-[#007e42] hover:text-[#007e42] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500`}
        aria-label="Trang trước"
      >
        <IArrow dir="left" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`dots-${i}`}
            className="flex h-10 w-10 items-center justify-center text-sm text-gray-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={
              p === page
                ? `${btnBase} border-[#007e42] bg-[#007e42] text-white shadow-sm`
                : `${btnBase} border-gray-200 bg-white text-gray-700 hover:border-[#007e42] hover:text-[#007e42]`
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
        className={`${btnBase} border-gray-200 bg-white text-gray-500 hover:border-[#007e42] hover:text-[#007e42] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500`}
        aria-label="Trang sau"
      >
        <IArrow dir="right" />
      </button>
    </div>
  );
}
