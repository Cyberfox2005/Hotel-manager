import { useState } from "react";
import Button from "./Button";

export default function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "بحث...",
  onExport,
  onReset,
  children,
  extra,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1 max-w-md">
          <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-10 pl-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {children}

        <div className="flex flex-wrap gap-2 mr-auto">
          {extra && (
            <Button size="sm" variant="ghost" onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? "إخفاء الفلاتر" : "فلاتر متقدمة"}
            </Button>
          )}
          {onReset && (
            <Button size="sm" variant="outline" onClick={onReset}>إعادة تعيين</Button>
          )}
          {onExport && (
            <Button size="sm" variant="outline" onClick={onExport}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              تصدير CSV
            </Button>
          )}
        </div>
      </div>

      {showAdvanced && extra && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap gap-4">{extra}</div>
        </div>
      )}
    </div>
  );
}
