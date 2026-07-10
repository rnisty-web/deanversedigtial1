"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavGroups } from "@/components/admin/admin-nav-config";
import { canAccessAdminHref } from "@/lib/roles/permissions";
import type { RoleDefinition } from "@/lib/roles/catalog";
import type { Profile } from "@/lib/auth";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

type AdminNavGroupsProps = {
  onNavigate?: () => void;
  className?: string;
  unreadMessagesCount?: number;
  collapsed?: boolean;
  profile: Profile;
  roleCatalog: RoleDefinition[];
  isFounder?: boolean;
};

export function AdminNavGroups({
  onNavigate,
  className,
  unreadMessagesCount = 0,
  collapsed = false,
  profile,
  roleCatalog,
  isFounder = false,
}: AdminNavGroupsProps) {
  const pathname = usePathname();

  const visibleGroups = adminNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((link) =>
        canAccessAdminHref(profile, link.href, roleCatalog, { isFounder }),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav className={cn("space-y-4", className)} aria-label="Admin navigation">
      {visibleGroups.map((group, groupIndex) => (
        <div
          key={group.label || "dashboard"}
          className={cn(groupIndex > 0 && "border-t border-[rgba(201,169,98,0.1)] pt-4")}
        >
          {group.label && !collapsed ? (
            <p className="admin-sidebar-nav-group-label">{group.label}</p>
          ) : null}
          <div className="space-y-0.5">
            {group.items.map((link) => {
              const isActive = isNavActive(pathname, link.href);
              const showBadge =
                link.href === "/admin/messages" && unreadMessagesCount > 0;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "admin-sidebar-nav-link",
                    isActive && "admin-sidebar-nav-link-active",
                    collapsed && "admin-sidebar-nav-link-collapsed",
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  <span className="shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                    {link.icon}
                  </span>
                  {!collapsed ? (
                    <>
                      <span className="min-w-0 flex-1 truncate">{link.label}</span>
                      {showBadge ? (
                        <span
                          className="admin-nav-badge"
                          aria-label={`${unreadMessagesCount} unread messages`}
                        >
                          {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                        </span>
                      ) : null}
                      {isActive ? (
                        <svg className="h-3.5 w-3.5 shrink-0 text-[var(--admin-gold-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      ) : null}
                    </>
                  ) : showBadge ? (
                    <span className="admin-nav-badge-dot" aria-label={`${unreadMessagesCount} unread`} />
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
