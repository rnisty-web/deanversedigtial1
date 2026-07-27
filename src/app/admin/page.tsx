"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminDashboardHero } from "@/components/admin/AdminDashboardHero";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  DashboardInvoicesWidget,
  DashboardMessagesWidget,
  DashboardTasksWidget,
} from "@/components/admin/dashboard/DashboardSideWidgets";
import { DashboardKpiStrip } from "@/components/admin/dashboard/DashboardKpiStrip";
import {
  DashboardDeadlinesTable,
  DashboardPaymentsTable,
  DashboardProjectStatusBar,
} from "@/components/admin/dashboard/DashboardOperationsRow";
import { DashboardQuickNav } from "@/components/admin/dashboard/DashboardQuickNav";
import { DashboardSkeleton } from "@/components/admin/dashboard/DashboardSkeleton";
import { DashboardTrafficPanel } from "@/components/admin/dashboard/DashboardTrafficPanel";
import { DashboardSectionHeader } from "@/components/admin/dashboard/DashboardWidget";

type RecentInvoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  client_name: string;
};

type ActivitySummary = {
  newLeadsCount: number;
  totalLeads: number;
  unreadMessagesCount: number;
  activeProjectsCount: number;
  onlineCount: number;
  awayCount: number;
};

type DashboardStats = {
  leadsCount: number;
  projectsCount: number;
  activeProjectsCount: number;
  clientsCount: number;
  portfolioCount: number;
  testimonialsCount: number;
  conversionRate: number;
  leadStatusCounts: Record<string, number>;
  pageViewLabels: string[];
  pageViewData: number[];
  activitySummary: ActivitySummary;
  presenceReady: boolean;
  viewerName: string;
  leadsThisMonth: number;
  totalPaidRevenue: number;
  pendingInvoiceAmount: number;
  recentInvoices: RecentInvoice[];
  projectStatusCounts: Record<string, number>;
  upcomingDeadlines: {
    id: string;
    title: string;
    deadline: string;
    status: string;
    client_name: string;
  }[];
  recentPayments: {
    id: string;
    invoice_number: string;
    amount: number;
    client_name: string;
    created_at: string;
  }[];
  recentMessages: {
    id: string;
    subject: string;
    read: boolean;
    created_at: string;
    sender_name: string;
  }[];
};

function buildTaskItems(stats: DashboardStats) {
  const tasks: { id: string; label: string; due: string; href: string }[] = [];
  const newLeads = stats.leadStatusCounts["new"] ?? 0;
  if (newLeads > 0) {
    tasks.push({
      id: "new-leads",
      label: `Follow up on ${newLeads} new lead${newLeads === 1 ? "" : "s"}`,
      due: "Today",
      href: "/admin/leads",
    });
  }
  if (stats.activitySummary.unreadMessagesCount > 0) {
    tasks.push({
      id: "messages",
      label: `Reply to ${stats.activitySummary.unreadMessagesCount} unread message${stats.activitySummary.unreadMessagesCount === 1 ? "" : "s"}`,
      due: "Today",
      href: "/admin/messages",
    });
  }
  if (stats.pendingInvoiceAmount > 0) {
    tasks.push({
      id: "invoices",
      label: "Review pending invoices",
      due: "This week",
      href: "/admin/invoices",
    });
  }
  if (stats.upcomingDeadlines?.[0]) {
    tasks.push({
      id: "deadline",
      label: `Deadline: ${stats.upcomingDeadlines[0].title}`,
      due: formatShortDate(stats.upcomingDeadlines[0].deadline),
      href: "/admin/projects",
    });
  }
  return tasks.slice(0, 4);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoading(true);
      setError(null);
    }

    const res = await fetch("/api/admin/dashboard", { credentials: "same-origin" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (!options?.silent) {
        setError(data.error ?? "Failed to load dashboard. Make sure you are logged in as admin.");
        setStats(null);
        setLoading(false);
      }
      return;
    }

    const data = await res.json();
    setStats(data);
    if (!options?.silent) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats({ silent: true });
    }, 60_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const totalPageViews = stats?.pageViewData.reduce((sum, n) => sum + n, 0) ?? 0;
  const needsSetup =
    stats &&
    stats.portfolioCount === 0 &&
    stats.testimonialsCount === 0 &&
    stats.leadsCount === 0;

  return (
    <>
      {loading ? (
        <AdminHeader
          title="Dashboard"
          subtitle="Actionable overview — KPIs, priorities, and quick links to each workspace."
          showPortalBadge={false}
          showActivityPicker={false}
        />
      ) : stats ? (
        <AdminDashboardHero
          viewerName={stats.viewerName}
          unreadMessagesCount={stats.activitySummary.unreadMessagesCount}
        />
      ) : (
        <AdminHeader
          title="Dashboard"
          subtitle="Actionable overview — KPIs, priorities, and quick links to each workspace."
          showPortalBadge={false}
          showActivityPicker={false}
        />
      )}

      <AdminPageContent>
        {error && (
          <div className="mb-6">
            <AdminAlert tone="error">
              {error}
              {error === "Forbidden" || error === "Unauthorized" ? (
                <span>
                  {" "}
                  Make sure you are logged in with a founder or staff account and your profile
                  role is set correctly in Supabase.
                </span>
              ) : null}
            </AdminAlert>
          </div>
        )}

        {stats && !stats.presenceReady && (
          <div className="mb-6">
            <AdminAlert tone="warning">
              Live presence and activity status need a one-time database update. Run{" "}
              <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">
                supabase/roles-and-presence-step1-enums.sql
              </code>{" "}
              first, then{" "}
              <code className="rounded bg-black/20 px-1.5 py-0.5 text-xs">
                supabase/roles-and-presence-step2.sql
              </code>{" "}
              in the Supabase SQL Editor, then refresh this page.
            </AdminAlert>
          </div>
        )}

        {loading ? (
          <DashboardSkeleton />
        ) : !stats ? (
          <p className="text-[var(--admin-text-muted)]">Unable to load dashboard data.</p>
        ) : (
          <div className="admin-dashboard-page">
            <DashboardKpiStrip
              revenue={formatCurrency(stats.totalPaidRevenue)}
              revenueHint={
                stats.pendingInvoiceAmount > 0
                  ? `${formatCurrency(stats.pendingInvoiceAmount)} pending`
                  : undefined
              }
              activeProjects={stats.activeProjectsCount}
              totalProjects={stats.projectsCount}
              clients={stats.clientsCount}
              leadsThisMonth={stats.leadsThisMonth}
              websiteTraffic={totalPageViews}
              conversionRate={stats.conversionRate}
            />

            <section className="admin-dashboard-featured-grid">
              <DashboardTrafficPanel
                labels={stats.pageViewLabels}
                data={stats.pageViewData}
                totalViews={totalPageViews}
                conversionRate={stats.conversionRate}
              />
              <DashboardQuickNav />
            </section>

            <section className="admin-dashboard-section">
              <DashboardSectionHeader
                eyebrow="Today"
                title="Priority actions"
                subtitle="Tasks, messages, and billing that need your attention"
              />
              <div className="admin-dashboard-widget-grid">
                <DashboardTasksWidget tasks={buildTaskItems(stats)} />
                <DashboardMessagesWidget messages={stats.recentMessages ?? []} />
                <DashboardInvoicesWidget invoices={stats.recentInvoices} />
              </div>
            </section>

            <section className="admin-dashboard-section">
              <DashboardSectionHeader
                eyebrow="Studio"
                title="Operations snapshot"
                subtitle="Pipeline health, deadlines, and recent payments"
              />
              <div className="admin-dashboard-widget-grid">
                <DashboardProjectStatusBar statusCounts={stats.projectStatusCounts} />
                <DashboardDeadlinesTable deadlines={stats.upcomingDeadlines ?? []} />
                <DashboardPaymentsTable payments={stats.recentPayments ?? []} />
              </div>
            </section>

            {needsSetup ? (
              <div className="admin-dashboard-setup-panel admin-luxury-card">
                <div className="admin-dashboard-setup-icon" aria-hidden>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="admin-dashboard-widget-eyebrow">Getting started</p>
                  <h3 className="admin-dashboard-widget-title">Launch your studio portal</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--admin-text-muted)]">
                    Seed your site content at{" "}
                    <Link href="/admin/content" className="text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]">
                      Site Content → Seed Defaults
                    </Link>
                    , then add portfolio pieces and testimonials for a polished public site.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/admin/portfolio" className="admin-btn-gold px-4 py-2 text-xs">
                      Add portfolio
                    </Link>
                    <Link href="/admin/testimonials" className="admin-btn-ghost px-4 py-2 text-xs">
                      Add testimonials
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </AdminPageContent>
    </>
  );
}
