"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StatsChart } from "@/components/admin/StatsChart";
import {
  buildPortfolioActivity,
  countByIndustry,
  type PortfolioRecord,
} from "@/lib/portfolio/utils";

const OVERVIEW_COLORS = ["#34d399", "#9ca3af", "#c9a962"];

type PortfolioSidebarProps = {
  items: PortfolioRecord[];
  onAddProject: () => void;
  onImportDefaults?: () => void;
  showImport?: boolean;
  importing?: boolean;
};

export function PortfolioSidebar({
  items,
  onAddProject,
  onImportDefaults,
  showImport,
  importing,
}: PortfolioSidebarProps) {
  const overview = useMemo(() => {
    const published = items.filter((i) => i.published).length;
    const drafts = items.filter((i) => !i.published).length;
    const featured = items.filter((i) => i.featured).length;
    return {
      labels: ["Published", "Draft", "Featured"],
      data: [published, drafts, featured],
      total: items.length,
    };
  }, [items]);

  const categories = useMemo(() => countByIndustry(items), [items]);
  const activity = useMemo(() => buildPortfolioActivity(items), [items]);

  return (
    <aside className="admin-portfolio-sidebar">
      <div className="admin-portfolio-sidebar-panel">
        <section className="admin-portfolio-sidebar-section">
          <h3 className="admin-portfolio-sidebar-title">Portfolio Overview</h3>
          <div className="admin-portfolio-overview-chart">
            <StatsChart
              type="doughnut"
              labels={overview.labels}
              datasets={[{ label: "Projects", data: overview.data, backgroundColor: OVERVIEW_COLORS }]}
              height={180}
              emptyMessage="No projects yet."
              variant="luxury"
              hideLegend
            />
            <p className="admin-portfolio-overview-total">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{overview.total}</span>
              <span className="block text-xs text-[var(--admin-text-muted)]">Total Projects</span>
            </p>
          </div>
          <ul className="admin-portfolio-overview-legend">
            {overview.labels.map((label, i) => (
              <li key={label}>
                <span
                  className="admin-portfolio-legend-dot"
                  style={{ backgroundColor: OVERVIEW_COLORS[i] }}
                />
                {label}
                <span className="ml-auto tabular-nums text-[var(--admin-text-muted)]">{overview.data[i]}</span>
              </li>
            ))}
          </ul>
        </section>

        {categories.length > 0 ? (
          <section className="admin-portfolio-sidebar-section">
            <h3 className="admin-portfolio-sidebar-title">Top Categories</h3>
            <ul className="admin-portfolio-category-list">
              {categories.map((cat) => (
                <li key={cat.name} className="admin-portfolio-category-row">
                  <span className="min-w-0 truncate text-sm text-[var(--admin-text)]">{cat.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-[var(--admin-text-muted)]">
                    {cat.count} · {cat.pct}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="admin-portfolio-sidebar-section">
          <h3 className="admin-portfolio-sidebar-title">Recent Updates</h3>
          {activity.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-muted)]">No activity yet.</p>
          ) : (
            <ul className="admin-portfolio-activity-list">
              {activity.map((entry) => (
                <li key={entry.id} className="admin-portfolio-activity-row">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--admin-text)]">{entry.title}</p>
                    <p className="text-[11px] text-[var(--admin-text-muted)]">
                      {entry.status}
                      {entry.featured ? " · Featured" : ""} · {entry.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-portfolio-sidebar-section">
          <h3 className="admin-portfolio-sidebar-title">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={onAddProject} className="admin-btn-gold w-full py-2 text-sm">
              + New Project
            </button>
            <Link
              href="/portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-ghost w-full justify-center py-2 text-sm"
            >
              View Live Portfolio
            </Link>
            {showImport && onImportDefaults ? (
              <button
                type="button"
                onClick={onImportDefaults}
                disabled={importing}
                className="admin-btn-ghost w-full py-2 text-sm"
              >
                {importing ? "Importing…" : "Import Site Defaults"}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    </aside>
  );
}
