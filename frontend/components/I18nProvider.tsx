"use client";

import "../lib/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";

function getCookieLang(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )i18next=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function I18nProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: string;
}) {
  // The server always renders with `initialLang` (there's no per-request
  // server in a static export). Once on the client, switch to whatever
  // language is saved in the cookie, if any.
  const lang = getCookieLang() === "en" ? "en" : initialLang;
  if (i18n.language !== lang) {
    i18n.changeLanguage(lang);
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
