import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("textra_session");

  // Protected paths requiring active user authentication
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  if (isProtectedPath && !sessionCookie?.value) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in, redirect away from login/signup to dashboard
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";
  if (isAuthPage && sessionCookie?.value) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/auth/login", "/auth/signup"],
};
