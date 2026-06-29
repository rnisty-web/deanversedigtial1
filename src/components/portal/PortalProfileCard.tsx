"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { isStaffRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function PortalProfileCard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isStaff = isStaffRole(profile);
  const name = profile.full_name ?? profile.email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="admin-sidebar-profile w-full text-left"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[var(--admin-gold)]/35"
            unoptimized
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--admin-emerald)] to-[var(--admin-emerald-deep)] text-sm font-semibold text-[var(--admin-text)] ring-2 ring-[var(--admin-gold)]/30">
            {initial}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--admin-gold-light)]">{name}</p>
          <p className="truncate text-[11px] text-[var(--admin-gold)]/55">
            {isStaff ? "Staff preview" : "Client account"}
          </p>
        </div>

        <svg
          className={cn(
            "h-4 w-4 shrink-0 text-[var(--admin-gold)]/70 transition-transform duration-200",
            open && "rotate-180",
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] py-1 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)]"
          role="menu"
        >
          <Link href="/portal/account" className="admin-sidebar-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            Account settings
          </Link>
          {isStaff ? (
            <Link href="/admin" className="admin-sidebar-menu-item" role="menuitem" onClick={() => setOpen(false)}>
              Admin portal
            </Link>
          ) : null}
          <Link href="/" className="admin-sidebar-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            Back to website
          </Link>
          <button
            type="button"
            className="admin-sidebar-menu-item w-full text-left"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void handleSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
