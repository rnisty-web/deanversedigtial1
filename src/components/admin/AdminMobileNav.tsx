"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/auth";
import { AdminNavGroups } from "@/components/admin/AdminNavGroups";
import { AdminProfileCard } from "@/components/admin/AdminProfileCard";
import { AdminSidebarBrand } from "@/components/admin/AdminSidebarBrand";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

type AdminMobileNavProps = {
  profile: Profile;
  unreadMessagesCount?: number;
};

export function AdminMobileNav({ profile, unreadMessagesCount = 0 }: AdminMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--admin-border-subtle)] bg-[#000000]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
          <div className="admin-logo-ring !h-11 !w-11 !p-1.5">
            <BrandLogo width={80} height={80} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-gold)]">
              DEANVERSEDIGITAL
            </p>
            <p className="text-[8px] tracking-[0.12em] text-[var(--admin-gold)]/50">D + D</p>
          </div>
        </Link>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.04] text-[var(--admin-gold-light)]"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div className={cn("fixed inset-0 z-40 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "admin-sidebar absolute left-0 top-0 flex h-full w-[min(100vw-2rem,18.5rem)] flex-col shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="px-4 pb-4 pt-6">
            <AdminSidebarBrand compact />
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <AdminNavGroups
              unreadMessagesCount={unreadMessagesCount}
              onNavigate={() => setOpen(false)}
            />
          </div>
          <div className="shrink-0 px-3 pb-4 pt-2">
            <AdminProfileCard profile={profile} compact />
          </div>
        </aside>
      </div>
    </>
  );
}
