"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Profile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { getRoleLabel, getPrimaryRole, isFounderRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

type AdminProfileCardProps = {
  profile: Profile;
  compact?: boolean;
};

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 1.5l6 2.5v5c0 4.25-2.55 7.35-6 8.5-3.45-1.15-6-4.25-6-8.5V4l6-2.5zm2.82 5.53a.75.75 0 00-1.06-1.06L9 8.69 8.24 7.94a.75.75 0 00-1.06 1.06l1.25 1.25a.75.75 0 001.06 0l2.33-2.22z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function AdminProfileCard({ profile, compact = false }: AdminProfileCardProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const name = profile.full_name ?? profile.email.split("@")[0];
  const role = getRoleLabel(getPrimaryRole(profile));
  const initial = name.charAt(0).toUpperCase();
  const isFounder = isFounderRole(profile);

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
        className={cn(
          "admin-sidebar-profile w-full text-left",
          compact && "p-3",
        )}
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
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-[var(--admin-gold-light)]">
            <span className="truncate">{name}</span>
            {isFounder ? (
              <ShieldIcon className="h-3.5 w-3.5 shrink-0 text-[var(--admin-gold)]" />
            ) : null}
          </p>
          <p className="truncate text-[11px] text-[var(--admin-gold)]/55">{role}</p>
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
          <Link
            href="/admin/settings/my-account"
            className="admin-sidebar-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My Account
          </Link>
          <Link
            href="/admin/settings"
            className="admin-sidebar-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <Link
            href="/"
            className="admin-sidebar-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Back to Website
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
