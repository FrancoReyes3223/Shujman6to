import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas que requieren autenticación (cookie "token")
const protectedRoutes = ["/dashboard"];

// Rutas públicas (login y registro) — si ya tiene cookie, redirigir al dashboard
const authRoutes = ["/", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Si intenta acceder a una ruta protegida sin cookie → redirigir al login
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Si ya tiene cookie y va al login/register → redirigir al dashboard
  if (authRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/register", "/dashboard/:path*"],
};
