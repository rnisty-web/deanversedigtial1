"use client";

import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/auth";
import type { RoleDefinition } from "@/lib/roles/catalog";
import { canAccessAdminHref } from "@/lib/roles/permissions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";

export function AdminPermissionGuard({
  profile,
  roleCatalog,
  isFounder,
  children,
}: {
  profile: Profile;
  roleCatalog: RoleDefinition[];
  isFounder: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const allowed = canAccessAdminHref(profile, pathname, roleCatalog, { isFounder });

  if (allowed) return children;

  return (
    <AdminEmptyState
      title="Access restricted"
      description="Your role does not include permission for this area. Contact your workspace owner if you need access."
      actionLabel="Back to dashboard"
      actionHref="/admin"
    />
  );
}
