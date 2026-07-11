"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/auth";
import type { RoleDefinition } from "@/lib/roles/catalog";
import { canAccessPortalHref } from "@/lib/roles/client-permissions";
import { PortalCard } from "@/components/portal/PortalCard";

export function PortalPermissionGuard({
  profile,
  roleCatalog,
  children,
}: {
  profile: Profile;
  roleCatalog: RoleDefinition[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const allowed = canAccessPortalHref(profile, pathname, roleCatalog);

  if (allowed) return children;

  return (
    <PortalCard padding="lg" className="mx-auto mt-8 max-w-lg text-center">
      <h2 className="text-lg font-semibold text-[var(--admin-text)]">Access restricted</h2>
      <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
        Your account does not have permission to view this section. Contact your project team if you
        need access.
      </p>
      <Link
        href="/portal"
        className="admin-btn-gold mt-6 inline-flex min-h-[44px] items-center px-5 text-sm"
      >
        Back to dashboard
      </Link>
    </PortalCard>
  );
}
