const ALLOWED_PREFIXES = ["/portal", "/admin", "/reset-password"] as const;

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

export function getAuthCallbackUrl(next?: string): string {
  const base =
    typeof window === "undefined"
      ? "/auth/callback"
      : `${window.location.origin}/auth/callback`;

  if (!next) return base;

  const safeNext = getSafeRedirectPath(next);
  return `${base}?next=${encodeURIComponent(safeNext)}`;
}
