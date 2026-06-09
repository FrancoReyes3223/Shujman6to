"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

const founders = [
  {
    name: "Franco Reyes",
    initials: "FR",
    color: "#4f46e5",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  },
  {
    name: "Manuel Ferrer Petit",
    initials: "MF",
    color: "#0891b2",
    quote:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse.",
  },
  {
    name: "Manuel Slepoy",
    initials: "MS",
    color: "#059669",
    quote:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
  },
];

const CARD_W = 380;
const PEEK_W = 80;
const GAP = 24;

export default function CompanyView() {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const n = founders.length;

  const prev = () => setCurrent((c) => (c - 1 + n) % n);
  const next = () => setCurrent((c) => (c + 1) % n);

  // For each position offset (-1, 0, +1) we show a card
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

  // estimate card height for the container
  const CARD_H = 520;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h1>{t("sidebar_company", "Company")}</h1>
        </div>
        <p>{t("company_desc", "Information about our organization and its founders.")}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Company Info */}
        <div className="table-container" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>ShujmanB2B</h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-secondary)",
              marginBottom: "1.5rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Rosario, Argentina</span>
          </div>
          <p style={{ color: "var(--foreground)", lineHeight: 1.7 }}>
            {t(
              "company_about_text",
              "ShujmanB2B es una empresa líder en soluciones tecnológicas empresariales. Nuestro objetivo es transformar la manera en que las organizaciones gestionan sus recursos, empleados y productos a través de plataformas modernas, intuitivas y eficientes."
            )}
          </p>
        </div>

        {/* Founders Carousel */}
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem" }}>
            {t("company_founders", "Founders")}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Prev */}
            <button
              onClick={prev}
              style={{
                flexShrink: 0,
                zIndex: 10,
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Track */}
            <div
              style={{
                flex: 1,
                position: "relative",
                height: `${CARD_H}px`,
                overflow: "hidden",
              }}
            >
              {([-1, 0, 1] as const).map((offset) => {
                const founder = founders[getIdx(offset)];
                return (
                  <div key={offset} className="metric-card" style={cardStyle(offset)}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        padding: "2.5rem 2rem",
                      }}
                    >
                      <div
                        style={{
                          width: "110px",
                          height: "110px",
                          borderRadius: "50%",
                          background: founder.color,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "2rem",
                          fontWeight: 700,
                          marginBottom: "1.5rem",
                          boxShadow: `0 0 0 6px ${founder.color}33`,
                        }}
                      >
                        {founder.initials}
                      </div>
                      <h3
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          color: "var(--foreground)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {founder.name}
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                        Co-fundador
                      </p>
                      <div
                        style={{
                          width: "2.5rem",
                          height: "3px",
                          background: founder.color,
                          borderRadius: "2px",
                          marginBottom: "1.5rem",
                        }}
                      />
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.95rem",
                          fontStyle: "italic",
                          lineHeight: 1.7,
                        }}
                      >
                        "{founder.quote}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={next}
              style={{
                flexShrink: 0,
                zIndex: 10,
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            {founders.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                style={{
                  width: idx === current ? "1.5rem" : "0.5rem",
                  height: "0.5rem",
                  borderRadius: "4px",
                  border: "none",
                  background: idx === current ? "var(--primary)" : "var(--border)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
