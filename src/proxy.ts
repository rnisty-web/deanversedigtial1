import { type NextRequest, NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { isStaffRole } from "@/lib/roles";
import { updateSession } from "@/lib/supabase/session";

const protectedRoutes = ["/admin", "/portal"];
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthRoute(pathname: string) {
  return authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export async function proxy(request: NextRequest) {
  const { response, user, profileRoles } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute(pathname) && user && !isStaffRole(profileRoles)) {
    const portalUrl = request.nextUrl.clone();
    portalUrl.pathname = "/portal";
    portalUrl.searchParams.set("notice", "admin-required");
    return NextResponse.redirect(portalUrl);
  }

  if (isAuthRoute(pathname) && user) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const destination = request.nextUrl.clone();

    if (redirectTo) {
      destination.pathname = getSafeRedirectPath(
        redirectTo,
        isStaffRole(profileRoles) ? "/admin" : "/portal",
      );
      destination.searchParams.delete("redirectTo");
    } else {
      destination.pathname = isStaffRole(profileRoles) ? "/admin" : "/portal";
      destination.search = "";
    }

    return NextResponse.redirect(destination);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
