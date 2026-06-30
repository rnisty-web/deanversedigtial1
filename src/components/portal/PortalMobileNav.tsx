"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalNavLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";
import { getNavBadgeKey, PortalNavBadge } from "@/components/portal/PortalNavBadge";
import { PortalSwitcher } from "@/components/shared/PortalSwitcher";

type PortalMobileNavProps = {
  canAccessAdmin?: boolean;
};

export function PortalMobileNav({ canAccessAdmin = false }: PortalMobileNavProps) {
  const pathname = usePathname();
  const counts = usePortalNotifications();

  return (
    <div className="shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_92%,transparent)] backdrop-blur-xl lg:hidden">
      {canAccessAdmin ? (
        <div className="px-3 pt-2">
          <PortalSwitcher canAccessAdmin />
        </div>
      ) : null}
      <nav
        className="portal-mobile-nav flex gap-2 overflow-x-auto px-3 py-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
    </div>
  );
}
