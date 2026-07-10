import { siteConfig } from "@/lib/constants";
import { getPresenceStatus } from "@/lib/presence";
import {
  formatRolesLabel,
  isFounderRole,
  isStaffRole,
  type UserRole,
} from "@/lib/roles";
import type { RoleDefinition } from "@/lib/roles/catalog";
import {
  formatPermissionsLabel,
  getEffectiveAdminPermissions,
  mergePermissionsFromRoles,
  type AdminPermission,
} from "@/lib/roles/permissions";
import {
  formatClientPermissionsLabel,
  getEffectiveClientPermissions,
  mergeClientPermissionsFromRoles,
  type ClientPermission,
} from "@/lib/roles/client-permissions";

export type UserRecord = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  roles: UserRole[];
  admin_permissions: AdminPermission[] | null;
  client_permissions: ClientPermission[] | null;
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string | null;
  activity_status: string | null;
};

export type UserFilterTab = "all" | "staff" | "clients" | "online" | "roles";

export function isProtectedFounderAccount(user: UserRecord, founderEmail: string): boolean {
  return (
    isFounderRole(user) ||
    user.email.trim().toLowerCase() === founderEmail.trim().toLowerCase()
  );
}

export function canEditUserRole(
  user: UserRecord,
  founderEmail: string,
  viewerIsFounder: boolean,
): boolean {
  if (!isProtectedFounderAccount(user, founderEmail)) return true;
  return viewerIsFounder;
}

export function userInitials(user: UserRecord) {
  return (user.full_name ?? user.email).charAt(0).toUpperCase();
}

export function sortUsers(users: UserRecord[], founderEmail: string) {
  return [...users].sort((a, b) => {
    const aFounder = isProtectedFounderAccount(a, founderEmail);
    const bFounder = isProtectedFounderAccount(b, founderEmail);
    if (aFounder && !bFounder) return -1;
    if (!aFounder && bFounder) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function filterUsers(
  users: UserRecord[],
  search: string,
  tab: UserFilterTab,
) {
  let list = users;

  if (tab === "staff") {
    list = list.filter((user) => isStaffRole(user.roles ?? user.role));
  } else if (tab === "clients") {
    list = list.filter((user) => !isStaffRole(user.roles ?? user.role));
  } else if (tab === "online") {
    list = list.filter((user) => {
      const status = getPresenceStatus(user.last_seen_at);
      return status === "online" || status === "away";
    });
  }

  const q = search.trim().toLowerCase();
  if (!q) return list;

  return list.filter((user) =>
    [user.full_name, user.email, user.company, user.phone, formatRolesLabel(user.roles ?? user.role)]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(q)),
  );
}

export function computeUserStats(users: UserRecord[]) {
  const onlineCount = users.filter((u) => getPresenceStatus(u.last_seen_at) === "online").length;
  const awayCount = users.filter((u) => getPresenceStatus(u.last_seen_at) === "away").length;
  const staffCount = users.filter((u) => isStaffRole(u.roles ?? u.role)).length;
  const clientCount = users.length - staffCount;

  return {
    total: users.length,
    onlineCount,
    awayCount,
    staffCount,
    clientCount,
  };
}

export function countUsersByRole(users: UserRecord[], roleCatalog: RoleDefinition[] = []) {
  const counts = new Map<string, number>();
  for (const user of users) {
    const roles = user.roles?.length ? user.roles : [user.role];
    for (const role of roles) {
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

  const catalogOrder = new Map(
    roleCatalog.map((role, index) => [role.slug, role.sortOrder ?? index * 10]),
  );

  return [...counts.entries()]
    .sort((a, b) => {
      const orderA = catalogOrder.get(a[0]) ?? 999;
      const orderB = catalogOrder.get(b[0]) ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return b[1] - a[1];
    })
    .map(([role, count]) => ({ role, count }));
}

export function getUserEffectivePermissions(user: UserRecord, roleCatalog: RoleDefinition[]) {
  return getEffectiveAdminPermissions(user, roleCatalog, { isFounder: isFounderRole(user) });
}

export function getInheritedPermissions(user: UserRecord, roleCatalog: RoleDefinition[]) {
  return mergePermissionsFromRoles(user.roles ?? [user.role], roleCatalog);
}

export function getInheritedClientPermissions(user: UserRecord, roleCatalog: RoleDefinition[]) {
  return mergeClientPermissionsFromRoles(user.roles ?? [user.role], roleCatalog);
}

export function getUserEffectiveClientPermissions(user: UserRecord, roleCatalog: RoleDefinition[]) {
  return getEffectiveClientPermissions(user, roleCatalog);
}

export function permissionsSummary(user: UserRecord, roleCatalog: RoleDefinition[]) {
  const effective = getUserEffectivePermissions(user, roleCatalog);
  return formatPermissionsLabel(effective);
}

export function clientPermissionsSummary(user: UserRecord, roleCatalog: RoleDefinition[]) {
  const effective = getUserEffectiveClientPermissions(user, roleCatalog);
  return formatClientPermissionsLabel(effective);
}

export function formatJoinedDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function defaultFounderEmail(ownerEmail: string) {
  return ownerEmail || siteConfig.email;
}

export function portalAccessLabel(user: UserRecord) {
  return isStaffRole(user.roles ?? user.role) ? "Admin + client portals" : "Client portal only";
}
