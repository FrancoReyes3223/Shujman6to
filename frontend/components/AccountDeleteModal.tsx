"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { API_BASE } from "../lib/api";
import { useUser } from "../lib/UserContext";

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

type Props = {
  email: string;
  token: string;
  onClose: () => void;
};

export default function AccountDeleteModal({ email, token, onClose }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { logout } = useUser();

  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canDelete = confirm.trim() === email && !loading;

  async function handleDelete() {
    if (confirm.trim() !== email) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/usuarios/perfil`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Error al eliminar la cuenta");
      logout();
      router.push("/");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error inesperado");
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
            {t("acc_delete_account", "Delete account")}
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
            {t("acc_delete_warning", "This action is irreversible. Your account and any company you own (with all its data) will be permanently deleted.")}
          </p>

          <div className="form-group">
            <label>
              {t("acc_delete_confirm_label", "Type your email")}{" "}
              <strong style={{ color: "var(--foreground)" }}>{email}</strong>{" "}
              {t("ws_delete_confirm_label_suffix", "to confirm")}
            </label>
            <input
              className="form-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={email}
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
            {t("btn_cancel", "Cancel")}
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
            {loading ? t("deleting", "Deleting...") : t("acc_delete_account", "Delete account")}
          </button>
        </div>
      </div>
    </div>
  );
}
