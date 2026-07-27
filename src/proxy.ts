import { type NextRequest, NextResponse } from "next/server";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { workspaceHrefForLegacyPath } from "@/lib/workspace/modules";
import { updateSession } from "@/lib/supabase/session";

const protectedRoutes = ["/workspace", "/admin", "/portal"];
const authRoutes = [
  "/login",
  "/login/creators",
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

function isLegacyPortalRoute(pathname: string) {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/portal" ||
    pathname.startsWith("/portal/")
  );
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    homeUrl.search = "";
    return NextResponse.redirect(homeUrl);
  }

  // Permanent unification: old admin/client portal URLs land in Workspace.
  if (isLegacyPortalRoute(pathname)) {
    const destination = request.nextUrl.clone();
    destination.pathname = workspaceHrefForLegacyPath(pathname);
    return NextResponse.redirect(destination);
  }

  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && user) {
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    const destination = request.nextUrl.clone();

    if (redirectTo) {
      destination.pathname = getSafeRedirectPath(redirectTo, "/workspace");
      destination.searchParams.delete("redirectTo");
    } else {
      destination.pathname = "/workspace";
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
