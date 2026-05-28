"use client";

import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "es", flag: "🇦🇷", label: "ES" },
  { code: "en", flag: "🇺🇸", label: "EN" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-switcher">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          className={`lang-option${i18n.language === code ? " active" : ""}`}
          onClick={() => i18n.changeLanguage(code)}
          aria-label={`Switch to ${label}`}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
