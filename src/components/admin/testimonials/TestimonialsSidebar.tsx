"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StatsChart } from "@/components/admin/StatsChart";
import {
  buildTestimonialActivity,
  countByRating,
  type TestimonialRecord,
} from "@/lib/testimonials/utils";

const OVERVIEW_COLORS = ["#34d399", "#9ca3af", "#c9a962"];

type TestimonialsSidebarProps = {
  items: TestimonialRecord[];
  avgRating: string;
  onAddTestimonial: () => void;
  onImportDefaults?: () => void;
  showImport?: boolean;
  importing?: boolean;
};

export function TestimonialsSidebar({
  items,
  avgRating,
  onAddTestimonial,
  onImportDefaults,
  showImport,
  importing,
}: TestimonialsSidebarProps) {
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

  const ratings = useMemo(() => countByRating(items), [items]);
  const activity = useMemo(() => buildTestimonialActivity(items), [items]);

  return (
    <aside className="admin-testimonials-sidebar">
      <div className="admin-testimonials-sidebar-panel">
        <section className="admin-testimonials-sidebar-section">
          <h3 className="admin-testimonials-sidebar-title">Reviews Overview</h3>
          <div className="admin-testimonials-overview-chart">
            <StatsChart
              type="doughnut"
              labels={overview.labels}
              datasets={[{ label: "Reviews", data: overview.data, backgroundColor: OVERVIEW_COLORS }]}
              height={180}
              emptyMessage="No reviews yet."
              variant="luxury"
              hideLegend
            />
            <p className="admin-testimonials-overview-total">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{overview.total}</span>
              <span className="block text-xs text-[var(--admin-text-muted)]">Total Reviews</span>
            </p>
          </div>
          <ul className="admin-testimonials-overview-legend">
            {overview.labels.map((label, i) => (
              <li key={label}>
                <span
                  className="admin-testimonials-legend-dot"
                  style={{ backgroundColor: OVERVIEW_COLORS[i] }}
                />
                {label}
                <span className="ml-auto tabular-nums text-[var(--admin-text-muted)]">{overview.data[i]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-testimonials-sidebar-section">
          <div className="mb-3 flex items-end justify-between gap-2">
            <h3 className="admin-testimonials-sidebar-title !mb-0">Rating Breakdown</h3>
            <span className="text-sm font-semibold tabular-nums text-[var(--admin-gold-light)]">
              {avgRating} avg
            </span>
          </div>
          <ul className="admin-testimonials-rating-list">
            {ratings.map((row) => (
              <li key={row.stars} className="admin-testimonials-rating-row">
                <span className="shrink-0 text-xs text-[var(--admin-gold-light)]">
                  {"★".repeat(row.stars)}
                  <span className="sr-only">{row.stars} stars</span>
                </span>
                <div className="admin-testimonials-rating-bar">
                  <span
                    className="admin-testimonials-rating-fill"
                    style={{ width: items.length === 0 ? "0%" : row.pct }}
                  />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-[var(--admin-text-muted)]">
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-testimonials-sidebar-section">
          <h3 className="admin-testimonials-sidebar-title">Recent Reviews</h3>
          {activity.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-muted)]">No reviews yet.</p>
          ) : (
            <ul className="admin-testimonials-activity-list">
              {activity.map((entry) => (
                <li key={entry.id} className="admin-testimonials-activity-row">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--admin-text)]">{entry.name}</p>
                    <p className="text-[11px] text-[var(--admin-text-muted)]">
                      {"★".repeat(entry.rating)} · {entry.status}
                      {entry.featured ? " · Featured" : ""} · {entry.when}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-testimonials-sidebar-section">
          <h3 className="admin-testimonials-sidebar-title">Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <button type="button" onClick={onAddTestimonial} className="admin-btn-gold w-full py-2 text-sm">
              + New Testimonial
            </button>
            <Link
              href="/testimonials"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-ghost w-full justify-center py-2 text-sm"
            >
              View Live Testimonials
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
