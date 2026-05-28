"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = `; ${document.cookie}`;
    const parts = value.split("; token=");
    if (parts.length === 2) router.replace("/dashboard");
  }, []);

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return t("email_required", "Email is required");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return t("invalid_email", "Please enter a valid email");
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return t("password_required", "Password is required");
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
        setGeneralError(data.message || t("invalid_credentials", "Invalid credentials"));
        return;
      }

      document.cookie = `token=${data.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      router.push("/dashboard");
    } catch {
      setGeneralError(t("server_connection_error", "Could not connect to the server"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t("sign_in", "Sign In")}</h1>
        <p className="subtitle">{t("sign_in_subtitle", "Enter your credentials to continue")}</p>

        {generalError && <div className="error-banner">{generalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">{t("email_label", "Email")}</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder={t("placeholder_email", "your@email.com")}
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
            <label htmlFor="password">{t("password_label", "Password")}</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder={t("placeholder_password", "••••••••")}
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
            {loading ? <><span className="spinner" /> {t("signing_in", "Signing in...")}</> : t("sign_in_button", "Sign In")}
          </button>
        </form>

        <div className="auth-footer">
          {t("no_account", "Don't have an account?")}{" "}
          <Link href="/register">{t("register_here", "Register here")}</Link>
        </div>
      </div>
    </div>
  );
}
