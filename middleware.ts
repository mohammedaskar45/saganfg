if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET || "saganfg-super-secret-key-2024-change-in-production";
}

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isAuthRoute = nextUrl.pathname === "/login";
  const isPortalRoute = nextUrl.pathname.startsWith("/portal");
  const isLandingRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/landing";
  const isPublicFile = nextUrl.pathname.includes(".") || nextUrl.pathname.startsWith("/_next");

  // Allow landing pages, API routes, and public files to pass through
  if (isApiRoute || isPublicFile || isLandingRoute) {
    return NextResponse.next();
  }

  // Redirect to dashboard if logged in and trying to access login page
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Let portal routes pass through (client portal uses magic link tokens)
  if (isPortalRoute) {
    return NextResponse.next();
  }

  // Redirect to login if not logged in
  if (!isLoggedIn) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except api, _next/static, _next/image, favicon.ico
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
