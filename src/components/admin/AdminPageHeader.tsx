"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AdminPageHeaderProps = {
  title: string;
  description?: string;
  sparkle?: boolean;
  actions?: ReactNode;
  toolbar?: ReactNode;
  sticky?: boolean;
  className?: string;
};

export function AdminPageHeader({
  title,
  description,
  sparkle = true,
  actions,
  toolbar,
  sticky = true,
  className,
}: AdminPageHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const target = searchRef.current ?? document.querySelector<HTMLInputElement>("[data-admin-search]");
        if (target) {
          e.preventDefault();
          target.focus();
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "admin-content-header shrink-0 border-b border-[var(--admin-border-subtle)] px-6 lg:px-8",
        sticky && "sticky top-0 z-20 bg-[color-mix(in_srgb,var(--admin-bg)_92%,transparent)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
            {title} {sparkle ? <span aria-hidden>✨</span> : null}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-muted)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto">{actions}</div> : null}
      </div>
      {toolbar ? <div className="mt-4">{toolbar}</div> : null}
    </header>
  );
}

export function AdminSearchField({
  value,
  onChange,
  placeholder = "Search…",
  className,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const localRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? localRef;

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
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
        ref={ref}
        data-admin-search
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
        ⌘ K
      </kbd>
    </div>
  );
}

export function AdminFilterButton({
  active,
  onClick,
  label = "Filters",
}: {
  active?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm",
        active && "border-[var(--admin-gold)]/40 text-[var(--admin-gold-light)]",
      )}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
      {label}
    </button>
  );
}

export function AdminStatCard({
  label,
  value,
  hint,
  icon,
  hintTone = "neutral",
  goldValue = true,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  hintTone?: "up" | "down" | "neutral";
  goldValue?: boolean;
}) {
  return (
    <div className="admin-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold tabular-nums",
              goldValue ? "text-[var(--admin-gold-light)]" : "text-[var(--admin-text)]",
            )}
          >
            {value}
          </p>
          {hint ? (
            <p
              className={cn(
                "mt-1.5 text-xs",
                hintTone === "down"
                  ? "text-red-300/90"
                  : "text-[var(--admin-text-muted)]",
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}

export function AdminEntitySelect({
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
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn("admin-entity-select", className)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[var(--admin-bg)] text-[var(--admin-text)]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
