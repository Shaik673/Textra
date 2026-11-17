import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("textra_session");

  // Validate session expiration if cookie is present
  let isAuthenticated = false;
  if (sessionCookie?.value) {
    try {
      const parts = sessionCookie.value.split(".");
      if (parts.length === 2 && parts[0]) {
        // Safe base64url decode
        const base64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = atob(base64);
        const payload = JSON.parse(jsonStr);
        if (payload && payload.exp && Date.now() < payload.exp) {
          isAuthenticated = true;
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. Protected paths requiring active user authentication
  const isProtectedPath =
    pathname.startsWith("/studio") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated users must not see or access landing page (/) or auth pages (login/signup/verify)
  const isLandingPage = pathname === "/";
  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/verify");

  if ((isLandingPage || isAuthPage) && isAuthenticated) {
    const studioUrl = new URL("/studio", request.url);
    return NextResponse.redirect(studioUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/studio/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/auth/login",
    "/auth/signup",
    "/auth/verify",
  ],
};
