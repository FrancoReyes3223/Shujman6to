"use client";

import "../lib/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";
import { useEffect } from "react";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const match = document.cookie.match(/(^| )i18next=([^;]+)/);
    if (match && match[2] && i18n.language !== match[2]) {
      i18n.changeLanguage(match[2]);
      document.documentElement.lang = match[2];
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
