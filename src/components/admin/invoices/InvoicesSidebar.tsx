"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StatsChart } from "@/components/admin/StatsChart";
import type { InvoiceRecord } from "@/lib/invoices/utils";
import { buildActivityFeed, formatRelativeTime, pct, statusStyle } from "@/lib/invoices/utils";

const OVERVIEW_COLORS = ["#34d399", "#c9a962", "#ef4444", "#9ca3af"];
const OVERVIEW_KEYS = ["paid", "sent", "overdue", "draft"] as const;

type InvoicesSidebarProps = {
  invoices: InvoiceRecord[];
  onNewInvoice: () => void;
  onExport: () => void;
};

export function InvoicesSidebar({ invoices, onNewInvoice, onExport }: InvoicesSidebarProps) {
  const overview = useMemo(() => {
    const labels = ["Paid", "Pending", "Overdue", "Draft"];
    const data = [
      invoices.filter((i) => i.status === "paid").length,
      invoices.filter((i) => i.status === "sent").length,
      invoices.filter((i) => i.status === "overdue").length,
      invoices.filter((i) => i.status === "draft").length,
    ];
    return { labels, data, total: invoices.length };
  }, [invoices]);

  const activity = useMemo(() => buildActivityFeed(invoices), [invoices]);

  return (
    <aside className="admin-invoices-sidebar">
      <div className="admin-invoices-sidebar-panel">
        <section className="admin-invoices-sidebar-section">
          <h3 className="admin-invoices-sidebar-title">Invoice Overview</h3>
          <div className="admin-invoices-overview-chart">
            <StatsChart
              type="doughnut"
              labels={overview.labels}
              datasets={[{ label: "Invoices", data: overview.data, backgroundColor: OVERVIEW_COLORS }]}
              height={180}
              emptyMessage="No invoices yet."
              variant="luxury"
              hideLegend
            />
            <p className="admin-invoices-overview-total">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{overview.total}</span>
              <span className="block text-xs text-[var(--admin-text-muted)]">Total Invoices</span>
            </p>
          </div>
          <ul className="admin-invoices-overview-legend">
            {overview.labels.map((label, i) => (
              <li key={OVERVIEW_KEYS[i]}>
                <span className="admin-invoices-legend-dot" style={{ background: OVERVIEW_COLORS[i] }} />
                <span className="text-[var(--admin-text-muted)]">{label}</span>
                <span className="ml-auto tabular-nums text-[var(--admin-text)]">
                  {overview.data[i]} <span className="text-[var(--admin-text-muted)]">({pct(overview.data[i], overview.total)})</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-invoices-sidebar-divider" />

        <section className="admin-invoices-sidebar-section">
          <h3 className="admin-invoices-sidebar-title">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">No recent activity.</p>
          ) : (
            <ul className="admin-invoices-activity-list">
              {activity.map((item) => {
                const style = statusStyle(item.tone);
                return (
                  <li key={item.id} className="admin-invoices-activity-item">
                    <span className="admin-invoices-activity-dot" style={{ background: style.dot }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-[var(--admin-text)]">{item.message}</p>
                      <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">{formatRelativeTime(item.timestamp)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="admin-invoices-sidebar-divider" />

        <section className="admin-invoices-sidebar-section">
          <h3 className="admin-invoices-sidebar-title">Quick Actions</h3>
          <div className="admin-invoices-quick-grid">
            <button type="button" className="admin-invoices-quick-btn" onClick={onNewInvoice}>
              + New Invoice
            </button>
            <button type="button" className="admin-invoices-quick-btn" onClick={onNewInvoice}>
              Create Quote
            </button>
            <button type="button" className="admin-invoices-quick-btn" onClick={onExport}>
              Export CSV
            </button>
            <Link href="/admin/analytics" className="admin-invoices-quick-btn">
              View Reports
            </Link>
          </div>
        </section>
      </div>
    </aside>
  );
}
