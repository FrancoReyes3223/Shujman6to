import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function AccountView({ user }: { user: { fullName: string; email: string } | null }) {
  const { t } = useTranslation();
  
  const [name, setName] = useState(user?.fullName || "");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (user?.fullName) {
      setName(user.fullName);
    }
  }, [user]);

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
        <div className="table-container" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>{t("acc_personal_info", "Personal Information")}</h2>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t("full_name_label", "Full name")}</label>
              <input 
                className="form-input" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>{t("email_label", "Email")}</label>
              <input className="form-input" value={user?.email || ""} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
          </div>
        </div>

        <div className="table-container" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>{t("acc_preferences", "Preferences")}</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontWeight: 500 }}>{t("acc_public_profile", "Public Profile")}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t("acc_public_profile_desc", "Allow others to see your name and email.")}</p>
              </div>
              <div 
                onClick={() => setIsPublic(!isPublic)}
                style={{ width: '40px', height: '20px', borderRadius: '10px', background: isPublic ? 'var(--primary)' : 'var(--muted)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', left: isPublic ? '22px' : '2px', top: '2px', width: '16px', height: '16px', borderRadius: '50%', background: isPublic ? '#fff' : 'var(--muted-foreground)', transition: 'left 0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
