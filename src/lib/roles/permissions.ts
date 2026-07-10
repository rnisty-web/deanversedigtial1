import type { RoleDefinition } from "@/lib/roles/catalog";
import { getRoleDefinition } from "@/lib/roles/catalog";
import { isFounderRole, parseUserRoles, type UserRole } from "@/lib/roles";

export const ADMIN_PERMISSIONS = [
  "dashboard",
  "site_content",
  "portfolio",
  "testimonials",
  "media",
  "leads",
  "clients",
  "projects",
  "messages",
  "invoices",
  "calendar",
  "analytics",
  "users",
  "settings",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export type AdminPermissionMeta = {
  key: AdminPermission;
  label: string;
  description: string;
  group: "Overview" | "Content" | "Business" | "System";
};

export const ADMIN_PERMISSION_META: AdminPermissionMeta[] = [
  { key: "dashboard", label: "Dashboard", description: "View the admin home overview", group: "Overview" },
  { key: "site_content", label: "Site Content", description: "Edit homepage and marketing copy", group: "Content" },
  { key: "portfolio", label: "Portfolio", description: "Manage portfolio projects", group: "Content" },
  { key: "testimonials", label: "Testimonials", description: "Manage client testimonials", group: "Content" },
  { key: "media", label: "Media Library", description: "Upload and organize media files", group: "Content" },
  { key: "leads", label: "Leads", description: "Review and manage inbound leads", group: "Business" },
  { key: "clients", label: "Clients", description: "Manage client accounts", group: "Business" },
  { key: "projects", label: "Projects", description: "Manage client projects", group: "Business" },
  { key: "messages", label: "Messages", description: "Read and send portal messages", group: "Business" },
  { key: "invoices", label: "Invoices", description: "Create and manage invoices", group: "Business" },
  { key: "calendar", label: "Calendar", description: "Manage scheduling and events", group: "Business" },
  { key: "analytics", label: "Analytics", description: "View traffic and performance data", group: "System" },
  { key: "users", label: "Users & Roles", description: "Manage team accounts and roles", group: "System" },
  { key: "settings", label: "Settings", description: "Change workspace settings", group: "System" },
];

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [...ADMIN_PERMISSIONS];

const PERMISSION_SET = new Set<string>(ADMIN_PERMISSIONS);

export function isAdminPermission(value: string): value is AdminPermission {
  return PERMISSION_SET.has(value);
}

export function parseAdminPermissions(raw: unknown): AdminPermission[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is AdminPermission => typeof item === "string" && isAdminPermission(item));
}

export function sanitizeAdminPermissions(raw: unknown): AdminPermission[] {
  const parsed = parseAdminPermissions(raw);
  return [...new Set(parsed)];
}

const DEFAULT_ROLE_PERMISSIONS: Record<string, AdminPermission[]> = {
  admin: ALL_ADMIN_PERMISSIONS,
  lead_developer: [
    "dashboard",
    "site_content",
    "portfolio",
    "testimonials",
    "media",
    "leads",
    "clients",
    "projects",
    "messages",
    "invoices",
    "calendar",
    "analytics",
    "settings",
  ],
  lead_web_designer: [
    "dashboard",
    "site_content",
    "portfolio",
    "testimonials",
    "media",
    "projects",
    "messages",
    "clients",
    "calendar",
  ],
  customer: [],
};

export function getDefaultPermissionsForRoleSlug(slug: string): AdminPermission[] {
  const resolved = slug === "founder" ? "admin" : slug;
  return DEFAULT_ROLE_PERMISSIONS[resolved] ?? (resolved.startsWith("custom_") ? ["dashboard", "messages"] : []);
}

export function getRolePermissions(definition: RoleDefinition | undefined): AdminPermission[] {
  if (!definition) return [];
  if (definition.permissions?.length) return sanitizeAdminPermissions(definition.permissions);
  if (definition.isStaff) return getDefaultPermissionsForRoleSlug(definition.slug);
  return [];
}

export function mergePermissionsFromRoles(
  roles: UserRole[],
  catalog: RoleDefinition[],
): AdminPermission[] {
  const merged = new Set<AdminPermission>();
  for (const role of roles) {
    for (const permission of getRolePermissions(getRoleDefinition(catalog, role))) {
      merged.add(permission);
    }
  }
  return [...merged];
}

type PermissionProfile = {
  role?: UserRole | string | null;
  roles?: UserRole[] | string[] | null;
  admin_permissions?: AdminPermission[] | string[] | null;
};

export function getEffectiveAdminPermissions(
  profile: PermissionProfile,
  catalog: RoleDefinition[],
  options?: { isFounder?: boolean },
): AdminPermission[] {
  if (options?.isFounder || isFounderRole(profile)) {
    return ALL_ADMIN_PERMISSIONS;
  }

  if (profile.admin_permissions !== undefined && profile.admin_permissions !== null) {
    return sanitizeAdminPermissions(profile.admin_permissions);
  }

  const roles = parseUserRoles(profile);
  return mergePermissionsFromRoles(roles, catalog);
}

export function hasAdminPermission(
  profile: PermissionProfile,
  permission: AdminPermission,
  catalog: RoleDefinition[],
  options?: { isFounder?: boolean },
): boolean {
  return getEffectiveAdminPermissions(profile, catalog, options).includes(permission);
}

export function permissionForAdminHref(href: string): AdminPermission {
  if (href === "/admin") return "dashboard";
  if (href.startsWith("/admin/content")) return "site_content";
  if (href.startsWith("/admin/portfolio")) return "portfolio";
  if (href.startsWith("/admin/testimonials")) return "testimonials";
  if (href.startsWith("/admin/media")) return "media";
  if (href.startsWith("/admin/leads")) return "leads";
  if (href.startsWith("/admin/clients")) return "clients";
  if (href.startsWith("/admin/projects")) return "projects";
  if (href.startsWith("/admin/messages")) return "messages";
  if (href.startsWith("/admin/invoices")) return "invoices";
  if (href.startsWith("/admin/calendar")) return "calendar";
  if (href.startsWith("/admin/analytics")) return "analytics";
  if (href.startsWith("/admin/users")) return "users";
  if (href.startsWith("/admin/settings")) return "settings";
  return "dashboard";
}

export function canAccessAdminHref(
  profile: PermissionProfile,
  href: string,
  catalog: RoleDefinition[],
  options?: { isFounder?: boolean },
): boolean {
  return hasAdminPermission(profile, permissionForAdminHref(href), catalog, options);
}

export function formatPermissionsLabel(permissions: AdminPermission[]): string {
  if (permissions.length === 0) return "No admin access";
  if (permissions.length === ALL_ADMIN_PERMISSIONS.length) return "Full access";
  const labels = ADMIN_PERMISSION_META.filter((item) => permissions.includes(item.key)).map(
    (item) => item.label,
  );
  if (labels.length <= 3) return labels.join(", ");
  return `${labels.slice(0, 3).join(", ")} +${labels.length - 3} more`;
}
