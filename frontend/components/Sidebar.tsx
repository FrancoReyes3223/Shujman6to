"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useWorkspace, Workspace } from "../lib/WorkspaceContext";
import WorkspaceCreateModal from "./WorkspaceCreateModal";

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userFullName?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const Icons = {
  overview:   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  employees:  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  products:   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  logout:     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  menu:       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  account:    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  security:   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  workspaces: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  general:    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  profile:    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  company:    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  members:    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  chevronDown:<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  plus:       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  USER:  "Usuario",
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: "#f59e0b",
  ADMIN: "#6366f1",
  USER:  "#10b981",
};

export default function Sidebar({ activeTab, setActiveTab, onLogout, userFullName, isOpen, setIsOpen }: SidebarProps) {
  const { t } = useTranslation();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const accountItems = [
    { id: "cuenta",     label: t("sidebar_account",    "Account"),    icon: Icons.account,    comingSoon: false },
    { id: "seguridad",  label: t("sidebar_security",   "Security"),   icon: Icons.security,   comingSoon: true  },
    { id: "workspaces", label: t("sidebar_workspaces", "Workspaces"), icon: Icons.workspaces, comingSoon: false },
  ];

  const workspaceItems = [
    { id: "ws-profile",  label: t("sidebar_my_profile", "My Profile"), icon: Icons.profile,  comingSoon: true  },
    { id: "ws-company",  label: t("sidebar_company",    "Company"),    icon: Icons.company,   comingSoon: false },
    { id: "ws-members",  label: t("sidebar_members",    "Members"),    icon: Icons.members,   comingSoon: false },
    { id: "overview",    label: t("sidebar_overview",   "Overview"),   icon: Icons.overview,  comingSoon: false },
    { id: "employees",   label: t("sidebar_employees",  "Employees"),  icon: Icons.employees, comingSoon: false },
    { id: "products",    label: t("sidebar_products",   "Products"),   icon: Icons.products,  comingSoon: false },
  ];

  function handleNavClick(id: string) {
    setActiveTab(id);
    setDropdownOpen(false);
  }

  function handleSelectWorkspace(ws: Workspace) {
    setActiveWorkspace(ws);
    setDropdownOpen(false);
  }

  const role = activeWorkspace?.role;

  return (
    <>
      <div className={`dashboard-sidebar ${isOpen ? "open" : "closed"}`}>

        {/* Header */}
        <div className="sidebar-header" style={{ flexDirection: "column", alignItems: isOpen ? "flex-start" : "center", height: "auto", paddingBottom: "1rem", paddingTop: "1rem", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "space-between" : "center", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {isOpen && (
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#ffffff" }}>
                  Shujman<span style={{ color: "var(--gold)" }}>B2B</span>
                </h2>
              )}
            </div>
            <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
              {Icons.menu}
            </button>
          </div>
          {isOpen && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
              {userFullName ? t("greeting_user", "Hello, {{name}}", { name: userFullName }) : t("loading_profile", "Loading profile...")}
            </p>
          )}
        </div>

        {/* Tu cuenta */}
        <div className="sidebar-section">
          {isOpen && <p className="sidebar-section-label">{t("sidebar_your_account", "Your Account")}</p>}
          <nav className="sidebar-nav">
            {accountItems.map((item) => (
              <NavItem key={item.id} item={item} activeTab={activeTab} isOpen={isOpen} onClick={handleNavClick} />
            ))}
          </nav>
        </div>

        {/* Workspace — selector */}
        <div className="sidebar-section">
          {isOpen && (
            <div style={{ position: "relative" }}>
              {/* Workspace switcher button */}
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  background: "var(--bg-secondary, rgba(255,255,255,0.04))",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  cursor: "pointer",
                  color: "var(--foreground)",
                  marginBottom: "0.25rem",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.2rem", overflow: "hidden" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Workspace
                  </span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "140px" }}>
                    {activeWorkspace ? activeWorkspace.name : t("no_workspace", "Sin empresa")}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
                  {role && (
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.45rem", borderRadius: "999px", background: `${ROLE_COLORS[role]}22`, color: ROLE_COLORS[role], border: `1px solid ${ROLE_COLORS[role]}55` }}>
                      {ROLE_LABELS[role]}
                    </span>
                  )}
                  <span style={{ color: "var(--text-secondary)", transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", display: "flex" }}>
                    {Icons.chevronDown}
                  </span>
                </div>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 0.25rem)",
                  left: 0,
                  right: 0,
                  background: "var(--card, #1a1a2e)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  zIndex: 50,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}>
                  {workspaces.length === 0 ? (
                    <p style={{ padding: "0.75rem 1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      {t("no_workspaces_yet", "Todavía no tenés empresas.")}
                    </p>
                  ) : (
                    workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => handleSelectWorkspace(ws)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          padding: "0.6rem 1rem",
                          background: activeWorkspace?.id === ws.id ? "var(--accent-subtle, rgba(99,102,241,0.12))" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--foreground)",
                          fontSize: "0.875rem",
                          textAlign: "left",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => { if (activeWorkspace?.id !== ws.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = activeWorkspace?.id === ws.id ? "var(--accent-subtle, rgba(99,102,241,0.12))" : "transparent"; }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ws.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "999px", background: `${ROLE_COLORS[ws.role]}22`, color: ROLE_COLORS[ws.role] }}>
                            {ROLE_LABELS[ws.role]}
                          </span>
                          {activeWorkspace?.id === ws.id && <span style={{ color: "var(--accent)" }}>{Icons.check}</span>}
                        </div>
                      </button>
                    ))
                  )}
                  <div style={{ borderTop: "1px solid var(--border-color)" }}>
                    <button
                      onClick={() => { setDropdownOpen(false); setShowCreateModal(true); }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        width: "100%",
                        padding: "0.6rem 1rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--accent)",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99,102,241,0.08)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {Icons.plus}
                      {t("ws_create_btn", "Crear empresa")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cuando el sidebar está cerrado: solo ícono de workspace */}
          {!isOpen && (
            <button
              className="nav-item"
              title="Workspace"
              onClick={() => setShowCreateModal(true)}
              style={{ justifyContent: "center" }}
            >
              <span className="icon">{Icons.company}</span>
            </button>
          )}

          <nav className="sidebar-nav">
            {workspaceItems.map((item) => (
              <NavItem key={item.id} item={item} activeTab={activeTab} isOpen={isOpen} onClick={handleNavClick} />
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div style={{ marginTop: "auto" }}>
          <button
            className="nav-item"
            onClick={onLogout}
            style={{ color: "var(--error)", justifyContent: isOpen ? "flex-start" : "center" }}
            title={!isOpen ? t("logout", "Log out") : undefined}
          >
            <span className="icon">{Icons.logout}</span>
            {isOpen && <span className="label">{t("logout", "Log out")}</span>}
          </button>
        </div>

      </div>

      {showCreateModal && <WorkspaceCreateModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}

type NavItemProps = {
  item: { id: string; label: string; icon: React.ReactNode; comingSoon: boolean };
  activeTab: string;
  isOpen: boolean;
  onClick: (id: string) => void;
};

function NavItem({ item, activeTab, isOpen, onClick }: NavItemProps) {
  const isActive = activeTab === item.id;

  return (
    <button
      className={`nav-item ${isActive ? "active" : ""} ${item.comingSoon ? "coming-soon" : ""}`}
      onClick={() => onClick(item.id)}
      title={!isOpen ? item.label : undefined}
      style={{ justifyContent: isOpen ? "flex-start" : "center" }}
    >
      <span className="icon">{item.icon}</span>
      {isOpen && (
        <>
          <span className="label">{item.label}</span>
          {item.comingSoon && <span className="coming-soon-badge">Soon</span>}
        </>
      )}
    </button>
  );
}
