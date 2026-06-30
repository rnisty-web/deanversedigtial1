"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type PortalSwitcherProps = {
  /** When false, user only sees the client portal (no admin access). */
  canAccessAdmin?: boolean;
  compact?: boolean;
  className?: string;
};

export function PortalSwitcher({
  canAccessAdmin = true,
  compact = false,
  className,
}: PortalSwitcherProps) {
  const pathname = usePathname();
  const inAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const inPortal = pathname === "/portal" || pathname.startsWith("/portal/");

  if (!canAccessAdmin) {
    if (!inPortal) return null;
    return (
      <div className={cn("admin-portal-switcher admin-portal-switcher-single", className)}>
        <span className="admin-portal-switcher-btn admin-portal-switcher-btn-active w-full justify-center">
          Client Portal
        </span>
      </div>
    );
  }

  return (
    <nav
      className={cn("admin-portal-switcher", compact && "admin-portal-switcher-compact", className)}
      aria-label="Switch portal"
    >
      <Link
        href="/admin"
        className={cn(
          "admin-portal-switcher-btn",
          inAdmin && "admin-portal-switcher-btn-active",
        )}
        aria-current={inAdmin ? "page" : undefined}
      >
        {compact ? "Admin" : "Admin Portal"}
      </Link>
      <Link
        href="/portal"
        className={cn(
          "admin-portal-switcher-btn",
          inPortal && "admin-portal-switcher-btn-active",
        )}
        aria-current={inPortal ? "page" : undefined}
      >
        {compact ? "Client" : "Client Portal"}
      </Link>
    </nav>
  );
}
