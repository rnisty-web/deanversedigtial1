"use client";

import Link from "next/link";
import { StatsChart } from "@/components/admin/StatsChart";
import { AdminCard } from "@/components/admin/AdminCard";

type DashboardTrafficPanelProps = {
  labels: string[];
  data: number[];
  totalViews: number;
  conversionRate: number;
};

export function DashboardTrafficPanel({
  labels,
  data,
  totalViews,
  conversionRate,
}: DashboardTrafficPanelProps) {
  return (
    <AdminCard hover={false} padding="md" className="admin-dashboard-traffic-panel">
      <div className="admin-dashboard-widget-header">
        <div className="min-w-0">
          <p className="admin-dashboard-widget-eyebrow">Performance</p>
          <h3 className="admin-dashboard-widget-title">Website traffic</h3>
          <p className="admin-dashboard-widget-subtitle">Page views over the last 7 days</p>
        </div>
        <Link href="/admin/analytics" className="admin-dashboard-link">
          Full analytics →
        </Link>
      </div>

      <div className="admin-dashboard-traffic-meta">
        <div className="admin-dashboard-traffic-stat">
          <span className="admin-dashboard-traffic-value">{totalViews.toLocaleString()}</span>
          <span className="admin-dashboard-traffic-label">7-day views</span>
        </div>
        <div className="admin-dashboard-traffic-stat">
          <span className="admin-dashboard-traffic-value admin-dashboard-traffic-value--emerald">
            {conversionRate}%
          </span>
          <span className="admin-dashboard-traffic-label">Conversion</span>
        </div>
      </div>

      <div className="admin-dashboard-traffic-chart">
        <StatsChart
          type="line"
          variant="luxury"
          labels={labels}
          datasets={[{ label: "Page views", data }]}
          height={200}
          emptyMessage="No page views yet. Browse your site to start tracking."
        />
      </div>
    </AdminCard>
  );
}
