"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);

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
      <h1>{t("dashboard_title", "Home")}</h1>
      {user ? (
        <p>{t("welcome_message", "Welcome, {{name}}! You have successfully signed in.", { name: user.fullName })}</p>
      ) : (
        <p>{t("loading_profile", "Loading profile...")}</p>
      )}
      {/* TODO: reemplazar '/docs/es' por `/docs/${i18n.language}` cuando se mergee la branch i18n */}
      <a className="btn-docs" href="/docs/es/">
        Documentación
      </a>
      <button className="btn-logout" onClick={handleLogout}>
        {t("logout", "Log out")}
      </button>
    </div>
  );
}
