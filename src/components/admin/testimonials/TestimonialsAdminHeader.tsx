"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type TestimonialsAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onAddTestimonial: () => void;
};

export function TestimonialsAdminHeader({
  search,
  onSearchChange,
  onAddTestimonial,
}: TestimonialsAdminHeaderProps) {
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
    <header className="admin-content-header shrink-0 border-b border-[var(--admin-border-subtle)] px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3 pt-0.5">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Testimonials <span aria-hidden>✨</span>
            </h1>
            <Link
              href="/testimonials"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              View Testimonials
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Social proof for your site — ratings, featured reviews, and publish control.
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
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search testimonials…"
              className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
              ⌘ K
            </kbd>
          </div>
          <button type="button" onClick={onAddTestimonial} className="admin-btn-gold w-full whitespace-nowrap sm:w-auto">
            + Add Testimonial
          </button>
        </div>
      </div>
    </header>
  );
}

export function TestimonialStatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="admin-testimonials-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-text)]">{value}</p>
          {hint ? <p className="admin-trend-up mt-1.5">{hint}</p> : null}
        </div>
        <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function TestimonialSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("admin-testimonials-select", className)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
