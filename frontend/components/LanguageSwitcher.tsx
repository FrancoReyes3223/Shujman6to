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
    i18n.changeLanguage(code);
    document.documentElement.lang = code;
  };

  return (
    <div className="lang-switcher">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          className={`lang-option${i18n.language === code ? " active" : ""}`}
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
