import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import I18nProvider from "../components/I18nProvider";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/ThemeProvider";
import { UserProvider } from "../lib/UserContext";
import { WorkspaceProvider } from "../lib/WorkspaceContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShujmanB2B",
  description: "Sistema de gestión B2B",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the language from the cookie on the server so SSR renders in the
  // same language the client will, avoiding hydration mismatches.
  const lang = (await cookies()).get("i18next")?.value === "en" ? "en" : "es";
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('shujman-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <I18nProvider initialLang={lang}>
            <UserProvider>
              <WorkspaceProvider>
                <Navbar />
                {children}
              </WorkspaceProvider>
            </UserProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
