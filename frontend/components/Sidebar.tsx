"use client";

import { useTranslation } from "react-i18next";

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userFullName?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const Icons = {
  overview: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  employees: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  products: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  menu: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  account: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  security: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  workspaces: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  general: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
  profile: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  company: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  members: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

const WORKSPACE_NAME = "Mi Empresa";

export default function Sidebar({ activeTab, setActiveTab, onLogout, userFullName, isOpen, setIsOpen }: SidebarProps) {
  const { t } = useTranslation();

  const accountItems = [
    { id: "cuenta",       label: t("sidebar_account", "Account"),      icon: Icons.account,    comingSoon: true },
    { id: "seguridad",    label: t("sidebar_security", "Security"),    icon: Icons.security,   comingSoon: true },
    { id: "workspaces",   label: t("sidebar_workspaces", "Workspaces"), icon: Icons.workspaces, comingSoon: true },
  ];

  const workspaceItems = [
    { id: "ws-general",  label: t("sidebar_general", "General"),       icon: Icons.general,   comingSoon: true },
    { id: "ws-profile",  label: t("sidebar_my_profile", "My Profile"), icon: Icons.profile,   comingSoon: true },
    { id: "ws-company",  label: t("sidebar_company", "Company"),       icon: Icons.company,   comingSoon: true },
    { id: "ws-members",  label: t("sidebar_members", "Members"),       icon: Icons.members,   comingSoon: true },
    { id: "overview",    label: t("sidebar_overview", "Overview"),     icon: Icons.overview,  comingSoon: false },
    { id: "employees",   label: t("sidebar_employees", "Employees"),   icon: Icons.employees, comingSoon: false },
    { id: "products",    label: t("sidebar_products", "Products"),     icon: Icons.products,  comingSoon: false },
  ];

  function handleNavClick(id: string, comingSoon: boolean) {
    if (!comingSoon) setActiveTab(id);
  }

  return (
    <div className={`dashboard-sidebar ${isOpen ? "open" : "closed"}`}>

      {/* Header */}
      <div className="sidebar-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: isOpen ? "space-between" : "center", width: "100%" }}>
          {isOpen && (
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Schujman<span style={{ color: "var(--gold)" }}>B2B</span>
            </h2>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
            {Icons.menu}
          </button>
        </div>
        {isOpen && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

      {/* Workspace */}
      <div className="sidebar-section">
        {isOpen && <p className="sidebar-section-label">{WORKSPACE_NAME}</p>}
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
          style={{ color: "var(--error)" }}
          title={!isOpen ? t("logout", "Log out") : undefined}
        >
          <span className="icon">{Icons.logout}</span>
          {isOpen && <span className="label">{t("logout", "Log out")}</span>}
        </button>
      </div>

    </div>
  );
}

type NavItemProps = {
  item: { id: string; label: string; icon: React.ReactNode; comingSoon: boolean };
  activeTab: string;
  isOpen: boolean;
  onClick: (id: string, comingSoon: boolean) => void;
};

function NavItem({ item, activeTab, isOpen, onClick }: NavItemProps) {
  const isActive = !item.comingSoon && activeTab === item.id;

  return (
    <button
      className={`nav-item ${isActive ? "active" : ""} ${item.comingSoon ? "coming-soon" : ""}`}
      onClick={() => onClick(item.id, item.comingSoon)}
      title={!isOpen ? item.label : undefined}
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
