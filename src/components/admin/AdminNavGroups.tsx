"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavItems } from "@/components/admin/admin-nav-config";
import { cn } from "@/lib/utils";

function isNavActive(pathname: string, href: string, id: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  if (!pathname.startsWith(href)) {
    return false;
  }
  if (href === "/admin/invoices") {
    return id === "invoices";
  }
  if (href === "/admin/leads") {
    return id === "leads";
  }
  return true;
}

type AdminNavGroupsProps = {
  onNavigate?: () => void;
  className?: string;
  unreadMessagesCount?: number;
};

export function AdminNavGroups({
  onNavigate,
  className,
  unreadMessagesCount = 0,
}: AdminNavGroupsProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("admin-sidebar-nav", className)} aria-label="Admin navigation">
      {adminNavItems.map((link) => {
        const isActive = isNavActive(pathname, link.href, link.id);
        const showBadge = link.id === "messages" && unreadMessagesCount > 0;

        return (
          <Link
            key={link.id}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "admin-sidebar-nav-link",
              isActive && "admin-sidebar-nav-link-active",
            )}
          >
            <span className="admin-sidebar-nav-icon">{link.icon}</span>
            <span className="min-w-0 flex-1 truncate">{link.label}</span>
            {showBadge ? (
              <span
                className="admin-nav-badge"
                aria-label={`${unreadMessagesCount} unread messages`}
              >
                {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
