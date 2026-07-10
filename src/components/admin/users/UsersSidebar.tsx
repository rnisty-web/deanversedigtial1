"use client";

import Link from "next/link";
import { PresenceStat } from "@/components/admin/PresenceIndicator";
import { getRoleLabel } from "@/lib/roles";
import type { RoleDefinition } from "@/lib/roles/catalog";
import type { UserRecord } from "@/lib/users/utils";
import { countUsersByRole, computeUserStats } from "@/lib/users/utils";

type UsersSidebarProps = {
  users: UserRecord[];
  canManageUsers: boolean;
  onInviteUser: () => void;
  onManageRoles?: () => void;
  roleCatalog: RoleDefinition[];
};

export function UsersSidebar({
  users,
  canManageUsers,
  onInviteUser,
  onManageRoles,
  roleCatalog,
}: UsersSidebarProps) {
  const stats = computeUserStats(users);
  const roleCounts = countUsersByRole(users, roleCatalog);

  return (
    <aside className="admin-users-sidebar">
      <div className="admin-users-sidebar-panel">
        <p className="admin-users-sidebar-title">Presence overview</p>
        <div className="admin-users-presence-grid">
          <PresenceStat status="online" count={stats.onlineCount} />
          <PresenceStat status="away" count={stats.awayCount} />
        </div>
        <p className="mt-3 text-xs text-[var(--admin-text-muted)]">
          {stats.staffCount} staff · {stats.clientCount} client accounts
        </p>
      </div>

      <div className="admin-users-sidebar-panel">
        <p className="admin-users-sidebar-title">Roles breakdown</p>
        {roleCounts.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-muted)]">No users yet.</p>
        ) : (
          <ul className="admin-users-role-list">
            {roleCounts.map(({ role, count }) => (
              <li key={role} className="admin-users-role-item">
                <span className="text-sm text-[var(--admin-text-muted)]">{getRoleLabel(role, roleCatalog)}</span>
                <span className="text-sm font-semibold tabular-nums text-[var(--admin-gold-light)]">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="admin-users-sidebar-panel">
        <p className="admin-users-sidebar-title">Quick actions</p>
        <div className="admin-users-quick-grid">
          {canManageUsers ? (
            <button type="button" className="admin-users-quick-btn" onClick={onInviteUser}>
              + Invite user
            </button>
          ) : null}
          {canManageUsers && onManageRoles ? (
            <button type="button" className="admin-users-quick-btn" onClick={onManageRoles}>
              Manage roles
            </button>
          ) : null}
          <Link href="/admin/settings" className="admin-users-quick-btn">
            Settings
          </Link>
          <Link href="/admin/messages" className="admin-users-quick-btn">
            Messages
          </Link>
          <Link href="/admin/clients" className="admin-users-quick-btn">
            Clients
          </Link>
        </div>
      </div>

      <div className="admin-users-sidebar-panel">
        <p className="admin-users-sidebar-title">Security</p>
        <ul className="admin-users-security-list">
          <li>Founder accounts cannot be deleted</li>
          <li>Role changes require staff permissions</li>
          <li>Live presence refreshes every minute</li>
        </ul>
      </div>
    </aside>
  );
}
