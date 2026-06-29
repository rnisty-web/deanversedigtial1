"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ActivityStatusQuickPicker } from "@/components/admin/ActivityStatusPicker";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showPortalBadge?: boolean;
  showActivityPicker?: boolean;
  actions?: React.ReactNode;
  searchSlot?: React.ReactNode;
}

export function AdminHeader({
  title,
  subtitle,
  showPortalBadge = false,
  showActivityPicker = true,
  actions,
  searchSlot,
}: AdminHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="admin-content-header sticky top-0 z-10 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_88%,transparent)] px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          {showPortalBadge && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-gold)]">
              Admin Portal
            </p>
          )}
          <h1 className="admin-heading-serif truncate text-2xl text-[var(--admin-text)] sm:text-[1.75rem]">
            {title} <span aria-hidden>✨</span>
          </h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-muted)]">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          {searchSlot}
          <div className="flex flex-wrap items-center gap-2">
            {showActivityPicker && <ActivityStatusQuickPicker />}
            {actions}
            <a href="/portal" className="admin-btn-ghost hidden px-4 sm:inline-flex">
              Client Portal
            </a>
            <button type="button" onClick={handleSignOut} className="admin-btn-ghost px-4">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-0 flex-1 sm:max-w-xs xl:max-w-sm", className)}>
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="search"
        data-admin-search
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-input admin-input-with-icon py-2.5"
      />
    </div>
  );
}
