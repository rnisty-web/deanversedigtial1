import type { RoleDefinition } from "@/lib/roles/catalog";
import { getRoleDefinition } from "@/lib/roles/catalog";
import { isStaffRole, parseUserRoles, type UserRole } from "@/lib/roles";

export const CLIENT_PERMISSIONS = [
  "dashboard",
  "projects",
  "files",
  "messages",
  "invoices",
  "account",
] as const;

export type ClientPermission = (typeof CLIENT_PERMISSIONS)[number];

export type ClientPermissionMeta = {
  key: ClientPermission;
  label: string;
  description: string;
};

export const CLIENT_PERMISSION_META: ClientPermissionMeta[] = [
  { key: "dashboard", label: "Dashboard", description: "Portal home overview and activity" },
  { key: "projects", label: "My Project", description: "View project status and milestones" },
  { key: "files", label: "Files", description: "Download and upload project files" },
  { key: "messages", label: "Messages", description: "Chat with the project team" },
  { key: "invoices", label: "Invoices", description: "View and pay invoices" },
  { key: "account", label: "Account", description: "Update profile and password" },
];

export const ALL_CLIENT_PERMISSIONS: ClientPermission[] = [...CLIENT_PERMISSIONS];

const PERMISSION_SET = new Set<string>(CLIENT_PERMISSIONS);

export function isClientPermission(value: string): value is ClientPermission {
  return PERMISSION_SET.has(value);
}

export function sanitizeClientPermissions(raw: unknown): ClientPermission[] {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((item): item is ClientPermission => typeof item === "string" && isClientPermission(item)))];
}

export function parseClientPermissions(raw: unknown): ClientPermission[] {
  return sanitizeClientPermissions(raw);
}

const DEFAULT_ROLE_CLIENT_PERMISSIONS: Record<string, ClientPermission[]> = {
  customer: ALL_CLIENT_PERMISSIONS,
  client: ALL_CLIENT_PERMISSIONS,
};

export function getDefaultClientPermissionsForRoleSlug(slug: string): ClientPermission[] {
  const resolved = slug === "client" ? "customer" : slug;
  return DEFAULT_ROLE_CLIENT_PERMISSIONS[resolved] ?? [];
}

export function getRoleClientPermissions(definition: RoleDefinition | undefined): ClientPermission[] {
  if (!definition) return [];
  if (definition.clientPermissions?.length) {
    return sanitizeClientPermissions(definition.clientPermissions);
  }
  if (!definition.isStaff || definition.slug === "customer") {
    return getDefaultClientPermissionsForRoleSlug(definition.slug);
  }
  return [];
}

export function mergeClientPermissionsFromRoles(
  roles: UserRole[],
  catalog: RoleDefinition[],
): ClientPermission[] {
  const merged = new Set<ClientPermission>();
  for (const role of roles) {
    for (const permission of getRoleClientPermissions(getRoleDefinition(catalog, role))) {
      merged.add(permission);
    }
  }
  return [...merged];
}

type ClientPermissionProfile = {
  role?: UserRole | string | null;
  roles?: UserRole[] | string[] | null;
  client_permissions?: ClientPermission[] | string[] | null;
};

export function getEffectiveClientPermissions(
  profile: ClientPermissionProfile,
  catalog: RoleDefinition[],
): ClientPermission[] {
  if (profile.client_permissions !== undefined && profile.client_permissions !== null) {
    return sanitizeClientPermissions(profile.client_permissions);
  }

  const roles = parseUserRoles(profile);
  const merged = mergeClientPermissionsFromRoles(roles, catalog);

  if (merged.length > 0) return merged;

  if (isStaffRole(profile, catalog)) {
    return ["dashboard"];
  }

  return ALL_CLIENT_PERMISSIONS;
}

export function hasClientPermission(
  profile: ClientPermissionProfile,
  permission: ClientPermission,
  catalog: RoleDefinition[],
): boolean {
  return getEffectiveClientPermissions(profile, catalog).includes(permission);
}

export function permissionForPortalHref(href: string): ClientPermission {
  if (href === "/portal") return "dashboard";
  if (href.startsWith("/portal/projects")) return "projects";
  if (href.startsWith("/portal/files")) return "files";
  if (href.startsWith("/portal/messages")) return "messages";
  if (href.startsWith("/portal/invoices")) return "invoices";
  if (href.startsWith("/portal/account")) return "account";
  return "dashboard";
}

export function canAccessPortalHref(
  profile: ClientPermissionProfile,
  href: string,
  catalog: RoleDefinition[],
): boolean {
  return hasClientPermission(profile, permissionForPortalHref(href), catalog);
}

export function formatClientPermissionsLabel(permissions: ClientPermission[]): string {
  if (permissions.length === 0) return "No client portal access";
  if (permissions.length === ALL_CLIENT_PERMISSIONS.length) return "Full client access";
  const labels = CLIENT_PERMISSION_META.filter((item) => permissions.includes(item.key)).map(
    (item) => item.label,
  );
  if (labels.length <= 3) return labels.join(", ");
  return `${labels.slice(0, 3).join(", ")} +${labels.length - 3} more`;
}
