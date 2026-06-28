export type UserRole =
  | "admin"
  | "lead_web_designer"
  | "lead_developer"
  | "customer"
  | "client"
  | "founder";

/** @deprecated Use UserRole — kept for backward compatibility during migration */
export type LegacyUserRole = UserRole;

/** Staff roles that can access the admin portal */
export const STAFF_ROLES: UserRole[] = [
  "admin",
  "founder",
  "lead_developer",
  "lead_web_designer",
];

/** Roles staff can assign when creating or editing users */
export const ASSIGNABLE_ROLES: UserRole[] = [
  "admin",
  "lead_developer",
  "lead_web_designer",
  "customer",
];

export const FOUNDER_ROLES: UserRole[] = ["admin", "founder"];

/** Roles only the founder may assign (e.g. another Founder) */
export const FOUNDER_ONLY_ASSIGNABLE_ROLES: UserRole[] = ["admin"];

const PRIMARY_ROLE_PRIORITY: UserRole[] = [
  "admin",
  "lead_developer",
  "lead_web_designer",
  "customer",
];

export type RoleStyle = {
  label: string;
  badge: string;
  dot: string;
  selectBg: string;
};

const ROLE_STYLE_MAP: Record<string, RoleStyle> = {
  admin: {
    label: "Founder",
    badge:
      "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/45 shadow-[0_0_24px_-6px_rgba(251,113,133,0.45)]",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
    selectBg: "bg-rose-500/10 border-rose-400/30 text-rose-100",
  },
  founder: {
    label: "Founder",
    badge:
      "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/45 shadow-[0_0_24px_-6px_rgba(251,113,133,0.45)]",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
    selectBg: "bg-rose-500/10 border-rose-400/30 text-rose-100",
  },
  lead_developer: {
    label: "Lead Developer",
    badge:
      "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/40 shadow-[0_0_24px_-6px_rgba(34,211,238,0.35)]",
    dot: "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]",
    selectBg: "bg-cyan-500/10 border-cyan-400/30 text-cyan-100",
  },
  lead_web_designer: {
    label: "Lead Web Designer",
    badge:
      "bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/40 shadow-[0_0_24px_-6px_rgba(167,139,250,0.35)]",
    dot: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.7)]",
    selectBg: "bg-violet-500/10 border-violet-400/30 text-violet-100",
  },
  customer: {
    label: "Customer",
    badge:
      "bg-amber-500/12 text-amber-100 ring-1 ring-amber-400/35 shadow-[0_0_20px_-8px_rgba(251,191,36,0.3)]",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    selectBg: "bg-amber-500/10 border-amber-400/30 text-amber-100",
  },
  client: {
    label: "Customer",
    badge:
      "bg-amber-500/12 text-amber-100 ring-1 ring-amber-400/35 shadow-[0_0_20px_-8px_rgba(251,191,36,0.3)]",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    selectBg: "bg-amber-500/10 border-amber-400/30 text-amber-100",
  },
};

/** Resolve legacy aliases without merging distinct staff roles */
export function resolveRole(role: UserRole | string | null | undefined): UserRole {
  switch (role) {
    case "founder":
      return "admin";
    case "client":
      return "customer";
    default:
      return (role as UserRole) ?? "customer";
  }
}

/** @deprecated Use resolveRole — kept for callers during migration */
export function normalizeRole(role: UserRole | string | null | undefined): UserRole {
  return resolveRole(role);
}

/** Parse single role, roles array, or profile-shaped input into a deduplicated role list */
export function parseUserRoles(
  input:
    | UserRole
    | UserRole[]
    | string
    | string[]
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
): UserRole[] {
  if (!input) return ["customer"];

  if (typeof input === "object" && !Array.isArray(input) && ("role" in input || "roles" in input)) {
    const fromArray = input.roles?.length ? input.roles : null;
    const fromSingle = input.role ?? null;
    const raw = fromArray ?? (fromSingle ? [fromSingle] : ["customer"]);
    return dedupeRoles(raw.map((r) => resolveRole(r)));
  }

  const raw: (UserRole | string)[] = Array.isArray(input)
    ? input
    : [input as UserRole | string];
  const resolved = dedupeRoles(raw.map((r) => resolveRole(r)));
  return resolved.length > 0 ? resolved : ["customer"];
}

function dedupeRoles(roles: UserRole[]): UserRole[] {
  const seen = new Set<UserRole>();
  const result: UserRole[] = [];
  for (const role of roles) {
    if (!seen.has(role)) {
      seen.add(role);
      result.push(role);
    }
  }
  return result;
}

/** Highest-priority role for legacy single-role column and display fallbacks */
export function getPrimaryRole(
  input:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
): UserRole {
  const roles = parseUserRoles(input);
  for (const priority of PRIMARY_ROLE_PRIORITY) {
    if (roles.includes(priority)) return priority;
  }
  return roles[0] ?? "customer";
}

export function isStaffRole(
  input:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
): boolean {
  return parseUserRoles(input).some((role) => {
    if (role === "admin") return true;
    return STAFF_ROLES.includes(role);
  });
}

export function isCustomerRole(
  input:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
): boolean {
  const roles = parseUserRoles(input);
  const hasCustomer = roles.some((role) => resolveRole(role) === "customer");
  return hasCustomer && !isStaffRole(roles);
}

export function isFounderRole(
  input:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
): boolean {
  return parseUserRoles(input).some(
    (role) => resolveRole(role) === "admin" || role === "founder",
  );
}

export function getRoleLabel(role: UserRole | string): string {
  return ROLE_STYLE_MAP[resolveRole(role)]?.label ?? String(role);
}

export function getRoleStyle(role: UserRole | string): RoleStyle {
  return ROLE_STYLE_MAP[resolveRole(role)] ?? ROLE_STYLE_MAP.customer;
}

export function getRoleBadgeClass(role: UserRole | string): string {
  return getRoleStyle(role).badge;
}

export function getRoleSelectClass(role: UserRole | string): string {
  return getRoleStyle(role).selectBg;
}

export function toAssignableRole(role: UserRole | string | null | undefined): UserRole {
  const resolved = resolveRole(role);
  if (ASSIGNABLE_ROLES.includes(resolved)) return resolved;
  return "customer";
}

export function toAssignableRoles(
  input:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
): UserRole[] {
  const parsed = parseUserRoles(input);
  const assignable = parsed
    .map((role) => toAssignableRole(role))
    .filter((role, index, self) => self.indexOf(role) === index);
  return assignable.length > 0 ? assignable : ["customer"];
}

export function isValidAssignableRole(role: string): role is UserRole {
  return ASSIGNABLE_ROLES.includes(role as UserRole);
}

export function canAssignRole(
  role: UserRole | string,
  assignerIsFounder: boolean,
): boolean {
  const resolved = resolveRole(role);
  if (!isValidAssignableRole(resolved)) return false;
  if (FOUNDER_ONLY_ASSIGNABLE_ROLES.includes(resolved)) {
    return assignerIsFounder;
  }
  return true;
}

export function canAssignRoles(roles: UserRole[], assignerIsFounder: boolean): boolean {
  if (roles.length === 0) return false;
  return roles.every((role) => canAssignRole(role, assignerIsFounder));
}

export function getAssignableRolesForUser(assignerIsFounder: boolean): UserRole[] {
  return ASSIGNABLE_ROLES.filter((role) => canAssignRole(role, assignerIsFounder));
}

/** Normalize and validate roles for persistence */
export function persistRoles(
  roles: UserRole[] | undefined,
  fallback?: UserRole | string | null,
): UserRole[] {
  const parsed = parseUserRoles(roles?.length ? roles : fallback ?? "customer");
  const persisted = parsed
    .map((role) => {
      const resolved = resolveRole(role);
      if (resolved === "admin") return "admin" as UserRole;
      if (isValidAssignableRole(resolved)) return resolved;
      return "customer" as UserRole;
    })
    .filter((role, index, self) => self.indexOf(role) === index);

  return persisted.length > 0 ? persisted : ["customer"];
}

export function formatRolesLabel(roles: UserRole[] | string[]): string {
  return parseUserRoles(roles).map((role) => getRoleLabel(role)).join(", ");
}
