"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { useWorkspace } from "../lib/WorkspaceContext";

type Member = {
  id: string;
  role: "OWNER" | "ADMIN" | "USER";
  joinedAt: string;
  user: { id: string; email: string; fullName?: string | null };
};

const ROLE_COLORS: Record<string, string> = { OWNER: "#f59e0b", ADMIN: "#6366f1", USER: "#10b981" };

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export default function WorkspaceMembersView() {
  const { t } = useTranslation();
  const { activeWorkspace } = useWorkspace();

  const roleLabels: Record<string, string> = {
    OWNER: t("role_owner", "Owner"),
    ADMIN: t("role_admin", "Admin"),
    USER:  t("role_user", "User"),
  };

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "USER">("USER");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const isOwner = activeWorkspace?.role === "OWNER";
  const workspaceId = activeWorkspace?.id;

  const fetchMembers = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMembers(data.data.members ?? []);
      } else {
        setError(data.message ?? t("error_load_members", "Error loading members"));
      }
    } catch {
      setError(t("server_connection_error", "Could not connect to the server"));
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleInvite() {
    if (!inviteEmail.trim() || !workspaceId) return;
    setInviteLoading(true);
    setInviteError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Error al invitar");
      setInviteEmail("");
      setInviteRole("USER");
      setShowInvite(false);
      fetchMembers();
    } catch (e: unknown) {
      setInviteError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleChangeRole(userId: string, newRole: "ADMIN" | "USER") {
    if (!workspaceId) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/workspaces/${workspaceId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      fetchMembers();
    } catch { /* silenciar */ }
  }

  async function handleRemove(userId: string) {
    if (!workspaceId) return;
    try {
      const token = getToken();
      await fetch(`${API_BASE}/workspaces/${workspaceId}/members/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMembers();
    } catch { /* silenciar */ }
  }

  if (!activeWorkspace) {
    return (
      <div className="dashboard-view">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "5rem", color: "var(--text-secondary)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</div>
          <h2 style={{ color: "var(--foreground)" }}>{t("no_workspace_selected", "Seleccioná un workspace")}</h2>
          <p style={{ marginTop: "0.5rem", opacity: 0.7 }}>{t("no_workspace_desc", "Creá o seleccioná una empresa desde el menú lateral.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h1>{t("members_title", "Miembros del workspace")}</h1>
        </div>
        <p>
          <strong>{activeWorkspace.name}</strong>
          {" — "}
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {t("members_desc", "Gestioná quién tiene acceso y cuál es su rol.")}
          </span>
        </p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>{t("members_list_title", "Miembros")}</h2>
          {isOwner && (
            <button
              className="btn-primary"
              style={{ width: "auto", margin: 0, padding: "0.5rem 1rem" }}
              onClick={() => setShowInvite(true)}
            >
              {t("members_invite_btn", "+ Invitar miembro")}
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ padding: "2rem", color: "var(--text-secondary)", textAlign: "center" }}>
            {t("loading", "Cargando...")}
          </p>
        ) : error ? (
          <p style={{ padding: "2rem", color: "var(--error)", textAlign: "center" }}>{error}</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("members_col_name", "Nombre")}</th>
                <th>{t("members_col_email", "Email")}</th>
                <th>{t("members_col_role", "Rol")}</th>
                <th>{t("members_col_joined", "Miembro desde")}</th>
                {isOwner && <th style={{ width: "100px", textAlign: "center" }}>{t("col_actions", "Acciones")}</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500 }}>{m.user.fullName || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{m.user.email}</td>
                  <td>
                    <span style={{
                      fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "999px",
                      background: `${ROLE_COLORS[m.role]}22`, color: ROLE_COLORS[m.role], border: `1px solid ${ROLE_COLORS[m.role]}55`
                    }}>
                      {roleLabels[m.role]}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                    {new Date(m.joinedAt).toLocaleDateString("es-AR")}
                  </td>
                  {isOwner && m.role !== "OWNER" && (
                    <td style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                      <select
                        className="form-input"
                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem", width: "auto" }}
                        value={m.role}
                        onChange={(e) => handleChangeRole(m.user.id, e.target.value as "ADMIN" | "USER")}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="USER">Usuario</option>
                      </select>
                      <button
                        className="btn-action"
                        onClick={() => handleRemove(m.user.id)}
                        title={t("members_remove_btn", "Eliminar miembro")}
                        style={{ cursor: "pointer", color: "var(--error)", borderColor: "var(--error)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </button>
                    </td>
                  )}
                  {isOwner && m.role === "OWNER" && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal invitar */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal-content" style={{ maxWidth: "460px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("members_invite_title", "Invitar miembro")}</h2>
              <button className="btn-close" onClick={() => setShowInvite(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t("members_email_label", "Email del usuario")}</label>
                <input
                  className="form-input"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t("placeholder_invite_email", "user@example.com")}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>{t("members_role_label", "Rol")}</label>
                <select className="form-input" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "ADMIN" | "USER")}>
                  <option value="USER">{t("option_user_role", "User — view only")}</option>
                  <option value="ADMIN">{t("option_admin_role", "Admin — can edit data")}</option>
                </select>
              </div>
              {inviteError && <p style={{ color: "var(--error)", fontSize: "0.875rem" }}>{inviteError}</p>}
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", width: "auto", margin: 0, padding: "0.5rem 1.25rem" }}
                onClick={() => setShowInvite(false)}
                disabled={inviteLoading}
              >
                {t("btn_cancel", "Cancelar")}
              </button>
              <button
                className="btn-primary"
                style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem", opacity: inviteLoading ? 0.7 : 1 }}
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviteLoading}
              >
                {inviteLoading ? t("inviting", "Invitando...") : t("members_invite_btn", "+ Invitar miembro")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
