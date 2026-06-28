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
      className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[var(--background)]/90 px-3 py-2 backdrop-blur-xl lg:hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Portal navigation"
    >
      {portalNavLinks.map((link) => {
        const isActive =
          link.href === "/portal"
            ? pathname === "/portal"
            : pathname.startsWith(link.href);
        const badgeKey = getNavBadgeKey(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors min-h-[44px]",
              isActive
                ? "bg-[var(--primary)] text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
            )}
          >
            {link.label}
            {badgeKey && (
              <PortalNavBadge badgeKey={badgeKey} counts={counts} variant="mobile" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
