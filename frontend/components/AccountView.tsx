import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE, MEDIA_BASE } from "../lib/api";
import { useUser, User } from "../lib/UserContext";
import { useWorkspace } from "../lib/WorkspaceContext";

const ROLE_COLORS: Record<string, string> = { OWNER: "#f59e0b", ADMIN: "#6366f1", USER: "#10b981" };

export default function AccountView({
  user,
  token,
}: {
  user: User | null;
  token: string;
}) {
  const { t } = useTranslation();
  const { refreshUser } = useUser();
  const { workspaces } = useWorkspace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const roleLabels: Record<string, string> = {
    OWNER: t("role_owner", "Owner"),
    ADMIN: t("role_admin", "Admin"),
    USER:  t("role_user", "User"),
  };

  const initials = (user?.fullName || user?.email || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  const [name, setName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user]);

  const dirty = name.trim() !== (user?.fullName || "").trim();

  async function handleSave() {
    if (!name.trim() || !dirty || saving) return;
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/usuarios/perfil`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName: name.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Error");
      await refreshUser();
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("save_error", "Could not save changes. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch(`${API_BASE}/usuarios/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Error");
      await refreshUser();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("save_error", "Could not save changes. Please try again."));
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <div className="dashboard-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="dashboard-header" style={{ width: '100%', maxWidth: '800px', textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <h1>{t("sidebar_account", "Account")}</h1>
        </div>
        <p>{t("account_desc", "Manage your personal information and preferences.")}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '600px' }}>
        {/* Identity card */}
        <div className="table-container" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
            title={t("acc_photo_change", "Change photo")}
            style={{
              width: '4rem', height: '4rem', borderRadius: '1rem', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent), rgba(99,102,241,0.6))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 700, color: '#fff', overflow: 'hidden',
              cursor: uploadingPhoto ? 'wait' : 'pointer', position: 'relative',
            }}
          >
            {user?.photoUrl
              ? <img src={`${MEDIA_BASE}${user.photoUrl}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ overflow: 'hidden', textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{user?.fullName || "—"}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ""}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{ marginTop: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.4rem', padding: '0.3rem 0.7rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: uploadingPhoto ? 'wait' : 'pointer' }}
            >
              {uploadingPhoto ? t("btn_saving", "Saving...") : t("acc_photo_change", "Change photo")}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </div>
        </div>

        <div className="table-container" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>{t("acc_personal_info", "Personal Information")}</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t("full_name_label", "Full name")}</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => { setName(e.target.value); setSuccess(false); setError(""); }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t("email_label", "Email")}</label>
              <input className="form-input" value={user?.email || ""} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>

            {error && <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{error}</p>}
            {success && <p style={{ color: 'var(--accent)', fontSize: '0.875rem', margin: 0 }}>{t("acc_saved", "Changes saved")}</p>}

            <button
              className="btn-primary"
              style={{ width: 'auto', margin: 0, alignSelf: 'flex-start', padding: '0.5rem 1.5rem', opacity: (!dirty || saving || !name.trim()) ? 0.5 : 1, cursor: (!dirty || saving || !name.trim()) ? 'not-allowed' : 'pointer' }}
              onClick={handleSave}
              disabled={!dirty || saving || !name.trim()}
            >
              {saving ? t("btn_saving", "Saving...") : t("btn_save", "Save")}
            </button>
          </div>
        </div>

        {/* Workspaces */}
        <div className="table-container" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>
            {t("profile_your_workspaces", "Your companies")}
            <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({workspaces.length})</span>
          </h2>
          {workspaces.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t("no_workspaces", "You don't belong to any company yet")}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {workspaces.map((ws) => (
                <div key={ws.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ws.name}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', flexShrink: 0, background: `${ROLE_COLORS[ws.role]}22`, color: ROLE_COLORS[ws.role], border: `1px solid ${ROLE_COLORS[ws.role]}44` }}>
                    {roleLabels[ws.role]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
