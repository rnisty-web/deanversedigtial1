"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { StatsChart } from "@/components/admin/StatsChart";

type AnalyticsData = {
  totalEvents: number;
  pageViewLabels: string[];
  pageViewData: number[];
  eventLabels: string[];
  eventData: number[];
  topPageLabels: string[];
  topPageData: number[];
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
      <AdminHeader
        title="Analytics"
        subtitle="Traffic, conversions, and engagement across your public site."
      />

      <AdminPageContent>
        {error && (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        )}

        {loading ? (
          <AdminTableSkeleton rows={3} />
        ) : !data ? (
          <p className="text-[var(--admin-text-muted)]">Unable to load analytics data.</p>
        ) : (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <AdminCard padding="lg">
                <p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Total events</p>
                <p className="mt-2 text-3xl font-bold text-[var(--admin-text)]">{data.totalEvents}</p>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Last 30 days</p>
              </AdminCard>
              <AdminCard padding="lg">
                <p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Page views</p>
                <p className="mt-2 text-3xl font-bold text-[var(--admin-gold-light)]">
                  {data.pageViewData.reduce((a, b) => a + b, 0)}
                </p>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Last 14 days</p>
              </AdminCard>
              <AdminCard padding="lg">
                <p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Event types</p>
                <p className="mt-2 text-3xl font-bold text-[var(--admin-text)]">{data.eventLabels.length}</p>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Tracked categories</p>
              </AdminCard>
            </div>

            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <AdminCard padding="lg" hover={false}>
                <h2 className="mb-4 text-sm font-medium text-[var(--admin-text-muted)]">Page views (14 days)</h2>
                <StatsChart
                  type="bar"
                  labels={data.pageViewLabels}
                  datasets={[{ label: "Page Views", data: data.pageViewData }]}
                  emptyMessage="No page views recorded yet. Browse your site to start tracking."
                />
              </AdminCard>
              <AdminCard padding="lg" hover={false}>
                <h2 className="mb-4 text-sm font-medium text-[var(--admin-text-muted)]">Events by type</h2>
                <StatsChart
                  type="doughnut"
                  labels={data.eventLabels}
                  datasets={[{ label: "Events", data: data.eventData }]}
                  emptyMessage="No events recorded yet."
                />
              </AdminCard>
            </div>

            <AdminCard padding="lg" hover={false}>
              <h2 className="mb-4 text-sm font-medium text-[var(--admin-text-muted)]">Top pages</h2>
              {data.topPageLabels.length > 0 ? (
                <StatsChart
                  type="bar"
                  labels={data.topPageLabels}
                  datasets={[
                    {
                      label: "Views",
                      data: data.topPageData,
                      backgroundColor: "rgba(201, 169, 98, 0.35)",
                      borderColor: "#c9a962",
                    },
                  ]}
                />
              ) : (
                <p className="text-sm text-[var(--admin-text-muted)]">No page view data yet.</p>
              )}
            </AdminCard>
          </>
        )}
      </AdminPageContent>
    </>
  );
}
