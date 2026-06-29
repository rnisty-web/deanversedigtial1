"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { SectionDefinition } from "@/lib/cms/sections";
import { cn } from "@/lib/utils";

type ContentEditorHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onAddSection: () => void;
  showAddMenu: boolean;
  onToggleAddMenu: () => void;
  draftSections: SectionDefinition[];
  onPublishDraft: (id: string) => void;
  onSeedDefaults: () => void;
  seeding: boolean;
};

export function ContentEditorHeader({
  search,
  onSearchChange,
  onAddSection,
  showAddMenu,
  onToggleAddMenu,
  draftSections,
  onPublishDraft,
  onSeedDefaults,
  seeding,
}: ContentEditorHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (showAddMenu && e.key === "Escape") onToggleAddMenu();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showAddMenu, onToggleAddMenu]);

  return (
    <header className="admin-content-header sticky top-0 z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_90%,transparent)] px-6 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3 pt-0.5">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Site Content <span aria-hidden>📝</span>
            </h1>
            <Link
              href="/admin/settings"
              className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              Settings
            </Link>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              View Site
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage homepage sections, page content, and site-wide settings
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:min-w-[440px]">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchRef}
              data-admin-search
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sections…"
              className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
              ⌘ K
            </kbd>
          </div>
          <div className="relative">
            <button type="button" onClick={onToggleAddMenu} className="admin-btn-gold w-full whitespace-nowrap sm:w-auto">
              + Add New Section
            </button>
            {showAddMenu && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 cursor-default"
                  aria-label="Close menu"
                  onClick={onToggleAddMenu}
                />
                <div className="admin-content-add-menu absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl">
                  <button
                    type="button"
                    className="admin-sidebar-menu-item w-full text-left"
                    onClick={() => {
                      onAddSection();
                      onToggleAddMenu();
                    }}
                  >
                    Add item to current section
                  </button>
                  {draftSections.length > 0 && (
                    <>
                      <div className="border-t border-[var(--admin-border-subtle)] px-4 py-2 text-[0.625rem] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                        Publish draft sections
                      </div>
                      {draftSections.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          className="admin-sidebar-menu-item w-full text-left"
                          onClick={() => {
                            onPublishDraft(s.id);
                            onToggleAddMenu();
                          }}
                        >
                          {s.title}
                        </button>
                      ))}
                    </>
                  )}
                  <div className="border-t border-[var(--admin-border-subtle)]">
                    <button
                      type="button"
                      className="admin-sidebar-menu-item w-full text-left text-[var(--admin-gold-light)]"
                      onClick={() => {
                        onSeedDefaults();
                        onToggleAddMenu();
                      }}
                      disabled={seeding}
                    >
                      {seeding ? "Seeding…" : "Seed all defaults"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function ContentFilterTabs({
  tabs,
  active,
  onChange,
  counts,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="admin-content-tabs shrink-0 border-b border-[var(--admin-border-subtle)] px-6 lg:px-8">
      <div className="flex gap-2 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "admin-content-tab whitespace-nowrap",
              active === tab.id && "admin-content-tab-active",
            )}
          >
            {tab.label}
            <span className="admin-content-tab-count">{counts[tab.id] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
