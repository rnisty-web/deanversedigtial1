"use client";

import { cn } from "@/lib/utils";

type AdminPortalHeaderProps = {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
  zIndex?: 10 | 20;
  maxWidth?: boolean;
  padded?: boolean;
};

export function AdminPortalHeader({
  children,
  className,
  sticky = true,
  zIndex = 20,
  maxWidth = false,
  padded = true,
}: AdminPortalHeaderProps) {
  return (
    <header
      className={cn(
        "admin-content-header admin-portal-header shrink-0",
        padded && "px-4 sm:px-6 lg:px-8",
        sticky && "sticky top-0 backdrop-blur-xl",
        zIndex === 20 ? "z-20" : "z-10",
        className,
      )}
    >
      <div className="admin-portal-header-glow" aria-hidden />
      <div className={cn("relative", maxWidth && "mx-auto max-w-[1680px]")}>{children}</div>
    </header>
  );
}
