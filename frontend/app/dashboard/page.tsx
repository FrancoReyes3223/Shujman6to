"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("http://localhost:3001/api/v1/usuarios/perfil", {
          headers: {
            // Enviamos el token manualmente o dejamos que el navegador lo envíe si es cookie
            // Pero como lo guardamos en document.cookie, podemos leerlo
            "Authorization": `Bearer ${getCookie("token")}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    }
    fetchProfile();
  }, []);

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
  }

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
      <button className="btn-logout" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
