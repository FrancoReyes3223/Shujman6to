"use client";

import "../lib/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "../lib/i18n";

export default function I18nProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: string;
}) {
  // Sync the language before the first render (server and client) so the SSR
  // markup matches the client and avoids hydration mismatches. The cookie value
  // is resolved on the server in the root layout and passed down as a prop.
  if (i18n.language !== initialLang) {
    i18n.changeLanguage(initialLang);
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
