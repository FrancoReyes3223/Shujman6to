import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This is a static export (no per-request server), so the language can only
  // be resolved client-side from the cookie. Default to "es" here to match
  // i18n's initial state and avoid hydration mismatches.
  return (
    <html
      lang="es"
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
          <I18nProvider initialLang="es">
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
