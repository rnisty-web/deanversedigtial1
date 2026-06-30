"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Profile } from "@/lib/auth";
import { portalNavLinks } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { usePortalNotifications } from "@/hooks/usePortalNotifications";
import { getNavBadgeKey, PortalNavBadge } from "@/components/portal/PortalNavBadge";
import { PortalSwitcher } from "@/components/shared/PortalSwitcher";

type PortalMobileNavProps = {
  profile: Profile;
  canAccessAdmin?: boolean;
};

export function PortalMobileNav({ profile, canAccessAdmin = false }: PortalMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const counts = usePortalNotifications();
  const displayName = profile.full_name ?? profile.email.split("@")[0];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_92%,transparent)] backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between gap-2 px-3 pt-2">
        {canAccessAdmin ? <PortalSwitcher canAccessAdmin /> : <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-gold)]">Client Portal</span>}
        <div className="flex items-center gap-2">
          <Link
            href="/portal/account"
            className="max-w-[9rem] truncate text-xs font-medium text-[var(--admin-gold-light)] hover:underline"
          >
            {displayName}
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="admin-btn-ghost px-2 py-1.5 text-xs"
          >
            Sign out
          </button>
        </div>
      </div>
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
