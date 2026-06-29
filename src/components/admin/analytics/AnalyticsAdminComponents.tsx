"use client";

import { AdminSearchField } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/utils";
import type { AnalyticsPeriod } from "@/lib/analytics/admin-metrics";

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "month", label: "This month" },
];

type AnalyticsAdminHeaderProps = {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  periodLabel: string;
  comparePeriodLabel: string;
  onExport: () => void;
  onRefresh: () => void;
  exporting?: boolean;
  refreshing?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export function AnalyticsAdminHeader({
  period,
  onPeriodChange,
  periodLabel,
  comparePeriodLabel,
  onExport,
  onRefresh,
  exporting = false,
  refreshing = false,
  search,
  onSearchChange,
}: AnalyticsAdminHeaderProps) {
  return (
    <header className="admin-content-header sticky top-0 z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_90%,transparent)] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Analytics
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--admin-text-muted)]">
              Track performance, growth, and key metrics across your business.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="admin-analytics-date-range" aria-label="Selected date range">
              <svg className="h-4 w-4 shrink-0 text-[var(--admin-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>{periodLabel}</span>
            </div>
            <div className="admin-analytics-compare" aria-label="Comparison period">
              <span className="text-[var(--admin-text-muted)]">Compare to:</span>
              <span>{comparePeriodLabel}</span>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="admin-btn-ghost inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            >
              <svg className={cn("h-4 w-4", refreshing && "animate-spin")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={exporting}
              className="admin-btn-gold inline-flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-60"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {exporting ? "Exporting…" : "Export Report"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="admin-analytics-period-pills" role="tablist" aria-label="Analytics period">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={period === option.value}
                onClick={() => onPeriodChange(option.value)}
                className={cn(
                  "admin-analytics-period-pill",
                  period === option.value && "admin-analytics-period-pill-active",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="w-full max-w-md lg:w-auto lg:min-w-[280px]">
            <AdminSearchField value={search} onChange={onSearchChange} placeholder="Search metrics & pages…" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function AnalyticsKpiCard({
  label,
  value,
  change,
  icon,
  invertTrend = false,
}: {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  invertTrend?: boolean;
}) {
  const positive = invertTrend ? change <= 0 : change >= 0;

  return (
    <div className="admin-stat-card admin-analytics-kpi">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-text)]">{value}</p>
          <p className={cn("mt-1.5 text-xs font-semibold", positive ? "admin-trend-up" : "text-[var(--admin-danger)]")}>
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs previous period
          </p>
        </div>
        <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</div>
      </div>
    </div>
  );
}

export function AnalyticsSparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? 50 : (index / (values.length - 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 32" className="admin-analytics-sparkline" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}

export function AnalyticsTopPagesList({
  pages,
}: {
  pages: { path: string; views: number; percentage: number }[];
}) {
  if (pages.length === 0) {
    return <p className="text-sm text-[var(--admin-text-muted)]">No page view data yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {pages.map((page) => (
        <li key={page.path}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate font-medium text-[var(--admin-text)]">{page.path}</span>
            <span className="shrink-0 tabular-nums text-[var(--admin-text-muted)]">{page.views.toLocaleString()}</span>
          </div>
          <div className="admin-analytics-progress-track">
            <div className="admin-analytics-progress-fill" style={{ width: `${page.percentage}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsFunnel({ stages }: { stages: { stage: string; count: number }[] }) {
  const max = Math.max(...stages.map((stage) => stage.count), 1);

  return (
    <div className="space-y-2">
      {stages.map((stage) => {
        const width = Math.max(18, (stage.count / max) * 100);
        return (
          <div key={stage.stage} className="admin-analytics-funnel-row" style={{ width: `${width}%` }}>
            <span>{stage.stage}</span>
            <strong>{stage.count.toLocaleString()}</strong>
          </div>
        );
      })}
      {stages.length === 0 ? (
        <p className="text-sm text-[var(--admin-text-muted)]">No funnel data for this period.</p>
      ) : null}
    </div>
  );
}

export function AnalyticsInsights({ insights }: { insights: string[] }) {
  if (insights.length === 0) {
    return (
      <p className="text-sm text-[var(--admin-text-muted)]">
        Insights will appear once enough traffic and lead data is collected.
      </p>
    );
  }

  return (
    <ul className="admin-analytics-insights">
      {insights.map((insight) => (
        <li key={insight}>{insight}</li>
      ))}
    </ul>
  );
}

export function AnalyticsActivityFeed({
  items,
}: {
  items: { type: "page_view" | "lead"; label: string; detail: string; timestamp: string }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--admin-text-muted)]">No recent activity in this period.</p>;
  }

  return (
    <ul className="admin-analytics-activity">
      {items.map((item) => (
        <li key={`${item.type}-${item.timestamp}-${item.detail}`} className="admin-analytics-activity-item">
          <div className="admin-analytics-activity-icon" data-type={item.type} aria-hidden>
            {item.type === "lead" ? "L" : "P"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--admin-text)]">{item.detail}</p>
            <p className="text-xs text-[var(--admin-text-muted)]">
              {item.label} · {new Date(item.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsDeviceBreakdown({
  devices,
}: {
  devices: { device: string; count: number; percentage: number }[];
}) {
  if (devices.length === 0) {
    return <p className="text-sm text-[var(--admin-text-muted)]">Device data will appear as visitors browse the site.</p>;
  }

  return (
    <ul className="space-y-3">
      {devices.map((device) => (
        <li key={device.device}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-[var(--admin-text)]">{device.device}</span>
            <span className="tabular-nums text-[var(--admin-text-muted)]">
              {device.count.toLocaleString()} · {device.percentage}%
            </span>
          </div>
          <div className="admin-analytics-progress-track">
            <div className="admin-analytics-progress-fill" style={{ width: `${device.percentage}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
