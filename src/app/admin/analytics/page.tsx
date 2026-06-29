"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  AnalyticsAdminHeader,
  AnalyticsFunnel,
  AnalyticsKpiCard,
  AnalyticsSparkline,
  AnalyticsTopPagesList,
} from "@/components/admin/analytics/AnalyticsAdminComponents";
import { AnalyticsSkeleton } from "@/components/admin/analytics/AnalyticsSkeleton";
import { DashboardWidget } from "@/components/admin/dashboard/DashboardWidget";
import { StatsChart } from "@/components/admin/StatsChart";

type PerformanceMetric = {
  key: string;
  label: string;
  thisPeriod: number;
  previousPeriod: number;
  change: number;
  trend: number[];
  suffix?: string;
};

type AnalyticsData = {
  totalEvents: number;
  pageViewLabels: string[];
  pageViewData: number[];
  eventLabels: string[];
  eventData: number[];
  topPageLabels: string[];
  topPageData: number[];
  periodLabel: string;
  comparePeriodLabel: string;
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  leadsGenerated: number;
  conversionRate: number;
  changes: {
    totalVisitors: number;
    uniqueVisitors: number;
    pageViews: number;
    leadsGenerated: number;
    conversionRate: number;
  };
  trafficLabels: string[];
  trafficVisitors: number[];
  trafficUniqueVisitors: number[];
  leadsOverTimeLabels: string[];
  leadsOverTime: number[];
  leadsBySourceLabels: string[];
  leadsBySourceData: number[];
  conversionFunnel: { stage: string; count: number }[];
  performanceMetrics: PerformanceMetric[];
  topPages: { path: string; views: number; percentage: number }[];
  trafficBySourceLabels: string[];
  trafficBySourceData: number[];
};

const kpiIcons = {
  visitors: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
    </svg>
  ),
  unique: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  pageViews: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  leads: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  conversion: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
};

function formatMetricValue(value: number, suffix?: string) {
  if (suffix === "%") return `${value}%`;
  return value.toLocaleString();
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/analytics", { credentials: "same-origin" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to load analytics");
      setData(null);
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredPerformance = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.performanceMetrics;
    return data.performanceMetrics.filter((metric) => metric.label.toLowerCase().includes(q));
  }, [data, search]);

  function handleExport() {
    if (!data) return;
    setExporting(true);
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `deanverse-analytics-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      {!loading && data ? (
        <AnalyticsAdminHeader
          periodLabel={data.periodLabel}
          comparePeriodLabel={data.comparePeriodLabel}
          onExport={handleExport}
          exporting={exporting}
          search={search}
          onSearchChange={setSearch}
        />
      ) : (
        <AnalyticsAdminHeader
          periodLabel="Loading…"
          comparePeriodLabel="—"
          onExport={() => undefined}
          search={search}
          onSearchChange={setSearch}
        />
      )}

      <AdminPageContent className="admin-analytics-content">
        {error ? (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        ) : null}

        {loading ? (
          <AnalyticsSkeleton />
        ) : !data ? (
          <p className="text-[var(--admin-text-muted)]">Unable to load analytics data.</p>
        ) : (
          <div className="admin-analytics-page space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <AnalyticsKpiCard
                label="Total Visitors"
                value={data.totalVisitors.toLocaleString()}
                change={data.changes.totalVisitors}
                icon={kpiIcons.visitors}
              />
              <AnalyticsKpiCard
                label="Unique Visitors"
                value={data.uniqueVisitors.toLocaleString()}
                change={data.changes.uniqueVisitors}
                icon={kpiIcons.unique}
              />
              <AnalyticsKpiCard
                label="Page Views"
                value={data.pageViews.toLocaleString()}
                change={data.changes.pageViews}
                icon={kpiIcons.pageViews}
              />
              <AnalyticsKpiCard
                label="Leads Generated"
                value={data.leadsGenerated.toLocaleString()}
                change={data.changes.leadsGenerated}
                icon={kpiIcons.leads}
              />
              <AnalyticsKpiCard
                label="Conversion Rate"
                value={`${data.conversionRate}%`}
                change={data.changes.conversionRate}
                icon={kpiIcons.conversion}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-12">
              <div className="space-y-6 xl:col-span-8">
                <DashboardWidget title="Website Traffic" subtitle="Visitors vs unique visitors this month">
                  <StatsChart
                    type="line"
                    variant="luxury"
                    labels={data.trafficLabels}
                    datasets={[
                      {
                        label: "Visitors",
                        data: data.trafficVisitors,
                        borderColor: "#c9a962",
                      },
                      {
                        label: "Unique Visitors",
                        data: data.trafficUniqueVisitors,
                        borderColor: "#6f8f72",
                        fill: false,
                      },
                    ]}
                    height={320}
                    emptyMessage="No traffic recorded for this period."
                  />
                </DashboardWidget>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardWidget title="Leads by Source" subtitle="Attribution for current period">
                    <StatsChart
                      type="doughnut"
                      labels={data.leadsBySourceLabels}
                      datasets={[{ label: "Leads", data: data.leadsBySourceData }]}
                      height={240}
                      emptyMessage="No leads recorded for this period."
                    />
                  </DashboardWidget>
                  <DashboardWidget title="Leads Over Time" subtitle="Daily lead volume">
                    <StatsChart
                      type="bar"
                      labels={data.leadsOverTimeLabels}
                      datasets={[
                        {
                          label: "Leads",
                          data: data.leadsOverTime,
                          backgroundColor: "rgba(111, 143, 114, 0.55)",
                          borderColor: "#6f8f72",
                        },
                      ]}
                      height={240}
                      emptyMessage="No leads recorded for this period."
                    />
                  </DashboardWidget>
                </div>

                <DashboardWidget title="Conversion Funnel" subtitle="Visitor to client journey">
                  <AnalyticsFunnel stages={data.conversionFunnel} />
                </DashboardWidget>

                <DashboardWidget title="Performance Overview" subtitle="Period comparison with trends" padding="sm">
                  <div className="overflow-x-auto">
                    <table className="admin-analytics-table w-full min-w-[720px]">
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>This Period</th>
                          <th>Previous Period</th>
                          <th>Change</th>
                          <th>Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPerformance.map((metric) => (
                          <tr key={metric.key}>
                            <td className="font-medium text-[var(--admin-text)]">{metric.label}</td>
                            <td className="tabular-nums">{formatMetricValue(metric.thisPeriod, metric.suffix)}</td>
                            <td className="tabular-nums text-[var(--admin-text-muted)]">
                              {formatMetricValue(metric.previousPeriod, metric.suffix)}
                            </td>
                            <td>
                              <span className={metric.change >= 0 ? "admin-trend-up" : "text-[var(--admin-danger)]"}>
                                {metric.change >= 0 ? "↑" : "↓"} {Math.abs(metric.change)}%
                              </span>
                            </td>
                            <td>
                              <AnalyticsSparkline values={metric.trend} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </DashboardWidget>
              </div>

              <aside className="space-y-6 xl:col-span-4">
                <DashboardWidget title="Traffic by Source" subtitle="Lead attribution channels">
                  <StatsChart
                    type="doughnut"
                    labels={data.trafficBySourceLabels}
                    datasets={[{ label: "Leads", data: data.trafficBySourceData }]}
                    height={220}
                    emptyMessage="No source data yet."
                  />
                  <p className="mt-3 text-center text-xs text-[var(--admin-text-muted)]">
                    {data.leadsGenerated.toLocaleString()} leads this period
                  </p>
                </DashboardWidget>

                <DashboardWidget title="Top Pages" subtitle="Most viewed paths (30 days)">
                  <AnalyticsTopPagesList pages={data.topPages} />
                </DashboardWidget>

                <DashboardWidget title="Events by Type" subtitle="Tracked activity (30 days)">
                  <StatsChart
                    type="doughnut"
                    labels={data.eventLabels}
                    datasets={[{ label: "Events", data: data.eventData }]}
                    height={200}
                    emptyMessage="No events recorded yet."
                  />
                </DashboardWidget>

                <DashboardWidget title="Page Views Trend" subtitle="Last 14 days">
                  <StatsChart
                    type="bar"
                    labels={data.pageViewLabels}
                    datasets={[
                      {
                        label: "Page Views",
                        data: data.pageViewData,
                        backgroundColor: "rgba(201, 169, 98, 0.35)",
                        borderColor: "#c9a962",
                      },
                    ]}
                    height={200}
                    emptyMessage="No page views recorded yet."
                  />
                </DashboardWidget>
              </aside>
            </div>
          </div>
        )}
      </AdminPageContent>
    </>
  );
}
