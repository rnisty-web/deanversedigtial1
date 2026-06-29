"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type SettingsAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  breadcrumb?: { label: string; href?: string }[];
  hideSearch?: boolean;
  title?: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  sections?: { id: string; label: string }[];
  activeSection?: string;
  onSectionClick?: (id: string) => void;
};

export function SettingsAdminHeader({
  search,
  onSearchChange,
  breadcrumb,
  hideSearch = false,
  title = "Settings",
  subtitle = "Manage your account, workspace preferences, integrations, and platform configuration.",
  actionHref = "/admin/settings/my-account",
  actionLabel = "My Account",
  sections,
  activeSection,
  onSectionClick,
}: SettingsAdminHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="admin-content-header sticky top-0 z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_90%,transparent)] px-6 backdrop-blur-xl lg:px-8">
      {breadcrumb?.length ? (
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 ? <span className="text-[var(--admin-text-muted)]">/</span> : null}
              {item.href ? (
                <Link href={item.href} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                  {item.label}
                </Link>
              ) : (
                <span className="text-[var(--admin-gold-light)]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
            {title}{" "}
            {title === "Settings" ? (
              <span aria-hidden>⚙️</span>
            ) : title === "My Account" ? (
              <span aria-hidden>👤</span>
            ) : null}
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{subtitle}</p>
        </div>

        {hideSearch ? (
          actionHref ? (
            <Link href={actionHref} className="admin-btn-ghost whitespace-nowrap px-4 py-2 text-sm">
              {actionLabel}
            </Link>
          ) : null
        ) : (
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[420px]">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              ref={searchRef}
              data-admin-search
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search settings…"
              className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
              ⌘ K
            </kbd>
          </div>
          <Link href={actionHref} className="admin-btn-gold whitespace-nowrap px-4 py-2 text-center text-sm">
            {actionLabel}
          </Link>
        </div>
        )}
      </div>

      {sections?.length && onSectionClick ? (
        <div className="admin-settings-section-tabs mt-4">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionClick(section.id)}
              className={cn(
                "admin-settings-section-tab",
                activeSection === section.id && "admin-settings-section-tab-active",
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      ) : null}
    </header>
  );
}

export function SettingsStatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="admin-settings-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
          <p className="mt-1 truncate text-xl font-bold text-[var(--admin-gold-light)]">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}
