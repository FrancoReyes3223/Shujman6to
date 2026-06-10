"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useUser } from "../lib/UserContext";
import { useWorkspace } from "../lib/WorkspaceContext";
import LanguageSwitcher from "./LanguageSwitcher";

const ROLE_COLORS: Record<string, string> = {
  OWNER: "#f59e0b",
  ADMIN: "#6366f1",
  USER:  "#10b981",
};

const Icons = {
  docs: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  account: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  chevronDown: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
};

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Navbar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useUser();
  const { activeWorkspace } = useWorkspace();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isDashboard = pathname?.startsWith("/dashboard") ?? false;
  const showUserSection = isDashboard && user !== null;

  // Close the user menu when clicking outside of it
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const roleLabels: Record<string, string> = {
    OWNER: t("role_owner", "Owner"),
    ADMIN: t("role_admin", "Admin"),
    USER:  t("role_user", "User"),
  };

  function handleMyAccount() {
    setMenuOpen(false);
    router.push("/dashboard?tab=cuenta");
  }

  function handleLogout() {
    setMenuOpen(false);
    logout();
    router.push("/");
  }

  const role = activeWorkspace?.role;

  return (
    <header className="app-navbar">
      <Link href={user ? "/dashboard" : "/"} className="navbar-brand">
        Shujman<span className="gold">B2B</span>
      </Link>

      <div className="navbar-actions">
        {showUserSection && activeWorkspace && (
          <span className="navbar-ws-badge" title={activeWorkspace.name}>
            <span className="ws-name">{activeWorkspace.name}</span>
            {role && (
              <span
                className="role-pill"
                style={{
                  background: `${ROLE_COLORS[role]}22`,
                  color: ROLE_COLORS[role],
                  border: `1px solid ${ROLE_COLORS[role]}55`,
                }}
              >
                {roleLabels[role]}
              </span>
            )}
          </span>
        )}

        <Link href="/docs" className="navbar-link" title={t("navbar_docs", "Documentation")}>
          {Icons.docs}
          <span className="label">{t("navbar_docs", "Docs")}</span>
        </Link>

        <LanguageSwitcher />

        {showUserSection && (
          <div className="user-menu" ref={menuRef}>
            <button
              type="button"
              className="user-menu-trigger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t("navbar_user_menu_aria", "User menu")}
              aria-expanded={menuOpen}
            >
              <span className="user-avatar">{getInitials(user.fullName)}</span>
              <span className="user-menu-name">{user.fullName}</span>
              {Icons.chevronDown}
            </button>

            {menuOpen && (
              <div className="user-menu-dropdown">
                <button type="button" className="user-menu-item" onClick={handleMyAccount}>
                  {Icons.account}
                  {t("navbar_my_account", "My account")}
                </button>
                <button type="button" className="user-menu-item danger" onClick={handleLogout}>
                  {Icons.logout}
                  {t("logout", "Log out")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
