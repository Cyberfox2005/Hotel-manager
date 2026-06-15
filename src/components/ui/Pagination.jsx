import Button from "./Button";

export default function Pagination({ page, totalPages, total, pageSize, onPageChange, onPageSizeChange }) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
      <p className="text-sm text-slate-500">
        عرض {from}–{to} من {total}
      </p>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(e.target.value)}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {[5, 10, 25, 50].map((n) => (
            <option key={n} value={n}>{n} / صفحة</option>
          ))}
        </select>
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          السابق
        </Button>
        <span className="text-sm text-slate-600">{page} / {totalPages}</span>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          التالي
        </Button>
      </div>
    </div>
  );
}
