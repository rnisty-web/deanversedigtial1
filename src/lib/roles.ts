import {
  DEFAULT_ROLE_CATALOG,
  getActiveRoleCatalog,
  getAssignableRoleDefinitions,
  getLeadCreatorDefinition,
  getRoleDefinition,
  getStaffRoleSlugs,
  roleStyleFromDefinition,
  type RoleDefinition,
} from "@/lib/roles/catalog";

export type UserRole =
  | "admin"
  | "lead_web_designer"
  | "lead_developer"
  | "customer"
  | "client"
  | "founder"
  | (string & {});

export type { RoleDefinition } from "@/lib/roles/catalog";
export { DEFAULT_ROLE_CATALOG } from "@/lib/roles/catalog";

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
  color?: string;
};

const ROLE_STYLE_MAP: Record<string, RoleStyle> = {
  admin: {
    label: "Lead Creator",
    badge:
      "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/45 shadow-[0_0_24px_-6px_rgba(251,113,133,0.45)]",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
    selectBg: "bg-rose-500/10 border-rose-400/30 text-rose-100",
  },
  founder: {
    label: "Lead Creator",
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

/** Sort a user's roles to match catalog display order (same order as role picker). */
export function sortRolesByCatalog(
  roles: UserRole[],
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): UserRole[] {
  const ordered = getActiveRoleCatalog(catalog).sort((a, b) => a.sortOrder - b.sortOrder);
  const orderMap = new Map(ordered.map((def) => [def.slug, def.sortOrder]));

  return [...roles].sort((a, b) => {
    const orderFor = (role: UserRole): number => {
      const definition = getRoleDefinition(catalog, role);
      if (definition) return definition.sortOrder;
      const resolved = resolveRole(role);
      const resolvedDefinition = getRoleDefinition(catalog, resolved);
      if (resolvedDefinition) return resolvedDefinition.sortOrder;
      return orderMap.get(role) ?? orderMap.get(resolved) ?? 1000;
    };

    const diff = orderFor(a) - orderFor(b);
    if (diff !== 0) return diff;
    return String(a).localeCompare(String(b));
  });
}

const FOUNDER_DISPLAY_SLUGS = new Set<UserRole>(["admin", "founder"]);

function isLeadCreatorRole(role: UserRole, catalog: RoleDefinition[]): boolean {
  const label = getRoleLabel(role, catalog).trim().toLowerCase();
  const slug = String(role).toLowerCase();
  return label === "lead creator" || slug.includes("lead_creator");
}

/** Roles for badges and labels — catalog order, without duplicate founder labels. */
export function getDisplayRoles(
  input:
    | UserRole
    | UserRole[]
    | string
    | string[]
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): UserRole[] {
  let sorted = sortRolesByCatalog(parseUserRoles(input), catalog);
  const hasLeadCreator = sorted.some((role) => isLeadCreatorRole(role, catalog));

  if (hasLeadCreator) {
    sorted = sorted.filter(
      (role) => !FOUNDER_DISPLAY_SLUGS.has(resolveRole(role)) && role !== "founder",
    );
  }

  const seenLabels = new Set<string>();
  return sorted.filter((role) => {
    const label = getRoleLabel(role, catalog).trim().toLowerCase();
    if (seenLabels.has(label)) return false;
    seenLabels.add(label);
    return true;
  });
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
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): UserRole {
  const roles = parseUserRoles(input);
  const ordered = getActiveRoleCatalog(catalog).sort((a, b) => a.sortOrder - b.sortOrder);
  for (const definition of ordered) {
    if (roles.includes(definition.slug as UserRole)) {
      return definition.slug as UserRole;
    }
  }

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
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): boolean {
  const staffSlugs = new Set(getStaffRoleSlugs(catalog));
  return parseUserRoles(input).some((role) => {
    const resolved = resolveRole(role);
    if (resolved === "admin") return true;
    return staffSlugs.has(resolved) || staffSlugs.has(role);
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

export function getRoleLabel(role: UserRole | string, catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG): string {
  const resolved = resolveRole(role);
  if (resolved === "admin" || role === "founder") {
    return getLeadCreatorDefinition(catalog)?.label ?? "Lead Creator";
  }

  const definition = getRoleDefinition(catalog, resolved);
  if (definition) return definition.label;
  return ROLE_STYLE_MAP[resolved]?.label ?? String(role);
}

export function getRoleStyle(role: UserRole | string, catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG): RoleStyle {
  const resolved = resolveRole(role);
  if (resolved === "admin" || role === "founder") {
    const leadCreator = getLeadCreatorDefinition(catalog);
    if (leadCreator) return roleStyleFromDefinition(leadCreator);
    return ROLE_STYLE_MAP.admin;
  }

  const definition = getRoleDefinition(catalog, resolved);
  if (definition) return roleStyleFromDefinition(definition);
  return ROLE_STYLE_MAP[resolved] ?? ROLE_STYLE_MAP.customer;
}

export function getRoleBadgeClass(role: UserRole | string): string {
  return getRoleStyle(role).badge;
}

export function getRoleSelectClass(role: UserRole | string): string {
  return getRoleStyle(role).selectBg;
}

export function toAssignableRole(
  role: UserRole | string | null | undefined,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): UserRole {
  if (!role) return "customer";
  const definition = getRoleDefinition(catalog, role);
  if (definition) return definition.slug as UserRole;
  const resolved = resolveRole(role);
  if (getRoleDefinition(catalog, resolved)) return resolved;
  return resolved;
}

export function toAssignableRoles(
  input:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): UserRole[] {
  const parsed = parseUserRoles(input);
  const assignable = parsed
    .map((role) => toAssignableRole(role, catalog))
    .filter((role, index, self) => self.indexOf(role) === index);
  return assignable.length > 0 ? assignable : ["customer"];
}

export function isValidAssignableRole(
  role: string,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): role is UserRole {
  return getActiveRoleCatalog(catalog).some((item) => item.slug === resolveRole(role));
}

export function canAssignRole(
  role: UserRole | string,
  assignerIsFounder: boolean,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): boolean {
  const definition = getRoleDefinition(catalog, role);
  if (!definition || definition.archived) return false;
  if (definition.founderOnly && !assignerIsFounder) return false;
  return true;
}

export function getRoleAssignmentError(
  roles: UserRole[],
  assignerIsFounder: boolean,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): string | null {
  if (roles.length === 0) return "At least one role is required.";

  for (const role of roles) {
    const definition = getRoleDefinition(catalog, role);
    if (!definition) {
      return `Unknown role "${role}". Refresh the page and try again.`;
    }
    if (definition.archived) {
      return `The "${definition.label}" role is archived and cannot be assigned.`;
    }
    if (definition.founderOnly && !assignerIsFounder) {
      return `Only the founder can assign the ${definition.label} role.`;
    }
    if (!canAssignRole(role, assignerIsFounder, catalog)) {
      return `You do not have permission to assign the ${definition.label} role.`;
    }
  }

  return null;
}

export function canAssignRoles(
  roles: UserRole[],
  assignerIsFounder: boolean,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): boolean {
  if (roles.length === 0) return false;
  return roles.every((role) => canAssignRole(role, assignerIsFounder, catalog));
}

export function getAssignableRolesForUser(
  assignerIsFounder: boolean,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): UserRole[] {
  return getAssignableRoleDefinitions(catalog, assignerIsFounder).map((role) => role.slug as UserRole);
}

/** Normalize and validate roles for persistence */
export function persistRoles(
  roles: UserRole[] | undefined,
  fallback?: UserRole | string | null,
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): UserRole[] {
  const parsed = parseUserRoles(roles?.length ? roles : fallback ?? "customer");
  const persisted = parsed
    .map((role) => {
      const definition = getRoleDefinition(catalog, role);
      if (definition) return definition.slug as UserRole;
      const resolved = resolveRole(role);
      if (resolved === "admin") return "admin" as UserRole;
      if (getRoleDefinition(catalog, resolved)) return resolved;
      return resolved;
    })
    .filter((role, index, self) => self.indexOf(role) === index);

  return persisted.length > 0 ? persisted : ["customer"];
}

export function formatRolesLabel(
  roles: UserRole[] | string[],
  catalog: RoleDefinition[] = DEFAULT_ROLE_CATALOG,
): string {
  return getDisplayRoles(roles, catalog).map((role) => getRoleLabel(role, catalog)).join(", ");
}
