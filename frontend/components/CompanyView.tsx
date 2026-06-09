"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";

type Founder = { id: string; name: string; initials: string; color: string; quote?: string | null; photoUrl?: string | null };
type CompanyData = { name: string; location?: string | null; description?: string | null };
type FounderForm = { name: string; initials: string; color: string; quote: string };

const CARD_W = 380;
const PEEK_W = 80;
const GAP = 24;
const EMPTY_FOUNDER: FounderForm = { name: "", initials: "", color: "#4f46e5", quote: "" };

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function CompanyView({ workspaceId, token, readOnly = false }: { workspaceId: string; token: string; readOnly?: boolean }) {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [company, setCompany] = useState<CompanyData | null>(null);

  // Company modal state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState({ name: "", location: "", description: "" });
  const [savingCompany, setSavingCompany] = useState(false);

  // Founder modal state
  const [founderModal, setFounderModal] = useState<{ mode: "add" | "edit"; founder?: Founder } | null>(null);
  const [founderForm, setFounderForm] = useState<FounderForm>(EMPTY_FOUNDER);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [savingFounder, setSavingFounder] = useState(false);
  const [deleteFounderTarget, setDeleteFounderTarget] = useState<Founder | null>(null);

  useEffect(() => {
    setCompany(null);
    setFounders([]);
    setCurrent(0);
    if (!workspaceId || !token) return;
    fetch(`${API_BASE}/workspaces/${workspaceId}/company`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setCompany(d.data);
          setFounders(d.data.founders ?? []);
        }
      })
      .catch(() => {});
  }, [workspaceId, token]);

  // ── Company handlers ──────────────────────────────────────────────────────────
  const openCompanyModal = () => {
    setCompanyForm({ name: company?.name ?? "", location: company?.location ?? "", description: company?.description ?? "" });
    setShowCompanyModal(true);
  };

  const handleCompanySave = async () => {
    if (!companyForm.name.trim()) return;
    setSavingCompany(true);
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/company`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: companyForm.name.trim(), location: companyForm.location.trim() || undefined, description: companyForm.description.trim() || undefined }),
      });
      const data = await res.json();
      if (data.success) { setCompany(data.data); setShowCompanyModal(false); }
    } finally { setSavingCompany(false); }
  };

  // ── Founder handlers ──────────────────────────────────────────────────────────
  const openAddFounder = () => {
    setFounderForm(EMPTY_FOUNDER);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFounderModal({ mode: "add" });
  };

  const openEditFounder = (f: Founder) => {
    setFounderForm({ name: f.name, initials: f.initials, color: f.color, quote: f.quote ?? "" });
    setPhotoFile(null);
    setPhotoPreview(f.photoUrl ? `http://localhost:3001${f.photoUrl}` : null);
    setFounderModal({ mode: "edit", founder: f });
  };

  const handleFounderSave = async () => {
    if (!founderForm.name.trim() || !founderForm.initials.trim()) return;
    setSavingFounder(true);
    try {
      const body = { name: founderForm.name.trim(), initials: founderForm.initials.trim(), color: founderForm.color, quote: founderForm.quote.trim() || undefined };
      const isEdit = founderModal?.mode === "edit";
      const url = isEdit
        ? `${API_BASE}/workspaces/${workspaceId}/company/founders/${founderModal!.founder!.id}`
        : `${API_BASE}/workspaces/${workspaceId}/company/founders`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) return;

      let savedFounder: Founder = data.data;

      // Upload photo if one was selected
      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);
        const photoRes = await fetch(`${API_BASE}/workspaces/${workspaceId}/company/founders/${savedFounder.id}/photo`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const photoData = await photoRes.json();
        if (photoData.success) savedFounder = photoData.data;
      }

      if (isEdit) {
        setFounders(fs => fs.map(f => f.id === founderModal!.founder!.id ? savedFounder : f));
      } else {
        setFounders(fs => [...fs, savedFounder]);
        setCurrent(founders.length);
      }
      setFounderModal(null);
    } finally { setSavingFounder(false); }
  };

  const handleFounderDelete = async () => {
    if (!deleteFounderTarget) return;
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/company/founders/${deleteFounderTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      const next = founders.filter(f => f.id !== deleteFounderTarget.id);
      setFounders(next);
      setCurrent(c => Math.min(c, Math.max(0, next.length - 1)));
    }
    setDeleteFounderTarget(null);
  };

  // ── Carousel helpers ──────────────────────────────────────────────────────────
  const n = founders.length;
  const prev = () => setCurrent((c) => (c - 1 + n) % n);
  const next = () => setCurrent((c) => (c + 1) % n);
  const getIdx = (offset: number) => (current + offset + n) % n;

  const cardStyle = (offset: number): React.CSSProperties => {
    const isActive = offset === 0;
    return {
      position: "absolute",
      width: `${CARD_W}px`,
      top: 0,
      left: "50%",
      transform: `translateX(calc(-50% + ${offset * (CARD_W / 2 + PEEK_W + GAP)}px)) scale(${isActive ? 1 : 0.92})`,
      transition: "transform 0.4s ease, opacity 0.4s ease",
      opacity: isActive ? 1 : 0.38,
      zIndex: isActive ? 2 : 1,
      pointerEvents: isActive ? "auto" : "none",
    };
  };

  const CARD_H = 520;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h1>{t("sidebar_company", "Company")}</h1>
        </div>
        <p>{t("company_desc", "Information about our organization and its founders.")}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ── Company Info ─────────────────────────────────────────────────────── */}
        <div className="table-container" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            {company
              ? <h2 style={{ fontSize: "1.5rem", fontWeight: 600 }}>{company.name}</h2>
              : <p style={{ color: "var(--text-secondary)" }}>{t("company_no_info", "No company information configured yet.")}</p>
            }
            {!readOnly && (
              <button className="btn-action" onClick={openCompanyModal} title={t("company_btn_edit", "Edit company info")} style={{ cursor: "pointer", flexShrink: 0 }}>
                <EditIcon />
              </button>
            )}
          </div>
          {company?.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span>{company.location}</span>
            </div>
          )}
          {company?.description && <p style={{ color: "var(--foreground)", lineHeight: 1.7 }}>{company.description}</p>}
          {!company && !readOnly && (
            <button className="btn-primary" onClick={openCompanyModal} style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem", marginTop: "0.5rem" }}>
              {t("company_btn_setup", "+ Set up company")}
            </button>
          )}
        </div>

        {/* ── Company edit modal ────────────────────────────────────────────────── */}
        {showCompanyModal && (
          <div className="modal-overlay" onClick={() => setShowCompanyModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{company ? t("company_btn_edit", "Edit company info") : t("company_btn_setup", "Set up company")}</h2>
                <button className="btn-close" onClick={() => setShowCompanyModal(false)}><CloseIcon /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t("company_field_name", "Company name")}</label>
                  <input className="form-input" value={companyForm.name} onChange={e => setCompanyForm(f => ({ ...f, name: e.target.value }))} placeholder={t("company_field_name", "Company name")} autoFocus />
                </div>
                <div className="form-group">
                  <label>{t("company_field_location", "Location")}</label>
                  <input className="form-input" value={companyForm.location} onChange={e => setCompanyForm(f => ({ ...f, location: e.target.value }))} placeholder={t("company_field_location_placeholder", "City, Country")} />
                </div>
                <div className="form-group">
                  <label>{t("company_field_description", "Description")}</label>
                  <textarea className="form-input" value={companyForm.description} onChange={e => setCompanyForm(f => ({ ...f, description: e.target.value }))} placeholder={t("company_field_description_placeholder", "Tell us about your company...")} rows={4} style={{ resize: "vertical" }} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", width: "auto", margin: 0, padding: "0.5rem 1.25rem" }} onClick={() => setShowCompanyModal(false)}>
                  {t("btn_cancel", "Cancel")}
                </button>
                <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem" }} onClick={handleCompanySave} disabled={!companyForm.name.trim() || savingCompany}>
                  {savingCompany ? t("btn_saving", "Saving...") : t("btn_save", "Save")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Founders ─────────────────────────────────────────────────────────── */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{t("company_founders", "Founders")}</h2>
            {!readOnly && company && (
              <button className="btn-primary" onClick={openAddFounder} style={{ width: "auto", margin: 0, padding: "0.5rem 1rem" }}>
                {t("founder_btn_new", "+ New Founder")}
              </button>
            )}
          </div>

          {founders.length === 0 ? (
            <div className="table-container" style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
              {!company
                ? t("founder_no_company", "Set up your company info first before adding founders.")
                : t("founder_empty", "No founders yet. Add the first one!")}
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* Prev */}
                <button onClick={prev} style={{ flexShrink: 0, zIndex: 10, width: "2.75rem", height: "2.75rem", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--card)")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                {/* Track */}
                <div style={{ flex: 1, position: "relative", height: `${CARD_H}px`, overflow: "hidden" }}>
                  {([-1, 0, 1] as const).map((offset) => {
                    const founder = founders[getIdx(offset)];
                    if (!founder) return null;
                    const isActive = offset === 0;
                    return (
                      <div key={offset} className="metric-card" style={cardStyle(offset)}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "2.5rem 2rem" }}>
                          <div style={{ width: "110px", height: "110px", borderRadius: "50%", background: founder.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem", boxShadow: `0 0 0 6px ${founder.color}33`, overflow: "hidden", flexShrink: 0 }}>
                            {founder.photoUrl
                              ? <img src={`http://localhost:3001${founder.photoUrl}`} alt={founder.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              : founder.initials}
                          </div>
                          <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--foreground)", marginBottom: "0.25rem" }}>{founder.name}</h3>
                          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Co-fundador</p>
                          <div style={{ width: "2.5rem", height: "3px", background: founder.color, borderRadius: "2px", marginBottom: "1.5rem" }} />
                          {founder.quote && (
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", fontStyle: "italic", lineHeight: 1.7 }}>
                              "{founder.quote}"
                            </p>
                          )}
                          {/* Edit / Delete on active card */}
                          {isActive && !readOnly && (
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
                              <button className="btn-action" onClick={() => openEditFounder(founder)} title={t("founder_btn_edit", "Edit founder")} style={{ cursor: "pointer" }}>
                                <EditIcon />
                              </button>
                              <button className="btn-action" onClick={() => setDeleteFounderTarget(founder)} title={t("btn_delete", "Delete")} style={{ cursor: "pointer", color: "var(--error)", borderColor: "var(--error)" }}>
                                <TrashIcon />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Next */}
                <button onClick={next} style={{ flexShrink: 0, zIndex: 10, width: "2.75rem", height: "2.75rem", borderRadius: "50%", border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--card)")}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>

              {/* Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                {founders.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrent(idx)} style={{ width: idx === current ? "1.5rem" : "0.5rem", height: "0.5rem", borderRadius: "4px", border: "none", background: idx === current ? "var(--primary)" : "var(--border)", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Founder add/edit modal ────────────────────────────────────────────── */}
        {founderModal && (
          <div className="modal-overlay" onClick={() => setFounderModal(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{founderModal.mode === "add" ? t("founder_btn_new", "+ New Founder") : t("founder_btn_edit", "Edit founder")}</h2>
                <button className="btn-close" onClick={() => setFounderModal(null)}><CloseIcon /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t("founder_field_name", "Full name")}</label>
                  <input className="form-input" value={founderForm.name} onChange={e => setFounderForm(f => ({ ...f, name: e.target.value }))} placeholder={t("founder_field_name", "Full name")} autoFocus />
                </div>
                <div className="form-group">
                  <label>{t("founder_field_initials", "Initials")} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(2 chars)</span></label>
                  <input className="form-input" value={founderForm.initials} onChange={e => setFounderForm(f => ({ ...f, initials: e.target.value.slice(0, 2).toUpperCase() }))} placeholder="AB" maxLength={2} />
                </div>
                <div className="form-group">
                  <label>{t("founder_field_color", "Avatar color")}</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <input type="color" value={founderForm.color} onChange={e => setFounderForm(f => ({ ...f, color: e.target.value }))} style={{ width: "3rem", height: "2.5rem", borderRadius: "0.5rem", border: "1px solid var(--border-color)", cursor: "pointer", padding: "0.2rem" }} />
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: founderForm.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>
                      {founderForm.initials || "AB"}
                    </div>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{founderForm.color}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("founder_field_photo", "Profile photo")} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>({t("optional", "optional")})</span></label>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: founderForm.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.2rem", border: "2px solid var(--border-color)" }}>
                      {photoPreview
                        ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : (founderForm.initials || "AB")}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={{ cursor: "pointer", color: "var(--accent)", fontSize: "0.875rem", fontWeight: 500 }}>
                        {t("founder_field_photo_choose", "Choose image")}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={e => {
                            const file = e.target.files?.[0] ?? null;
                            setPhotoFile(file);
                            setPhotoPreview(file ? URL.createObjectURL(file) : null);
                          }}
                        />
                      </label>
                      {photoPreview && (
                        <button
                          type="button"
                          style={{ background: "none", border: "none", color: "var(--error)", fontSize: "0.8rem", cursor: "pointer", padding: 0, textAlign: "left" }}
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                        >
                          {t("founder_field_photo_remove", "Remove photo")}
                        </button>
                      )}
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>JPG, PNG, WebP · max 3 MB</span>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("founder_field_quote", "Quote")} <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>({t("optional", "optional")})</span></label>
                  <textarea className="form-input" value={founderForm.quote} onChange={e => setFounderForm(f => ({ ...f, quote: e.target.value }))} placeholder={t("founder_field_quote_placeholder", "A short quote or description...")} rows={3} style={{ resize: "vertical" }} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", width: "auto", margin: 0, padding: "0.5rem 1.25rem" }} onClick={() => setFounderModal(null)}>
                  {t("btn_cancel", "Cancel")}
                </button>
                <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem" }} onClick={handleFounderSave} disabled={!founderForm.name.trim() || !founderForm.initials.trim() || savingFounder}>
                  {savingFounder ? t("btn_saving", "Saving...") : t("btn_save", "Save")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Founder delete confirm ────────────────────────────────────────────── */}
        {deleteFounderTarget && (
          <div className="modal-overlay" onClick={() => setDeleteFounderTarget(null)}>
            <div className="modal-content" style={{ maxWidth: "420px" }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{t("delete_confirm_title", "Confirm Deletion")}</h2>
                <button className="btn-close" onClick={() => setDeleteFounderTarget(null)}><CloseIcon /></button>
              </div>
              <div className="modal-body">
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {t("founder_delete_confirm", "Are you sure you want to remove {{name}}?", { name: deleteFounderTarget.name })}
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-color)", width: "auto", margin: 0, padding: "0.5rem 1.25rem" }} onClick={() => setDeleteFounderTarget(null)}>
                  {t("btn_cancel", "Cancel")}
                </button>
                <button className="btn-primary" style={{ width: "auto", margin: 0, padding: "0.5rem 1.25rem", background: "var(--error)", boxShadow: "none" }} onClick={handleFounderDelete}>
                  {t("btn_delete", "Delete")}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
