"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return "El email es obligatorio";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Ingresá un email válido";
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return "La contraseña es obligatoria";
    return undefined;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError("");

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.message || "Credenciales incorrectas");
        return;
      }

      document.cookie = `token=${data.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      router.push("/dashboard");
    } catch {
      setGeneralError("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Iniciar Sesión</h1>
        <p className="subtitle">Ingresá tus credenciales para continuar</p>

        {generalError && <div className="error-banner">{generalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="error-message">⚠ {errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete="current-password"
              />
            </div>
            {errors.password && <p className="error-message">⚠ {errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Ingresando...</> : "Ingresar"}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tenés cuenta?{" "}
          <Link href="/register">Registrate aquí</Link>
        </div>
      </div>
    </div>
  );
}
