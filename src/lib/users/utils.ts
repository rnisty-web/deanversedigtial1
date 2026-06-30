import { siteConfig } from "@/lib/constants";
import { getPresenceStatus } from "@/lib/presence";
import {
  formatRolesLabel,
  isFounderRole,
  isStaffRole,
  type UserRole,
} from "@/lib/roles";

export type UserRecord = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  roles: UserRole[];
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

export function countUsersByRole(users: UserRecord[]) {
  const counts = new Map<string, number>();
  for (const user of users) {
    const roles = user.roles?.length ? user.roles : [user.role];
    for (const role of roles) {
      counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([role, count]) => ({ role, count }));
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
