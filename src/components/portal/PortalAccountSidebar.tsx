"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PortalAccountSidebarProps = {
  profile: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  client: { name: string; company: string | null } | null;
  sections: { id: string; label: string }[];
  activeSection: string;
  onSectionClick: (id: string) => void;
  className?: string;
};

export function PortalAccountSidebar({
  profile,
  client,
  sections,
  activeSection,
  onSectionClick,
  className,
}: PortalAccountSidebarProps) {
  const displayName = profile.full_name?.trim() || profile.email.split("@")[0] || "Account";
  const initial = displayName[0]?.toUpperCase() ?? "A";

  return (
    <aside className={cn("portal-account-sidebar", className)}>
      <div className="portal-account-sidebar-panel admin-luxury-card p-5">
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
          {client ? (
            <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
              {client.company ? `${client.company} · ` : ""}
              {client.name}
            </p>
          ) : null}
        </div>

        <div className="my-4 border-t border-[var(--admin-border-subtle)]" />

        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Sections</h3>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  "portal-account-nav-item w-full rounded-[10px] border border-transparent px-3 py-2 text-left text-sm text-[var(--admin-text-muted)] transition-colors",
                  activeSection === section.id &&
                    "border-[color-mix(in_srgb,var(--admin-gold)_30%,transparent)] bg-[color-mix(in_srgb,var(--admin-gold)_8%,transparent)] text-[var(--admin-gold-light)]",
                )}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-[var(--admin-border-subtle)]" />

        <ul className="space-y-2 text-xs leading-relaxed text-[var(--admin-text-muted)]">
          <li className="rounded-[10px] border border-[var(--admin-border-subtle)] bg-white/[0.02] px-3 py-2">
            Email changes require inbox confirmation before they take effect.
          </li>
          <li className="rounded-[10px] border border-[var(--admin-border-subtle)] bg-white/[0.02] px-3 py-2">
            Use Messages for project questions — your team responds from the admin portal.
          </li>
        </ul>

        <Link href="/portal" className="admin-btn-ghost mt-4 w-full justify-center py-2 text-sm">
          ← Dashboard
        </Link>
      </div>
    </aside>
  );
}
