"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalNavLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";
import { getNavBadgeKey, PortalNavBadge } from "@/components/portal/PortalNavBadge";

export function PortalMobileNav() {
  const pathname = usePathname();
  const counts = usePortalNotifications();

  return (
    <nav
      className="portal-mobile-nav flex gap-2 overflow-x-auto border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_92%,transparent)] px-3 py-2 backdrop-blur-xl lg:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Portal navigation"
    >
      {portalNavLinks.map((link) => {
        const isActive =
          link.href === "/portal" ? pathname === "/portal" : pathname.startsWith(link.href);
        const badgeKey = getNavBadgeKey(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "admin-content-tab inline-flex shrink-0 min-h-[44px]",
              isActive && "admin-content-tab-active",
            )}
          >
            {link.label}
            {badgeKey ? <PortalNavBadge badgeKey={badgeKey} counts={counts} variant="mobile" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
