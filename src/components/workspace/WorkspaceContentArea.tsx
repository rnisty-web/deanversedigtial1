"use client";

import { useAdminShell } from "@/components/admin/AdminShellProvider";
import { cn } from "@/lib/utils";

type WorkspaceContentAreaProps = {
  children: React.ReactNode;
};

/**
 * Offsets main content for the fixed sidebar (tablet+) and reserves space for
 * fixed mobile top/bottom nav bars on phones.
 */
export function WorkspaceContentArea({ children }: WorkspaceContentAreaProps) {
  const { sidebarCollapsed } = useAdminShell();

  return (
    <div
      className={cn(
        "workspace-content-area flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-out",
        sidebarCollapsed
          ? "md:pl-[var(--admin-sidebar-collapsed-width)]"
          : "md:pl-[var(--admin-sidebar-width)]",
      )}
    >
      {children}
    </div>
  );
}
