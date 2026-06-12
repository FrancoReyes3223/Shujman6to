import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export const PAGE_SIZES = [15, 30, 45] as const;

type Options<T> = {
  searchFields: (keyof T)[];
  statusField: keyof T;
  numericFields?: (keyof T)[];
};

/** Parse a string like "$1,200.00" into a number for numeric sorting. */
function parseNumeric(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[$,\s]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Client-side search + status filter + sorting + pagination for table data.
 * All data is already loaded; this only derives the visible slice.
 */
export function useTableControls<T extends Record<string, unknown>>(
  items: T[],
  { searchFields, statusField, numericFields = [] }: Options<T>,
) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [pageSize, setPageSizeRaw] = useState<number>(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  const toggleSort = (rawKey: string) => {
    const key = rawKey as keyof T;
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const setSearch = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const setStatus = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const setPageSize = (size: number) => {
    setPageSizeRaw(size);
    setPage(1);
  };

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = items.filter(item => {
      const matchesQuery =
        q === "" ||
        searchFields.some(f =>
          String(item[f] ?? "").toLowerCase().includes(q),
        );
      const matchesStatus =
        statusFilter === "all" || String(item[statusField]) === statusFilter;
      return matchesQuery && matchesStatus;
    });

    if (sortKey) {
      const numeric = numericFields.includes(sortKey);
      result = [...result].sort((a, b) => {
        let cmp: number;
        if (numeric) {
          cmp = parseNumeric(a[sortKey]) - parseNumeric(b[sortKey]);
        } else {
          cmp = String(a[sortKey] ?? "").localeCompare(
            String(b[sortKey] ?? ""),
            undefined,
            { sensitivity: "base", numeric: true },
          );
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [items, query, statusFilter, sortKey, sortDir, searchFields, statusField, numericFields]);

  const total = filteredSorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filteredSorted.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredSorted, safePage, pageSize],
  );

  return {
    query,
    setQuery: setSearch,
    statusFilter,
    setStatusFilter: setStatus,
    sortKey,
    sortDir,
    toggleSort,
    pageSize,
    setPageSize,
    page: safePage,
    setPage,
    pageCount,
    total,
    paged,
  };
}
