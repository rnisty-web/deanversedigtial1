"use client";

import { PresenceIndicator, PresenceLegend } from "@/components/admin/PresenceIndicator";
import { RoleBadges } from "@/components/ui/RoleBadges";
import type { UserRecord } from "@/lib/users/utils";
import { isProtectedFounderAccount } from "@/lib/users/utils";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./UserAvatar";

type UsersDirectoryProps = {
  users: UserRecord[];
  selectedId: string | null;
  founderEmail: string;
  onSelect: (id: string) => void;
  hidden?: boolean;
};

export function UsersDirectory({
  users,
  selectedId,
  founderEmail,
  onSelect,
  hidden,
}: UsersDirectoryProps) {
  return (
    <aside className={cn("admin-users-directory", hidden && "admin-users-panel-hidden")}>
      <div className="admin-users-directory-header">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
          Directory
        </p>
        <PresenceLegend />
      </div>

      <ul className="admin-users-directory-list">
        {users.map((user) => {
          const isFounder = isProtectedFounderAccount(user, founderEmail);
          const isSelected = selectedId === user.id;

          return (
            <li key={user.id}>
              <button
                type="button"
                onClick={() => onSelect(user.id)}
                className={cn(
                  "admin-users-directory-item",
                  isSelected && "admin-users-directory-item-active",
                  isFounder && !isSelected && "admin-users-directory-item-founder",
                )}
              >
                <div className="relative shrink-0">
                  <UserAvatar user={user} className="h-10 w-10 text-sm" />
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <PresenceIndicator
                      lastSeenAt={user.last_seen_at}
                      size="sm"
                      prominent={isFounder}
                    />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                      {user.full_name ?? "Unnamed user"}
                    </p>
                    {isFounder ? (
                      <span className="admin-users-founder-badge">Founder</span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-[var(--admin-text-muted)]">{user.email}</p>
                  <div className="mt-2">
                    <RoleBadges roles={user.roles ?? user.role} size="sm" />
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
