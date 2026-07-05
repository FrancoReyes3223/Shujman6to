import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { useUser } from "../lib/UserContext";
import AccountDeleteModal from "./AccountDeleteModal";

export default function SecurityView({ token }: { token: string }) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [showDelete, setShowDelete] = useState(false);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function reset() {
    setActual("");
    setNueva("");
    setConfirmar("");
  }

  async function handleSave() {
    setError("");
    setSuccess(false);
    if (!actual || !nueva || !confirmar) return;
    if (nueva.length < 6) {
      setError(t("password_min_length", "Minimum 6 characters"));
      return;
    }
    if (nueva !== confirmar) {
      setError(t("passwords_dont_match", "Passwords don't match"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/usuarios/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ actual, nueva }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? t("save_error", "Could not save changes. Please try again."));
      reset();
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("save_error", "Could not save changes. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  const filled = actual && nueva && confirmar;

  return (
    <div className="dashboard-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="dashboard-header" style={{ width: '100%', maxWidth: '800px', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <h1>{t("sidebar_security", "Security")}</h1>
        </div>
        <p>{t("sec_desc", "Update your password to keep your account secure.")}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '600px' }}>
        <div className="table-container" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>{t("sec_change_password", "Change Password")}</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t("sec_current_password", "Current password")}</label>
              <input className="form-input" type="password" value={actual} onChange={(e) => { setActual(e.target.value); setSuccess(false); setError(""); }} autoComplete="current-password" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t("sec_new_password", "New password")}</label>
              <input className="form-input" type="password" value={nueva} onChange={(e) => { setNueva(e.target.value); setSuccess(false); setError(""); }} autoComplete="new-password" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t("sec_confirm_password", "Confirm new password")}</label>
              <input className="form-input" type="password" value={confirmar} onChange={(e) => { setConfirmar(e.target.value); setSuccess(false); setError(""); }} autoComplete="new-password" onKeyDown={(e) => e.key === "Enter" && handleSave()} />
            </div>

            {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{error}</p>}
            {success && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', margin: 0 }}>{t("sec_password_changed", "Password updated successfully")}</p>}

            <button
              className="btn-primary"
              style={{ width: 'auto', margin: 0, alignSelf: 'flex-start', padding: '0.5rem 1.5rem', opacity: (!filled || saving) ? 0.5 : 1, cursor: (!filled || saving) ? 'not-allowed' : 'pointer' }}
              onClick={handleSave}
              disabled={!filled || saving}
            >
              {saving ? t("btn_saving", "Saving...") : t("sec_update_password", "Update password")}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="table-container" style={{ padding: '2rem', border: '1px solid var(--error)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--error)' }}>{t("acc_danger_zone", "Danger zone")}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            {t("acc_delete_warning", "This action is irreversible. Your account and any company you own (with all its data) will be permanently deleted.")}
          </p>
          <button
            className="btn-primary"
            style={{ background: 'var(--error)', boxShadow: 'none', width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
            onClick={() => setShowDelete(true)}
          >
            {t("acc_delete_account", "Delete account")}
          </button>
        </div>
      </div>

      {showDelete && user && (
        <AccountDeleteModal email={user.email} token={token} onClose={() => setShowDelete(false)} />
      )}
    </div>
  );
}
