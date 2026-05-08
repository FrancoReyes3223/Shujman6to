"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  function handleLogout() {
    // Borrar la cookie del token
    document.cookie = "token=; path=/; max-age=0";
    router.push("/");
  }

  return (
    <div className="dashboard-container">
      <h1>Página Principal</h1>
      <p>¡Bienvenido! Has iniciado sesión correctamente.</p>
      <button className="btn-logout" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}
