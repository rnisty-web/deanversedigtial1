"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { workspaceNavIcons } from "@/components/workspace/workspace-nav-icons";
import {
  WORKSPACE_NAV_GROUPS,
  type WorkspaceModuleId,
  type WorkspaceNavGroup,
} from "@/lib/workspace/modules";
import type { WorkspaceNavItem } from "@/components/workspace/workspace-nav";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  return href === "/workspace" ? pathname === "/workspace" : pathname.startsWith(href);
}

export type WorkspaceBadges = Partial<Record<WorkspaceModuleId, number>>;

type WorkspaceNavProps = {
  /** Already filtered to what this user may see — the sidebar never hides or disables. */
  items: WorkspaceNavItem[];
  badges?: WorkspaceBadges;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function WorkspaceNav({
  items,
  badges,
  collapsed = false,
  onNavigate,
  className,
}: WorkspaceNavProps) {
  const pathname = usePathname();

  const groups = WORKSPACE_NAV_GROUPS.map((group: WorkspaceNavGroup) => ({
    label: group,
    items: items.filter((item) => item.group === group),
  })).filter((group) => group.items.length > 0);

  return (
    <nav className={cn("workspace-nav-fit", className)} aria-label="Workspace navigation">
      {groups.map((group, groupIndex) => (
        <div
          key={group.label}
          className={cn("workspace-nav-group", groupIndex > 0 && "workspace-nav-group-divided")}
        >
          {group.label !== "Overview" && !collapsed ? (
            <p className="admin-sidebar-nav-group-label">{group.label}</p>
          ) : null}
          <div className="workspace-nav-links">
            {group.items.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              const count = badges?.[item.id] ?? 0;
              const showBadge = count > 0;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "admin-sidebar-nav-link",
                    isActive && "admin-sidebar-nav-link-active",
                    collapsed && "admin-sidebar-nav-link-collapsed",
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="workspace-nav-icon shrink-0">
                    {workspaceNavIcons[item.id]}
                  </span>
                  {!collapsed ? (
                    <>
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {showBadge ? (
                        <span className="admin-nav-badge" aria-label={`${count} unread`}>
                          {count > 99 ? "99+" : count}
                        </span>
                      ) : null}
                      {isActive ? (
                        <svg
                          className="h-3 w-3 shrink-0 text-[var(--admin-gold-light)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      ) : null}
                    </>
                  ) : showBadge ? (
                    <span className="admin-nav-badge-dot" aria-label={`${count} unread`} />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
