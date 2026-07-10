"use client";

import { useEffect, useMemo, useState } from "react";
import { ActivityStatusBadge } from "@/components/admin/ActivityStatusPicker";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { PermissionsEditor } from "@/components/admin/users/PermissionsEditor";
import { PresenceIndicator } from "@/components/admin/PresenceIndicator";
import { Button } from "@/components/ui/Button";
import { RoleBadges } from "@/components/ui/RoleBadges";
import { RoleMultiSelect } from "@/components/ui/RoleMultiSelect";
import type { UserRole } from "@/lib/roles";
import { toAssignableRoles } from "@/lib/roles";
import type { RoleDefinition } from "@/lib/roles/catalog";
import type { AdminPermission } from "@/lib/roles/permissions";
import type { UserRecord } from "@/lib/users/utils";
import {
  canEditUserRole,
  formatJoinedDate,
  getInheritedPermissions,
  getUserEffectivePermissions,
  isProtectedFounderAccount,
  permissionsSummary,
  portalAccessLabel,
} from "@/lib/users/utils";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

type UserAccessDraft = {
  roles: UserRole[];
  permissionsInherit: boolean;
  customPermissions: AdminPermission[];
};

type UsersDetailPanelProps = {
  user: UserRecord | null;
  founderEmail: string;
  canManageUsers: boolean;
  viewerIsFounder: boolean;
  roleCatalog: RoleDefinition[];
  onEdit: (user: UserRecord) => void;
  onDelete: (user: UserRecord) => void;
  onSaveAccess: (
    user: UserRecord,
    draft: UserAccessDraft,
  ) => Promise<void>;
  onBack?: () => void;
  hidden?: boolean;
  savingAccess?: boolean;
};

function buildAccessDraft(user: UserRecord, roleCatalog: RoleDefinition[]): UserAccessDraft {
  const hasCustomPermissions = user.admin_permissions !== null && user.admin_permissions !== undefined;
  return {
    roles: toAssignableRoles(user, roleCatalog),
    permissionsInherit: !hasCustomPermissions,
    customPermissions: hasCustomPermissions
      ? (user.admin_permissions ?? [])
      : getInheritedPermissions(user, roleCatalog),
  };
}

export function UsersDetailPanel({
  user,
  founderEmail,
  canManageUsers,
  viewerIsFounder,
  roleCatalog,
  onEdit,
  onDelete,
  onSaveAccess,
  onBack,
  hidden,
  savingAccess = false,
}: UsersDetailPanelProps) {
  const [draft, setDraft] = useState<UserAccessDraft | null>(null);

  useEffect(() => {
    if (!user) {
      setDraft(null);
      return;
    }
    setDraft(buildAccessDraft(user, roleCatalog));
  }, [user, roleCatalog]);

  const isDirty = useMemo(() => {
    if (!user || !draft) return false;
    const baseline = buildAccessDraft(user, roleCatalog);
    return JSON.stringify(draft) !== JSON.stringify(baseline);
  }, [draft, user, roleCatalog]);

  if (!user) {
    return (
      <section className={cn("admin-users-detail-panel", hidden && "admin-users-panel-hidden")}>
        <AdminEmptyState
          title="Select a user"
          description="Choose someone from the directory to review profile details, roles, and portal permissions."
          className="admin-users-detail-empty"
        />
      </section>
    );
  }

  const selectedUser = user;
  const isFounder = isProtectedFounderAccount(selectedUser, founderEmail);
  const roleEditable =
    canManageUsers && canEditUserRole(selectedUser, founderEmail, viewerIsFounder);
  const effectivePermissions = getUserEffectivePermissions(selectedUser, roleCatalog);

  async function handleSaveAccess() {
    if (!draft || !roleEditable) return;
    await onSaveAccess(selectedUser, draft);
  }

  function resetDraft() {
    setDraft(buildAccessDraft(selectedUser, roleCatalog));
  }

  return (
    <section className={cn("admin-users-detail-panel", hidden && "admin-users-panel-hidden")}>
      {onBack ? (
        <button type="button" onClick={onBack} className="admin-users-back-btn lg:hidden">
          ← Back to directory
        </button>
      ) : null}

      <div className="admin-users-detail-header">
        <div className="flex items-start gap-4 min-w-0">
          <UserAvatar user={selectedUser} className="h-16 w-16 text-lg" />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold-light)]">
              User profile
            </p>
            <h2 className="mt-2 truncate text-2xl font-semibold text-[var(--admin-text)]">
              {selectedUser.full_name ?? "Unnamed user"}
            </h2>
            <p className="mt-1 truncate text-sm text-[var(--admin-text-muted)]">{selectedUser.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <PresenceIndicator
                lastSeenAt={selectedUser.last_seen_at}
                showLabel
                showLastSeen
                size={isFounder ? "lg" : "md"}
                prominent={isFounder}
              />
              <ActivityStatusBadge status={selectedUser.activity_status ?? "Available"} />
            </div>
          </div>
        </div>

        {canManageUsers ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => onEdit(selectedUser)}>
              Edit profile
            </Button>
            {!isFounder ? (
              <Button size="sm" variant="danger" onClick={() => onDelete(selectedUser)}>
                Remove
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="admin-users-detail-grid">
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Company</p>
          <p className="admin-users-detail-value">{selectedUser.company ?? "Not provided"}</p>
        </div>
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Phone</p>
          <p className="admin-users-detail-value">{selectedUser.phone ?? "Not provided"}</p>
        </div>
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Joined</p>
          <p className="admin-users-detail-value">{formatJoinedDate(selectedUser.created_at)}</p>
        </div>
        <div className="admin-users-detail-card">
          <p className="admin-users-detail-label">Portal access</p>
          <p className="admin-users-detail-value">{portalAccessLabel(selectedUser)}</p>
        </div>
      </div>

      <div className="admin-users-roles-panel">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="admin-users-detail-label">Roles & portal permissions</p>
            <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
              {roleEditable
                ? "Assign roles, then choose inherited or custom admin permissions. Save when you are done."
                : isFounder
                  ? "Founder role is protected."
                  : "You cannot edit this account's roles."}
            </p>
          </div>
          {!roleEditable ? (
            <p className="text-xs text-[var(--admin-gold-light)]">{permissionsSummary(selectedUser, roleCatalog)}</p>
          ) : null}
        </div>

        <div className="mt-4 space-y-4">
          {roleEditable && draft ? (
            <>
              <RoleMultiSelect
                value={draft.roles}
                onChange={(roles) => setDraft({ ...draft, roles })}
                assignerIsFounder={viewerIsFounder}
              />

              <div className="admin-users-permissions-section">
                <label className="admin-roles-toggle">
                  <input
                    type="checkbox"
                    checked={draft.permissionsInherit}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        permissionsInherit: event.target.checked,
                        customPermissions: event.target.checked
                          ? getInheritedPermissions({ ...selectedUser, roles: draft.roles }, roleCatalog)
                          : draft.customPermissions,
                      })
                    }
                  />
                  <span>
                    <strong className="block text-sm text-[var(--admin-text)]">Use role defaults</strong>
                    <span className="text-xs text-[var(--admin-text-muted)]">
                      Permissions are inherited from assigned roles. Turn off to customize for this user only.
                    </span>
                  </span>
                </label>

                {!draft.permissionsInherit ? (
                  <div className="mt-4">
                    <PermissionsEditor
                      value={draft.customPermissions}
                      onChange={(customPermissions) => setDraft({ ...draft, customPermissions })}
                      compact
                    />
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-[var(--admin-border-subtle)] bg-white/[0.02] px-3 py-2 text-xs text-[var(--admin-text-muted)]">
                    Inherited: {permissionsSummary({ ...selectedUser, roles: draft.roles, admin_permissions: null }, roleCatalog)}
                  </p>
                )}
              </div>

              <div className="admin-users-access-actions">
                <Button
                  size="sm"
                  className="admin-btn-gold"
                  disabled={!isDirty || savingAccess}
                  onClick={() => void handleSaveAccess()}
                >
                  {savingAccess ? "Saving…" : "Save roles & permissions"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="admin-btn-ghost"
                  disabled={!isDirty || savingAccess}
                  onClick={resetDraft}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <RoleBadges roles={selectedUser.roles ?? selectedUser.role} size="md" />
              <p className="text-xs text-[var(--admin-text-muted)]">
                Effective access: {permissionsSummary(selectedUser, roleCatalog)}
                {!selectedUser.admin_permissions ? " (from roles)" : " (customized)"}
              </p>
              <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-white/[0.02] px-3 py-2 text-xs text-[var(--admin-text-muted)]">
                {effectivePermissions.length > 0
                  ? effectivePermissions.join(", ")
                  : "No admin portal sections enabled"}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
