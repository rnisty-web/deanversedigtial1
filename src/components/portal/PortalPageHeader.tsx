"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function PortalPageHeader({
  title,
  subtitle,
  actions,
  breadcrumb,
  tabs,
  activeTab,
  onTabChange,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
  tabs?: { id: string; label: string; count?: number }[];
  activeTab?: string;
  onTabChange?: (id: string) => void;
  className?: string;
}) {
  return (
    <header className={cn("portal-page-header admin-content-header -mx-4 mb-6 border-b border-[var(--admin-border-subtle)] px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8", className)}>
      {breadcrumb?.length ? (
        <nav className="portal-page-breadcrumb mb-3 flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold)]">
            Client Portal
          </p>
          <h1 className="admin-heading-serif mt-1 text-2xl text-[var(--admin-text)] md:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="portal-page-subtitle mt-2 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {tabs?.length && onTabChange ? (
        <div className="portal-page-tabs mt-4 flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn("admin-content-tab shrink-0", activeTab === tab.id && "admin-content-tab-active")}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 ? (
                <span className="admin-nav-badge">{tab.count > 9 ? "9+" : tab.count}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </header>
  );
}
