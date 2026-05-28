"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE } from "../../lib/api";

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    const token = getCookie("token");
    if (!token) {
      router.replace("/");
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE}/usuarios/perfil`, {
          headers: { Authorization: `Bearer ${getCookie("token")}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        } else {
          router.replace("/");
        }
      } catch {
        console.error("Error fetching profile");
      }
    }

    fetchProfile();
  }, [router]);

  function handleLogout() {
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  }

  return (
    <div className="dashboard-container">
      <h1>Pagina principal</h1>
      {user ? (
        <p>¡Bienvenido, <span className="font-bold text-white">{user.fullName}</span>! Has iniciado sesión correctamente.</p>
      ) : (
        <p>Cargando perfil...</p>
      )}
      {/* TODO: reemplazar '/docs/es' por `/docs/${i18n.language}` cuando se mergee la branch i18n */}
      <a className="btn-docs" href="/docs/es/">
        Documentación
      </a>
      <button className="btn-logout" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
