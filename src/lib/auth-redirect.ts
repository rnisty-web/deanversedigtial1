import { isStaffRole } from "@/lib/roles";

const ALLOWED_PREFIXES = ["/portal", "/admin", "/reset-password"] as const;

type RoleProfile = {
  role?: string | null;
  roles?: string[] | null;
} | null | undefined;

export function getSafeRedirectPath(path: string | null | undefined, fallback = "/portal"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  if (path.includes("\\") || path.includes(":")) {
    return fallback;
  }

  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  return allowed ? path : fallback;
}

/** Block non-staff users from being sent to /admin routes after login or email confirmation. */
export function getRoleAwareRedirectPath(
  profile: RoleProfile,
  requestedPath: string | null | undefined,
  fallback = "/portal",
): string {
  const safe = getSafeRedirectPath(requestedPath, fallback);
  const wantsAdmin = safe === "/admin" || safe.startsWith("/admin/");
  if (wantsAdmin && !isStaffRole(profile)) {
    return "/portal";
  }
  return safe;
}

export function getAuthCallbackUrl(next?: string): string {
  const base =
    typeof window === "undefined"
      ? "/auth/callback"
      : `${window.location.origin}/auth/callback`;

  if (!next) return base;

  const safeNext = getSafeRedirectPath(next);
  return `${base}?next=${encodeURIComponent(safeNext)}`;
}
