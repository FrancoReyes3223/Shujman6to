"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../lib/api";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = `; ${document.cookie}`;
    const parts = value.split("; token=");
    if (parts.length === 2) router.replace("/dashboard");
  }, []);

  function validate() {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) newErrors.fullName = t("name_required", "Name is required");

    if (!email.trim()) {
      newErrors.email = t("email_required", "Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) newErrors.email = t("invalid_email", "Please enter a valid email");
    }

    if (!password) {
      newErrors.password = t("password_required", "Password is required");
    } else if (password.length < 6) {
      newErrors.password = t("password_min_length", "Minimum 6 characters");
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t("confirm_password_required", "Please confirm your password");
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t("passwords_dont_match", "Passwords don't match");
    }

    return newErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGeneralError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.message || t("registration_error", "Error registering user"));
        return;
      }

      router.push("/?registered=true");
    } catch {
      setGeneralError(t("server_connection_error", "Could not connect to the server"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t("create_account", "Create Account")}</h1>
        <p className="subtitle">{t("register_subtitle", "Fill in your details to register")}</p>

        {generalError && <div className="error-banner">{generalError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">{t("full_name_label", "Full name")}</label>
            <div className="input-wrapper">
              <input
                id="fullName"
                type="text"
                className={`form-input ${errors.fullName ? "error" : ""}`}
                placeholder={t("placeholder_full_name", "Your name")}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                autoComplete="name"
              />
            </div>
            {errors.fullName && <p className="error-message">⚠ {errors.fullName}</p>}
          </div>

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
                autoComplete="new-password"
              />
            </div>
            {errors.password && <p className="error-message">⚠ {errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t("confirm_password_label", "Confirm password")}</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                placeholder={t("placeholder_confirm_password", "••••••••")}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                autoComplete="new-password"
              />
            </div>
            {errors.confirmPassword && <p className="error-message">⚠ {errors.confirmPassword}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> {t("creating_account", "Creating account...")}</> : t("register_button", "Register")}
          </button>
        </form>

        <div className="auth-footer">
          {t("have_account", "Already have an account?")}{" "}
          <Link href="/">{t("sign_in_link", "Sign in")}</Link>
        </div>
      </div>
    </div>
  );
}
