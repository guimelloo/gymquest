import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/registro", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Rotas públicas
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Rota de API pública
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/register")) {
    // APIs protegidas verificam auth individualmente
    return NextResponse.next();
  }

  // Se não autenticado, redirecionar para login
  if (!req.auth) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
