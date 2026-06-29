"use client";

import { ActivityStatusBadge } from "@/components/admin/ActivityStatusPicker";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { PresenceIndicator } from "@/components/admin/PresenceIndicator";
import { Button } from "@/components/ui/Button";
import { RoleBadges } from "@/components/ui/RoleBadges";
import { RoleMultiSelect } from "@/components/ui/RoleMultiSelect";
import type { UserRole } from "@/lib/roles";
import type { UserRecord } from "@/lib/users/utils";
import {
  canEditUserRole,
  formatJoinedDate,
  isProtectedFounderAccount,
  portalAccessLabel,
} from "@/lib/users/utils";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

type UsersDetailPanelProps = {
  user: UserRecord | null;
  founderEmail: string;
  canManageUsers: boolean;
  viewerIsFounder: boolean;
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
  onRoleChange: (user: UserRecord, roles: UserRole[]) => void;
  onBack?: () => void;
  hidden?: boolean;
};

export function UsersDetailPanel({
  user,
  founderEmail,
  canManageUsers,
  viewerIsFounder,
  onEdit,
  onDelete,
  onRoleChange,
  onBack,
  hidden,
}: UsersDetailPanelProps) {
  if (!user) {
    return (
      <section className={cn("admin-users-detail-panel", hidden && "admin-users-panel-hidden")}>
        <AdminEmptyState
          title="Select a user"
          description="Choose someone from the directory to review profile details, roles, and live status."
          className="admin-users-detail-empty"
        />
      </section>
    );
  }

  const isFounder = isProtectedFounderAccount(user, founderEmail);
  const roleEditable =
    canManageUsers && canEditUserRole(user, founderEmail, viewerIsFounder);

  return (
    <section className={cn("admin-users-detail-panel", hidden && "admin-users-panel-hidden")}>
      {onBack ? (
        <button type="button" onClick={onBack} className="admin-users-back-btn xl:hidden">
          ← Back to directory
        </button>
      ) : null}

      <div className="admin-users-detail-header">
        <div className="flex items-start gap-4 min-w-0">
          <UserAvatar user={user} className="h-16 w-16 text-lg" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold-light)]">
              User profile
            </p>
            <h2 className="mt-2 truncate text-2xl font-semibold text-[var(--admin-text)]">
              {user.full_name ?? "Unnamed user"}
            </h2>
            <p className="mt-1 truncate text-sm text-[var(--admin-text-muted)]">{user.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PresenceIndicator
                lastSeenAt={user.last_seen_at}
                showLabel
                showLastSeen
                size={isFounder ? "lg" : "md"}
                prominent={isFounder}
              />
              <ActivityStatusBadge status={user.activity_status ?? "Available"} />
            </div>
          </div>
        </div>

        {canManageUsers ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => onEdit(user)}>
              Edit profile
            </Button>
            {!isFounder ? (
              <Button size="sm" variant="danger" onClick={() => onDelete(user)}>
                Remove
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="admin-users-detail-grid">
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Company</p>
          <p className="admin-users-detail-value">{user.company ?? "Not provided"}</p>
        </div>
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Phone</p>
          <p className="admin-users-detail-value">{user.phone ?? "Not provided"}</p>
        </div>
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Joined</p>
          <p className="admin-users-detail-value">{formatJoinedDate(user.created_at)}</p>
        </div>
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Portal access</p>
          <p className="admin-users-detail-value">{portalAccessLabel(user)}</p>
        </div>
      </div>

      <div className="admin-users-roles-panel">
        <div>
          <p className="admin-users-detail-label">Roles & permissions</p>
          <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
            {roleEditable
              ? "Toggle roles below. At least one role is required."
              : isFounder
                ? "Founder role is protected."
                : "You cannot edit this account's roles."}
          </p>
        </div>
        <div className="mt-4">
          {roleEditable ? (
            <RoleMultiSelect
              value={user.roles ?? user.role}
              onChange={(roles) => onRoleChange(user, roles)}
              assignerIsFounder={viewerIsFounder}
            />
          ) : (
            <RoleBadges roles={user.roles ?? user.role} size="md" />
          )}
        </div>
      </div>
    </section>
  );
}
