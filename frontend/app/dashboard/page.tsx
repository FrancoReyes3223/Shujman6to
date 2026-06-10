"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../lib/api";
import { useWorkspace } from "../../lib/WorkspaceContext";
import { useUser } from "../../lib/UserContext";
import Sidebar from "../../components/Sidebar";
import OverviewView from "../../components/OverviewView";
import EmployeesView from "../../components/EmployeesView";
import ProductsView from "../../components/ProductsView";
import type { Employee } from "../../components/EmployeesView";
import type { Product } from "../../components/ProductsView";
import AccountView from "../../components/AccountView";
import CompanyView from "../../components/CompanyView";
import WorkspaceMembersView from "../../components/WorkspaceMembersView";
import WorkspacesView from "../../components/WorkspacesView";

const VALID_TABS = ["overview", "employees", "products", "cuenta", "ws-company", "ws-members", "workspaces"];

// Inner component that uses the workspace and user contexts
function DashboardInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeWorkspace, refreshWorkspaces } = useWorkspace();
  const { user, isError, refreshUser, logout } = useUser();

  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [token, setToken] = useState<string>("");

  // ─── Data keyed by workspaceId ───────────────────────────────────────────────
  const wsKey = activeWorkspace?.id ?? "";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch employees and products when workspace or token changes
  useEffect(() => {
    if (!wsKey || !token) return;
    fetch(`${API_BASE}/workspaces/${wsKey}/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setEmployees(d.data); })
      .catch(() => {});
    fetch(`${API_BASE}/workspaces/${wsKey}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setProducts(d.data); })
      .catch(() => {});
  }, [wsKey, token]);

  // ─── Auth ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    }

    const tok = getCookie("token");
    if (!tok) { router.replace("/"); return; }
    setToken(tok);

    // Providers live in the root layout, so after a client-side navigation
    // from login they keep their pre-login state and need a refresh
    refreshUser();
    refreshWorkspaces();
  }, [router, refreshUser, refreshWorkspaces]);

  // Redirect to login if the profile fetch failed (invalid/expired token)
  useEffect(() => {
    if (isError) {
      logout();
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, router]);

  // Allow deep-linking to a tab via ?tab= (used by the navbar user menu)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  // readOnly when role is USER (can view but not edit)
  const readOnly = activeWorkspace?.role === "USER";

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="dashboard-main">

        <div style={{ display: activeTab === "overview" ? "block" : "none" }}>
          <OverviewView employees={employees} products={products} />
        </div>
        <div style={{ display: activeTab === "employees" ? "block" : "none" }}>
          <EmployeesView employees={employees} setEmployees={setEmployees} readOnly={readOnly} workspaceId={wsKey} token={token} />
        </div>
        <div style={{ display: activeTab === "products" ? "block" : "none" }}>
          <ProductsView products={products} setProducts={setProducts} readOnly={readOnly} workspaceId={wsKey} token={token} />
        </div>
        <div style={{ display: activeTab === "cuenta" ? "block" : "none" }}>
          <AccountView user={user} />
        </div>
        <div style={{ display: activeTab === "ws-company" ? "block" : "none" }}>
          <CompanyView workspaceId={wsKey} token={token} readOnly={activeWorkspace?.role !== "OWNER"} />
        </div>
        <div style={{ display: activeTab === "ws-members" ? "block" : "none" }}>
          <WorkspaceMembersView />
        </div>
        <div style={{ display: activeTab === "workspaces" ? "block" : "none" }}>
          <WorkspacesView />
        </div>

        {!VALID_TABS.includes(activeTab) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: "var(--text-secondary)", marginTop: "4rem" }}>
            <div style={{ fontSize: "5rem", animation: "bounce 2s infinite ease-in-out", display: "inline-block" }}>
              🚧
            </div>
            <h2 style={{ marginTop: "1.5rem", fontSize: "1.5rem", fontWeight: 600, color: "var(--foreground)" }}>
              {t("work_in_progress", "Aún estamos trabajando en esta sección")}
            </h2>
            <p style={{ marginTop: "0.5rem", opacity: 0.7 }}>
              {t("work_in_progress_desc", "Vuelve pronto para ver las novedades.")}
            </p>
          </div>
        )}

      </main>
    </div>
  );
}

// Suspense boundary required by useSearchParams in static export builds
export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
