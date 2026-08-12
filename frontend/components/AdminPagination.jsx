"use client";

// BUG-040: phân trang dùng chung cho các trang admin (users/posts/reports)
export default function AdminPagination({ page, totalPages, total, onPageChange, loading }) {
  // Review S5: khi xóa item cuối của trang cuối → totalPages giảm, page vượt biên.
  // Clamp tự động về trang cuối hợp lệ.
  if (totalPages > 0 && page > totalPages) {
    onPageChange(totalPages);
    return null;
  }
  if (!totalPages || totalPages <= 1) return null;

  const btnBase = 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center justify-between pt-4 pb-1">
      <p className="text-xs text-slate-500">
        Trang {page} / {totalPages}
        {typeof total === 'number' && <span className="ml-2">· {total} mục</span>}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || loading}
          className={`${btnBase} hover:bg-white/10 text-slate-400 hover:text-white`}
        >
          ← Trước
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || loading}
          className={`${btnBase} bg-violet-500/15 text-violet-300 border border-violet-500/30 hover:bg-violet-500/25`}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
