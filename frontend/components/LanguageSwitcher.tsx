"use client";

import { useTranslation } from "react-i18next";
import ThemeToggle from "./ThemeToggle";

const LANGS = [
  { code: "es", flag: "🇦🇷", label: "ES" },
  { code: "en", flag: "🇺🇸", label: "EN" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLangChange = (code: string) => {
    document.cookie = `i18next=${code}; path=/; max-age=31536000`;
    window.location.reload();
  };

  return (
    <div className="lang-switcher" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 999999, pointerEvents: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          className={`lang-option${i18n.language === code ? " active" : ""}`}
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={() => handleLangChange(code)}
          aria-label={`Switch to ${label}`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
      <ThemeToggle />
    </div>
  );
}
