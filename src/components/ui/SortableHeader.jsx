export default function SortableHeader({ label, sortKey, currentSort, onSort, className = "" }) {
  const active = currentSort.key === sortKey;
  const arrow = active ? (currentSort.dir === "asc" ? " ↑" : " ↓") : "";

  return (
    <th
      className={`cursor-pointer select-none pb-3 text-right font-semibold text-slate-500 transition-colors hover:text-slate-800 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {label}{arrow}
    </th>
  );
}
