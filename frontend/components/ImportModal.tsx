"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { exportCsv, CsvColumn } from "../lib/exportCsv";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

type ImportReport<T> = {
  inserted: number;
  skipped: number;
  duplicates: number;
  errors: { row: number; message: string }[];
  warnings: string[];
  created: T[];
};

type Props<T> = {
  title: string;
  endpoint: string;
  token: string;
  templateColumns: CsvColumn<T>[];
  templateFilename: string;
  onImported: (created: T[]) => void;
  onClose: () => void;
};

export default function ImportModal<T extends Record<string, unknown>>({
  title,
  endpoint,
  token,
  templateColumns,
  templateFilename,
  onImported,
  onClose,
}: Props<T>) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ImportReport<T> | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    setError("");
    setReport(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? t("save_error", "Could not save changes. Please try again."));
      const rep = data.data as ImportReport<T>;
      setReport(rep);
      if (rep.created.length) onImported(rep.created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("server_connection_error", "Could not connect to the server"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={() => !uploading && onClose()}>
      <div className="modal-content" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            {title}
          </h2>
          <button className="btn-close" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            {t("import_desc", "Upload a CSV or Excel file (.csv, .xlsx, .xls). The first row must contain the column headers.")}
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            <button
              className="btn-primary"
              style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem", opacity: uploading ? 0.7 : 1 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? t("importing", "Importing…") : t("import_choose_file", "Choose file")}
            </button>
            <button
              className="btn-primary"
              style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", width: "auto", margin: 0, padding: "0.5rem 1.25rem" }}
              onClick={() => exportCsv(templateFilename, templateColumns, [])}
              type="button"
            >
              {t("import_template", "Download template")}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
          </div>

          {fileName && !uploading && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>{fileName}</p>}

          {error && (
            <p style={{ color: "var(--error)", fontSize: "0.875rem", marginTop: "0.75rem" }}>{error}</p>
          )}

          {report && (
            <div style={{ marginTop: "1.25rem" }}>
              <p style={{ fontWeight: 600, color: report.inserted > 0 ? "var(--accent)" : "var(--foreground)" }}>
                {t("import_result", "Imported {{inserted}}, skipped {{skipped}}", { inserted: report.inserted, skipped: report.skipped })}
                {report.duplicates > 0 && ` · ${t("import_duplicates", "{{n}} duplicates", { n: report.duplicates })}`}
              </p>
              {report.warnings?.map((w, i) => (
                <p key={i} style={{ color: "var(--gold, #d97706)", fontSize: "0.85rem", marginTop: "0.4rem" }}>⚠ {w}</p>
              ))}
              {report.errors.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>{t("import_errors", "Rows with errors")}</p>
                  <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>
                    {report.errors.slice(0, 50).map((err, i) => (
                      <div key={i} style={{ color: "var(--error)", padding: "0.15rem 0" }}>
                        {t("import_row", "Row")} {err.row}: {err.message}
                      </div>
                    ))}
                    {report.errors.length > 50 && (
                      <div style={{ color: "var(--text-secondary)", paddingTop: "0.25rem" }}>… +{report.errors.length - 50}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-primary"
            style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem" }}
            onClick={onClose}
            disabled={uploading}
          >
            {report ? t("btn_close", "Close") : t("btn_cancel", "Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
