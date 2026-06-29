"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalNavLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";
import { getNavBadgeKey, PortalNavBadge } from "@/components/portal/PortalNavBadge";
import { portalNavIcons } from "@/components/portal/portal-nav-config";

export function PortalNav() {
  const pathname = usePathname();
  const counts = usePortalNotifications();

  return (
    <nav className="space-y-1" aria-label="Portal navigation">
      {portalNavLinks.map((link) => {
        const isActive =
          link.href === "/portal" ? pathname === "/portal" : pathname.startsWith(link.href);
        const badgeKey = getNavBadgeKey(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn("admin-sidebar-nav-link", isActive && "admin-sidebar-nav-link-active")}
          >
            {portalNavIcons[link.href]}
            <span className="truncate">{link.label}</span>
            {badgeKey ? <PortalNavBadge badgeKey={badgeKey} counts={counts} variant="sidebar" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
