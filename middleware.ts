import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/registro",
  "/api/auth",
  "/offline",        // PWA offline page
  "/manifest.webmanifest",
];

// Static file extensions + PWA routes served without auth
const SKIP_PATTERN =
  /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$|^\/(icon|apple-icon)(\.png)?$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets and PWA icon routes
  if (SKIP_PATTERN.test(pathname)) return NextResponse.next();

  // Public routes always allowed
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session token cookie (NextAuth v5 / Auth.js)
  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
