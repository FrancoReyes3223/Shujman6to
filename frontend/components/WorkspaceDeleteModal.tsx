"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { useWorkspace, Workspace } from "../lib/WorkspaceContext";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

type Props = {
  workspace: Workspace;
  onClose: () => void;
};

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export default function WorkspaceDeleteModal({ workspace, onClose }: Props) {
  const { t } = useTranslation();
  const { refreshWorkspaces } = useWorkspace();

  const [confirmName, setConfirmName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirmName.trim() === workspace.name && !loading;

  async function handleDelete() {
    if (confirmName.trim() !== workspace.name) return;
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/workspaces/${workspace.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Error al eliminar workspace");

      await refreshWorkspaces();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "480px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--error)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {t("ws_delete_title", "Delete workspace")}
          </h2>
          <button className="btn-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <p
            style={{
              color: "var(--error)",
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.25)",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            {t(
              "ws_delete_warning",
              "This action is irreversible. All associated data — employees, products, company and members — will be permanently deleted."
            )}
          </p>

          <div className="form-group">
            <label>
              {t("ws_delete_confirm_label", "Type")}{" "}
              <strong style={{ color: "var(--foreground)" }}>{workspace.name}</strong>{" "}
              {t("ws_delete_confirm_label_suffix", "to confirm")}
            </label>
            <input
              className="form-input"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={workspace.name}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && canDelete && handleDelete()}
            />
          </div>

          {error && (
            <p style={{ color: "var(--error)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              {error}
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-primary"
            style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", width: "auto", margin: 0, padding: "0.5rem 1.25rem" }}
            onClick={onClose}
            disabled={loading}
          >
            {t("btn_cancel", "Cancelar")}
          </button>
          <button
            className="btn-primary"
            style={{
              background: "var(--error)",
              boxShadow: "none",
              width: "auto",
              margin: 0,
              padding: "0.5rem 1.25rem",
              opacity: canDelete ? 1 : 0.5,
              cursor: canDelete ? "pointer" : "not-allowed",
            }}
            onClick={handleDelete}
            disabled={!canDelete}
          >
            {loading ? t("deleting", "Deleting...") : t("ws_delete_btn", "Delete workspace")}
          </button>
        </div>
      </div>
    </div>
  );
}
