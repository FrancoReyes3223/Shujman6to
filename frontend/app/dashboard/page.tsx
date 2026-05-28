"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import OverviewView from "../../components/OverviewView";
import EmployeesView, { INITIAL_EMPLOYEES } from "../../components/EmployeesView";
import ProductsView, { INITIAL_PRODUCTS } from "../../components/ProductsView";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

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
        const res = await fetch("http://localhost:3001/api/v1/usuarios/perfil", {
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
      </main>
    </div>
  );
}
