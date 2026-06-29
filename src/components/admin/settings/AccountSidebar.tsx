"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getRoleBadgeClass, getRoleLabel } from "@/lib/roles";
import type { UserRole } from "@/lib/roles";
import { ActivityStatusBadge } from "@/components/admin/ActivityStatusPicker";
import type { ActivityStatus } from "@/lib/activity-status";

type AccountSidebarProps = {
  profile: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    role: UserRole;
  };
  activityStatus?: ActivityStatus;
  sections: { id: string; label: string }[];
  activeSection: string;
  onSectionClick: (id: string) => void;
};

export function AccountSidebar({
  profile,
  activityStatus,
  sections,
  activeSection,
  onSectionClick,
}: AccountSidebarProps) {
  const displayName = profile.full_name?.trim() || profile.email.split("@")[0] || "Account";
  const initial = displayName[0]?.toUpperCase() ?? "A";

  return (
    <aside className="admin-settings-account-sidebar">
      <div className="admin-settings-account-sidebar-panel">
        <section className="admin-settings-account-sidebar-section">
          <div className="admin-settings-account-profile">
            <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={displayName} fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl font-semibold text-[var(--admin-gold-light)]">
                  {initial}
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="admin-heading-serif text-lg font-semibold text-[var(--admin-text)]">{displayName}</p>
              <p className="mt-1 truncate text-sm text-[var(--admin-text-muted)]">{profile.email}</p>
              <span className={cn("mt-3 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", getRoleBadgeClass(profile.role))}>
                {getRoleLabel(profile.role)}
              </span>
              {activityStatus ? (
                <div className="mt-3 flex justify-center">
                  <ActivityStatusBadge status={activityStatus} />
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="admin-settings-account-sidebar-divider" />

        <section className="admin-settings-account-sidebar-section">
          <h3 className="admin-settings-account-sidebar-title">Sections</h3>
          <ul className="admin-settings-account-nav">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => onSectionClick(section.id)}
                  className={cn(
                    "admin-settings-account-nav-item",
                    activeSection === section.id && "admin-settings-account-nav-item-active",
                  )}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-settings-account-sidebar-divider" />

        <section className="admin-settings-account-sidebar-section">
          <h3 className="admin-settings-account-sidebar-title">Security Tips</h3>
          <ul className="admin-settings-account-tips">
            <li>Use a unique password with at least 8 characters.</li>
            <li>Confirm email changes from your inbox before they take effect.</li>
            <li>Update your activity status so your team knows your availability.</li>
          </ul>
        </section>

        <section className="admin-settings-account-sidebar-section">
          <Link href="/admin/settings" className="admin-btn-ghost w-full justify-center py-2 text-sm">
            ← All Settings
          </Link>
        </section>
      </div>
    </aside>
  );
}
