"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalNavLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";
import { getNavBadgeKey, PortalNavBadge } from "@/components/portal/PortalNavBadge";

export function PortalNav() {
  const pathname = usePathname();
  const counts = usePortalNotifications();

  return (
    <nav className="flex-1 space-y-1 p-4" aria-label="Portal navigation">
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
              "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "liquid-glass border-[color-mix(in_srgb,var(--primary)_40%,transparent)] text-white shadow-[inset_3px_0_0_0_var(--primary)]"
                : "border border-transparent text-white/60 hover:liquid-glass hover:border-white/10 hover:text-white",
            )}
          >
            <span>{link.label}</span>
            {badgeKey && (
              <PortalNavBadge badgeKey={badgeKey} counts={counts} variant="sidebar" />
            )}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-4 block rounded-xl border border-transparent px-3 py-2 text-sm text-white/50 transition-all hover:liquid-glass hover:border-white/10 hover:text-white"
      >
        ← Back to site
      </Link>
    </nav>
  );
}
