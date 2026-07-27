import { isStaffRole } from "@/lib/roles";
import { workspaceHrefForLegacyPath } from "@/lib/workspace/modules";

const ALLOWED_PREFIXES = ["/workspace", "/portal", "/admin", "/reset-password"] as const;

type RoleProfile = {
  role?: string | null;
  roles?: string[] | null;
} | null | undefined;

export function getSafeRedirectPath(path: string | null | undefined, fallback = "/workspace"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }

  if (path.includes("\\") || path.includes(":")) {
    return fallback;
  }

  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  if (!allowed) return fallback;

  // Normalize legacy portal/admin destinations onto the unified workspace.
  if (path === "/admin" || path.startsWith("/admin/") || path === "/portal" || path.startsWith("/portal/")) {
    return workspaceHrefForLegacyPath(path);
  }

  return path;
}

/** After login, send every authenticated user into DeanVerse Workspace. */
export function getRoleAwareRedirectPath(
  profile: RoleProfile,
  requestedPath: string | null | undefined,
  fallback = "/workspace",
): string {
  void profile;
  return getSafeRedirectPath(requestedPath, fallback);
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

/** @deprecated Staff/client split is gone — kept for callers during migration. */
export function getDefaultPostLoginPath(profile: RoleProfile): string {
  void profile;
  return "/workspace";
}

export function isStaffProfile(profile: RoleProfile): boolean {
  return isStaffRole(profile);
}
