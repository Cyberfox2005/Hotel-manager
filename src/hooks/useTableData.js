import { useMemo, useState, useCallback } from "react";
import { compareValues } from "../utils/tableUtils";
import { getSettings } from "../utils/settings";

export function useTableData(data, { filterFn, defaultSortKey = "id", defaultSortDir = "asc" } = {}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState({ key: defaultSortKey, dir: defaultSortDir });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => getSettings().pageSize);
  const [filters, setFilters] = useState({});

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const resetAll = useCallback(() => {
    setSearch("");
    setFilters({});
    setSort({ key: defaultSortKey, dir: defaultSortDir });
    setPage(1);
  }, [defaultSortKey, defaultSortDir]);

  const toggleSort = useCallback((key) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      if (filterFn && !filterFn(item, filters, search)) return false;
      return true;
    });
  }, [data, filterFn, filters, search]);

  const sorted = useMemo(() => {
    const { key, dir } = sort;
    return [...filtered].sort((a, b) => compareValues(a[key], b[key], dir));
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const paginated = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize, totalPages]);

  return {
    rows: paginated,
    filteredRows: sorted,
    total: filtered.length,
    search,
    setSearch: (v) => { setSearch(v); setPage(1); },
    sort,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize: (v) => { setPageSize(Number(v)); setPage(1); },
    totalPages,
    filters,
    setFilter,
    setFilters,
    resetAll,
  };
}
