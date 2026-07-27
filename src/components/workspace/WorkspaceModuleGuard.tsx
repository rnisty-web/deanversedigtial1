"use client";

import { usePathname } from "next/navigation";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { moduleForPathname } from "@/lib/workspace/modules";
import { permissionKey, type WorkspacePermission } from "@/lib/workspace/permissions";

/**
 * Route-level gate. The sidebar already hides modules a user cannot open, so
 * this only catches direct URL entry and stale links.
 */
export function WorkspaceModuleGuard({
  permissions,
  children,
}: {
  permissions: WorkspacePermission[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const workspaceModule = moduleForPathname(pathname);

  if (permissions.includes(permissionKey(workspaceModule.id, "view"))) {
    return <>{children}</>;
  }

  return (
    <AdminEmptyState
      title="Access restricted"
      description={`You do not have permission to open ${workspaceModule.label}. Ask your workspace administrator if you need access.`}
      actionLabel="Back to Workspace"
      actionHref="/workspace"
    />
  );
}
