"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalNavLinks } from "@/lib/constants";
import type { RoleDefinition } from "@/lib/roles/catalog";
import { canAccessPortalHref } from "@/lib/roles/client-permissions";
import type { Profile } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";
import { getNavBadgeKey, PortalNavBadge } from "@/components/portal/PortalNavBadge";
import { portalNavIcons } from "@/components/portal/portal-nav-config";

type PortalNavProps = {
  profile: Profile;
  roleCatalog: RoleDefinition[];
  onNavigate?: () => void;
};

export function PortalNav({ profile, roleCatalog, onNavigate }: PortalNavProps) {
  const pathname = usePathname();
  const counts = usePortalNotifications();
  const visibleLinks = portalNavLinks.filter((link) =>
    canAccessPortalHref(profile, link.href, roleCatalog),
  );

  return (
    <nav className="space-y-1" aria-label="Portal navigation">
      {visibleLinks.map((link) => {
        const isActive =
          link.href === "/portal" ? pathname === "/portal" : pathname.startsWith(link.href);
        const badgeKey = getNavBadgeKey(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
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
