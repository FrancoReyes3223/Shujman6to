import { useTranslation } from "react-i18next";
import { PAGE_SIZES, SortDir } from "../lib/useTableControls";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

export type StatusOption = { value: string; label: string };

export function TableToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  statusOptions,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: StatusOption[];
}) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "0.75rem 1.5rem",
        flexWrap: "wrap",
        alignItems: "center",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div style={{ position: "relative", flex: "1 1 220px", minWidth: "180px" }}>
        <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", pointerEvents: "none", display: "flex" }}>
          <SearchIcon />
        </span>
        <input
          className="form-input"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          placeholder={t("tbl_search", "Search…")}
          style={{ paddingLeft: "2.25rem", margin: 0 }}
        />
      </div>
      <select
        className="form-input"
        value={statusFilter}
        onChange={e => onStatusChange(e.target.value)}
        style={{ width: "auto", minWidth: "160px", margin: 0 }}
      >
        <option value="all">{t("tbl_filter_all", "All statuses")}</option>
        {statusOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function SortHeader({
  label,
  columnKey,
  sortKey,
  sortDir,
  onSort,
  style,
}: {
  label: string;
  columnKey: string;
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
  style?: React.CSSProperties;
}) {
  const active = sortKey === columnKey;
  return (
    <th
      onClick={() => onSort(columnKey)}
      style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", ...style }}
      title={label}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
        {label}
        <span style={{ opacity: active ? 1 : 0.3, fontSize: "0.7em" }}>
          {active ? (sortDir === "asc" ? "▲" : "▼") : "▲"}
        </span>
      </span>
    </th>
  );
}

export function TablePagination({
  page,
  pageCount,
  pageSize,
  onPageSizeChange,
  onPrev,
  onNext,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        gap: "0.75rem",
        padding: "0.75rem 1.5rem",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: "1px solid var(--border-color)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
        <label htmlFor="page-size">{t("tbl_per_page", "Per page")}</label>
        <select
          id="page-size"
          className="form-input"
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          style={{ width: "auto", margin: 0, padding: "0.3rem 0.5rem" }}
        >
          {PAGE_SIZES.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          {t("tbl_page_of", "Page {{page}} of {{count}}", { page, count: pageCount })}
        </span>
        <button
          className="btn-primary"
          onClick={onPrev}
          disabled={page <= 1}
          style={{ width: "auto", margin: 0, padding: "0.4rem 0.9rem", opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}
        >
          {t("tbl_prev", "Previous")}
        </button>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={page >= pageCount}
          style={{ width: "auto", margin: 0, padding: "0.4rem 0.9rem", opacity: page >= pageCount ? 0.5 : 1, cursor: page >= pageCount ? "not-allowed" : "pointer" }}
        >
          {t("tbl_next", "Next")}
        </button>
      </div>
    </div>
  );
}
