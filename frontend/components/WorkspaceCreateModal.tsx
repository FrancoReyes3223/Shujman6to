"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { useWorkspace } from "../lib/WorkspaceContext";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

type Props = {
  onClose: () => void;
};

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export default function WorkspaceCreateModal({ onClose }: Props) {
  const { t } = useTranslation();
  const { refreshWorkspaces, setActiveWorkspace } = useWorkspace();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/workspaces`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Error al crear workspace");

      // Refrescar lista y activar el nuevo workspace
      await refreshWorkspaces();
      // El nuevo workspace es el que acabamos de crear — buscarlo por nombre/id
      if (data.data) {
        setActiveWorkspace({
          id: data.data.id,
          name: data.data.name,
          description: data.data.description,
          createdAt: data.data.createdAt,
          role: "OWNER",
        });
      }
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
          <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {t("ws_create_title", "Crear empresa")}
          </h2>
          <button className="btn-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem", lineHeight: 1.6 }}>
            {t("ws_create_desc", "Creá un workspace para tu empresa. Vas a ser asignado automáticamente como Owner.")}
          </p>

          <div className="form-group">
            <label>{t("ws_name_label", "Nombre de la empresa")} <span style={{ color: "var(--error)" }}>*</span></label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ws_name_placeholder", "Ej: Acme Corp")}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="form-group">
            <label>{t("ws_desc_label", "Descripción")} <span style={{ color: "var(--text-secondary)", fontWeight: 400, fontSize: "0.8rem" }}>({t("optional", "opcional")})</span></label>
            <input
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("ws_desc_placeholder", "Breve descripción de la empresa")}
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
            style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem", opacity: loading ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
          >
            {loading ? t("creating", "Creando...") : t("ws_create_btn", "Crear empresa")}
          </button>
        </div>
      </div>
    </div>
  );
}
