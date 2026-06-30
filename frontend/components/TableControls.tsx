import { useTranslation } from "react-i18next";
import { PAGE_SIZES, SortDir } from "../lib/useTableControls";

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export type StatusOption = { value: string; label: string };
export type SearchColumnOption = { value: string; label: string };

export function TableToolbar({
  query,
  onQueryChange,
  statusFilter,
  onStatusChange,
  statusOptions,
  searchColumn,
  onSearchColumnChange,
  searchColumnOptions,
  onExport,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  statusOptions: StatusOption[];
  searchColumn?: string;
  onSearchColumnChange?: (value: string) => void;
  searchColumnOptions?: SearchColumnOption[];
  onExport?: () => void;
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
      {searchColumnOptions && searchColumnOptions.length > 0 && (
        <select
          className="form-input"
          value={searchColumn}
          onChange={e => onSearchColumnChange?.(e.target.value)}
          style={{ width: "auto", minWidth: "150px", margin: 0 }}
          title={t("tbl_search_in", "Search in")}
        >
          <option value="all">{t("tbl_search_all_columns", "All columns")}</option>
          {searchColumnOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}
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
      {onExport && (
        <button
          className="btn-primary"
          onClick={onExport}
          style={{ width: "auto", margin: 0, marginLeft: "auto", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          title={t("tbl_export_csv", "Export CSV")}
        >
          <DownloadIcon />
          {t("tbl_export_csv", "Export CSV")}
        </button>
      )}
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
