"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { useWorkspace, Workspace } from "../lib/WorkspaceContext";
import WorkspaceCreateModal from "./WorkspaceCreateModal";
import WorkspaceDeleteModal from "./WorkspaceDeleteModal";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const ROLE_COLORS: Record<string, string> = { OWNER: "#f59e0b", ADMIN: "#6366f1", USER: "#10b981" };

function WorkspaceCard({
  ws,
  isActive,
  onSelect,
  onDelete,
  onLeave,
}: {
  ws: Workspace;
  isActive: boolean;
  onSelect: (ws: Workspace) => void;
  onDelete: (ws: Workspace) => void;
  onLeave: (ws: Workspace) => void;
}) {
  const { t } = useTranslation();
  const roleLabels: Record<string, string> = {
    OWNER: t("role_owner", "Owner"),
    ADMIN: t("role_admin", "Admin"),
    USER:  t("role_user", "User"),
  };
  const roleDescs: Record<string, string> = {
    OWNER: t("role_desc_owner", "Owner — full control of the company and its members"),
    ADMIN: t("role_desc_admin", "Admin — can edit company data"),
    USER:  t("role_desc_user", "User — can view data but not modify it"),
  };

  const initials = ws.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      onClick={() => onSelect(ws)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1.25rem 1.5rem",
        borderRadius: "0.75rem",
        border: isActive
          ? "2px solid var(--accent)"
          : "1px solid var(--border-color)",
        background: isActive
          ? "var(--accent-subtle, rgba(99,102,241,0.08))"
          : "var(--card, rgba(255,255,255,0.03))",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s, transform 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "3rem",
          height: "3rem",
          borderRadius: "0.75rem",
          background: `linear-gradient(135deg, ${ROLE_COLORS[ws.role]}66, ${ROLE_COLORS[ws.role]}33)`,
          border: `1px solid ${ROLE_COLORS[ws.role]}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          fontWeight: 700,
          color: ROLE_COLORS[ws.role],
          flexShrink: 0,
        }}
      >
        {initials || "?"}
      </div>

      {/* Info */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--foreground)" }}>
            {ws.name}
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "999px",
              background: `${ROLE_COLORS[ws.role]}22`,
              color: ROLE_COLORS[ws.role],
              border: `1px solid ${ROLE_COLORS[ws.role]}44`,
              flexShrink: 0,
            }}
          >
            {roleLabels[ws.role]}
          </span>
        </div>
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            marginTop: "0.2rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {roleDescs[ws.role]}
        </p>
        {ws.description && (
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              marginTop: "0.15rem",
              opacity: 0.7,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ws.description}
          </p>
        )}
      </div>

      {/* Delete (solo OWNER) */}
      {ws.role === "OWNER" && (
        <button
          title={t("ws_delete_btn", "Delete workspace")}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(ws);
          }}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2rem",
            height: "2rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--error)",
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220,38,38,0.1)";
            e.currentTarget.style.borderColor = "var(--error)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border-color)";
          }}
        >
          <TrashIcon />
        </button>
      )}

      {/* Leave (no-OWNER) */}
      {ws.role !== "OWNER" && (
        <button
          title={t("ws_leave_btn", "Leave")}
          onClick={(e) => {
            e.stopPropagation();
            onLeave(ws);
          }}
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.4rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--error)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(220,38,38,0.1)";
            e.currentTarget.style.borderColor = "var(--error)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border-color)";
          }}
        >
          {t("ws_leave_btn", "Leave")}
        </button>
      )}

      {/* Active indicator */}
      {isActive && (
        <div style={{ flexShrink: 0 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {t("workspace_active_label", "Active")}
          </span>
        </div>
      )}
    </div>
  );
}

function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

export default function WorkspacesView() {
  const { t } = useTranslation();
  const { workspaces, activeWorkspace, setActiveWorkspace, isLoading, refreshWorkspaces } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<Workspace | null>(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  const [justSwitched, setJustSwitched] = useState<string | null>(null);

  const roleLabels: Record<string, string> = {
    OWNER: t("role_owner", "Owner"),
    ADMIN: t("role_admin", "Admin"),
    USER:  t("role_user", "User"),
  };
  const roleDescs: Record<string, string> = {
    OWNER: t("role_desc_owner", "Owner — full control of the company and its members"),
    ADMIN: t("role_desc_admin", "Admin — can edit company data"),
    USER:  t("role_desc_user", "User — can view data but not modify it"),
  };

  function handleSelect(ws: Workspace) {
    setActiveWorkspace(ws);
    setJustSwitched(ws.id);
    setTimeout(() => setJustSwitched(null), 2000);
  }

  async function handleConfirmLeave() {
    if (!leaveTarget) return;
    setLeaveLoading(true);
    setLeaveError("");
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/workspaces/${leaveTarget.id}/leave`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Error al abandonar el workspace");
      await refreshWorkspaces();
      setLeaveTarget(null);
    } catch (e: unknown) {
      setLeaveError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLeaveLoading(false);
    }
  }

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <h1>{t("workspaces_title", "Mis Workspaces")}</h1>
        </div>
        <p>{t("workspaces_desc", "Seleccioná la empresa que querés administrar. Podés pertenecer a múltiples empresas con distintos roles.")}</p>
      </div>

      {/* Feedback toast */}
      {justSwitched && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "0.5rem",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "var(--accent)",
            fontSize: "0.875rem",
            fontWeight: 500,
            marginBottom: "1rem",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {t("workspace_switched", "Workspace activo cambiado correctamente")}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* Active workspace summary */}
        {activeWorkspace && (
          <div className="table-container" style={{ padding: "1.25rem 1.5rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
              {t("current_workspace", "Workspace activo")}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "2.25rem", height: "2.25rem", borderRadius: "0.5rem",
                  background: `linear-gradient(135deg, ${ROLE_COLORS[activeWorkspace.role]}66, ${ROLE_COLORS[activeWorkspace.role]}33)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 700, color: ROLE_COLORS[activeWorkspace.role],
                }}
              >
                {activeWorkspace.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")}
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: "1rem", color: "var(--foreground)" }}>{activeWorkspace.name}</span>
                <span
                  style={{
                    marginLeft: "0.6rem", fontSize: "0.65rem", fontWeight: 700,
                    padding: "0.15rem 0.5rem", borderRadius: "999px",
                    background: `${ROLE_COLORS[activeWorkspace.role]}22`,
                    color: ROLE_COLORS[activeWorkspace.role],
                    border: `1px solid ${ROLE_COLORS[activeWorkspace.role]}44`,
                  }}
                >
                  {roleLabels[activeWorkspace.role]}
                </span>
              </div>
              </div>
              {activeWorkspace.role === "OWNER" && (
                <button
                  className="btn-primary"
                  style={{
                    background: "var(--error)",
                    boxShadow: "none",
                    width: "auto",
                    margin: 0,
                    padding: "0.5rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    flexShrink: 0,
                  }}
                  onClick={() => setDeleteTarget(activeWorkspace)}
                >
                  <TrashIcon />
                  {t("ws_delete_btn", "Delete workspace")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Workspace list */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--foreground)" }}>
              {t("workspaces_list_title", "Todas tus empresas")}
              {!isLoading && (
                <span style={{ marginLeft: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 400 }}>
                  ({workspaces.length})
                </span>
              )}
            </h2>
            <button
              className="btn-primary"
              style={{ width: "auto", margin: 0, padding: "0.5rem 1rem" }}
              onClick={() => setShowCreate(true)}
            >
              {t("ws_create_btn", "+ Crear empresa")}
            </button>
          </div>

          {isLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
              {t("loading", "Cargando...")}
            </div>
          ) : workspaces.length === 0 ? (
            <div
              style={{
                padding: "3rem 2rem", textAlign: "center",
                border: "1px dashed var(--border-color)", borderRadius: "0.75rem",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</div>
              <h3 style={{ color: "var(--foreground)", marginBottom: "0.5rem" }}>
                {t("no_workspaces", "Todavía no pertenecés a ninguna empresa")}
              </h3>
              <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                {t("no_workspaces_desc", "Creá tu primera empresa o pedile a un Owner que te invite.")}
              </p>
              <button
                className="btn-primary"
                style={{ width: "auto", margin: "0 auto", padding: "0.625rem 1.5rem" }}
                onClick={() => setShowCreate(true)}
              >
                {t("ws_create_btn", "+ Crear empresa")}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {workspaces.map((ws) => (
                <WorkspaceCard
                  key={ws.id}
                  ws={ws}
                  isActive={activeWorkspace?.id === ws.id}
                  onSelect={handleSelect}
                  onDelete={setDeleteTarget}
                  onLeave={(w) => { setLeaveError(""); setLeaveTarget(w); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Role legend */}
        {workspaces.length > 0 && (
          <div className="table-container" style={{ padding: "1.25rem 1.5rem" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              {t("roles_legend", "Leyenda de roles")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(["OWNER", "ADMIN", "USER"] as const).map((role) => (
                <div key={role} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "999px",
                    background: `${ROLE_COLORS[role]}22`, color: ROLE_COLORS[role], border: `1px solid ${ROLE_COLORS[role]}44`,
                    flexShrink: 0, minWidth: "4rem", textAlign: "center",
                  }}>
                    {roleLabels[role]}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{roleDescs[role]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showCreate && <WorkspaceCreateModal onClose={() => setShowCreate(false)} />}
      {deleteTarget && (
        <WorkspaceDeleteModal workspace={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
      {leaveTarget && (
        <div className="modal-overlay" onClick={() => !leaveLoading && setLeaveTarget(null)}>
          <div className="modal-content" style={{ maxWidth: "440px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("ws_leave_btn", "Leave")}</h2>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {t("ws_leave_confirm", "Are you sure you want to leave")} <strong style={{ color: "var(--foreground)" }}>{leaveTarget.name}</strong>?
              </p>
              {leaveError && <p style={{ color: "var(--error)", fontSize: "0.875rem", marginTop: "0.75rem" }}>{leaveError}</p>}
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", width: "auto", margin: 0, padding: "0.5rem 1.25rem" }}
                onClick={() => setLeaveTarget(null)}
                disabled={leaveLoading}
              >
                {t("btn_cancel", "Cancel")}
              </button>
              <button
                className="btn-primary"
                style={{ background: "var(--error)", boxShadow: "none", width: "auto", margin: 0, padding: "0.5rem 1.25rem", opacity: leaveLoading ? 0.6 : 1 }}
                onClick={handleConfirmLeave}
                disabled={leaveLoading}
              >
                {leaveLoading ? t("loading", "Loading...") : t("ws_leave_btn", "Leave")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
