"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../lib/api";
import Sidebar from "../../components/Sidebar";
import OverviewView from "../../components/OverviewView";
import EmployeesView, { INITIAL_EMPLOYEES } from "../../components/EmployeesView";
import ProductsView, { INITIAL_PRODUCTS } from "../../components/ProductsView";

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [isLoaded, setIsLoaded] = useState(false);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  useEffect(() => {
    const savedEmployees = localStorage.getItem('shujman_employees');
    if (savedEmployees) {
      try { setEmployees(JSON.parse(savedEmployees)); } catch (e) {}
    }
    
    const savedProducts = localStorage.getItem('shujman_products');
    if (savedProducts) {
      try { setProducts(JSON.parse(savedProducts)); } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shujman_employees', JSON.stringify(employees));
    }
  }, [employees, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shujman_products', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  useEffect(() => {
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    }

    const token = getCookie("token");
    if (!token) {
      router.replace("/");
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE}/usuarios/perfil`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        } else {
          document.cookie = "token=; path=/; max-age=0";
          router.replace("/");
        }
      } catch {
        document.cookie = "token=; path=/; max-age=0";
        router.replace("/");
      }
    }

    fetchProfile();
  }, [router]);

  function handleLogout() {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  }

  return (
    <div className="dashboard-layout">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        userFullName={user?.fullName}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <main className="dashboard-main">

        <div style={{ display: activeTab === "overview" ? "block" : "none" }}>
          <OverviewView employees={employees} products={products} />
        </div>
        <div style={{ display: activeTab === "employees" ? "block" : "none" }}>
          <EmployeesView employees={employees} setEmployees={setEmployees} />
        </div>
        <div style={{ display: activeTab === "products" ? "block" : "none" }}>
          <ProductsView products={products} setProducts={setProducts} />
        </div>

        {!["overview", "employees", "products"].includes(activeTab) && (
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

        <footer style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto', display: 'flex', justifyContent: 'center' }}>
          <Link
            href="/docs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-secondary)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = '';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-color)';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            {t("docs_button", "View Documentation")}
          </Link>
        </footer>
      </main>
    </div>
  );
}
