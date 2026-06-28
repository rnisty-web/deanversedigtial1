"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminDashboardHero } from "@/components/admin/AdminDashboardHero";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminMiniCalendar } from "@/components/admin/AdminMiniCalendar";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminRecentActivity } from "@/components/admin/AdminRecentActivity";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { ActivityStatusBadge, ActivityStatusPicker, useActivityStatus } from "@/components/admin/ActivityStatusPicker";
import { PresenceIndicator, PresenceLegend } from "@/components/admin/PresenceIndicator";
import { StatsChart } from "@/components/admin/StatsChart";
import {
  DashboardEmptyState,
  DashboardListRow,
  DashboardMetricRow,
  DashboardPanel,
  DashboardProgressRow,
} from "@/components/dashboard/DashboardPanel";
import { DashboardSectionHeader } from "@/components/dashboard/DashboardSectionHeader";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { RoleBadges } from "@/components/ui/RoleBadges";
import type { ActivityStatus } from "@/lib/activity-status";
import { cn } from "@/lib/utils";

type RecentLead = {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
};

type RecentInvoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  client_name: string;
};

type ActivityFeedItem = {
  type: "lead" | "invoice";
  message: string;
  timestamp: string;
};

type LiveUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  roles: string[];
  roleLabel: string;
  roleBadgeClass: string;
  isFounder: boolean;
  last_seen_at: string | null;
  activityStatus: string;
  presence: "online" | "away" | "offline";
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
  recentLeads: RecentLead[];
  leadStatusCounts: Record<string, number>;
  pageViewLabels: string[];
  pageViewData: number[];
  liveUsers: LiveUser[];
  activitySummary: ActivitySummary;
  ownerEmail: string;
  viewerIsFounder: boolean;
  viewerId: string;
  presenceReady: boolean;
  myActivityStatus: string;
  viewerName: string;
  leadsThisMonth: number;
  totalPaidRevenue: number;
  pendingInvoiceAmount: number;
  recentInvoices: RecentInvoice[];
  projectStatusCounts: Record<string, number>;
  recentActivity: ActivityFeedItem[];
};

function formatRelativeDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATIC_TREND = "+—";

const statIcons = {
  revenue: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.242 0l.879.659m0-3.182V6.75A2.25 2.25 0 0010.5 4.5h-3A2.25 2.25 0 005.25 6.75v.659m0 3.182V12" />
    </svg>
  ),
  leads: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  projects: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  clients: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamExpanded, setTeamExpanded] = useState(false);
  const {
    status: myActivityStatus,
    canEdit: canEditActivity,
    saving: savingActivity,
    save: saveActivity,
  } = useActivityStatus();

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

  async function handleActivityChange(next: ActivityStatus) {
    const ok = await saveActivity(next);
    if (!ok || !stats) return;

    setStats((prev) =>
      prev
        ? {
            ...prev,
            myActivityStatus: next,
            liveUsers: prev.liveUsers.map((user) =>
              user.id === prev.viewerId ? { ...user, activityStatus: next } : user,
            ),
          }
        : prev,
    );
    fetchStats({ silent: true });
  }

  const newLeadsCount = stats?.leadStatusCounts["new"] ?? 0;
  const totalPageViews = stats?.pageViewData.reduce((sum, n) => sum + n, 0) ?? 0;
  const needsSetup =
    stats &&
    stats.portfolioCount === 0 &&
    stats.testimonialsCount === 0 &&
    stats.leadsCount === 0;

  const projectStatusLabels = stats ? Object.keys(stats.projectStatusCounts) : [];
  const projectStatusValues = stats ? Object.values(stats.projectStatusCounts) : [];

  return (
    <>
      {loading ? (
        <AdminHeader
          title="Dashboard"
          subtitle="Your freelance studio at a glance — leads, projects, and site content."
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
          subtitle="Your freelance studio at a glance — leads, projects, and site content."
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
          <div className="space-y-6">
            <div className="admin-luxury-card h-36 animate-pulse rounded-2xl" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="admin-luxury-card h-28 animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        ) : !stats ? (
          <p className="text-[var(--admin-text-muted)]">Unable to load dashboard data.</p>
        ) : (
          <div className="space-y-8">
            {/* Row 1: Key stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DashboardStatCard
                variant="admin"
                label="Total Revenue"
                value={formatCurrency(stats.totalPaidRevenue)}
                hint={
                  stats.pendingInvoiceAmount > 0
                    ? `${formatCurrency(stats.pendingInvoiceAmount)} pending`
                    : undefined
                }
                href="/admin/invoices"
                icon={statIcons.revenue}
                accent="accent"
                trend={STATIC_TREND}
              />
              <DashboardStatCard
                variant="admin"
                label="Active Projects"
                value={stats.activeProjectsCount}
                hint={`${stats.projectsCount} total`}
                href="/admin/projects"
                icon={statIcons.projects}
                accent="primary"
                trend={STATIC_TREND}
              />
              <DashboardStatCard
                variant="admin"
                label="Total Clients"
                value={stats.clientsCount}
                href="/admin/clients"
                icon={statIcons.clients}
                trend={STATIC_TREND}
              />
              <DashboardStatCard
                variant="admin"
                label="Leads This Month"
                value={stats.leadsThisMonth}
                href="/admin/leads"
                icon={statIcons.leads}
                accent="accent"
                trend={STATIC_TREND}
              />
            </div>

            {/* Row 2: Traffic chart + Recent Activity + Mini Calendar */}
            <div className="grid gap-6 lg:grid-cols-12">
              <DashboardPanel theme="admin" padding="md" className="lg:col-span-7">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--admin-text)]">Traffic & revenue</h4>
                    <p className="text-xs text-[var(--admin-text-muted)]">Page views — last 7 days</p>
                  </div>
                  <Link
                    href="/admin/analytics"
                    className="text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                  >
                    Full analytics →
                  </Link>
                </div>
                <StatsChart
                  type="line"
                  variant="luxury"
                  labels={stats.pageViewLabels}
                  datasets={[{ label: "Views", data: stats.pageViewData }]}
                  height={320}
                  emptyMessage="No page views recorded yet. Browse your site to start tracking."
                />
              </DashboardPanel>

              <div className="flex flex-col gap-6 lg:col-span-5">
                <DashboardPanel theme="admin" padding="md" className="flex-1">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-medium text-[var(--admin-text)]">Recent activity</h4>
                      <p className="text-xs text-[var(--admin-text-muted)]">Latest leads & invoices</p>
                    </div>
                  </div>
                  <AdminRecentActivity items={stats.recentActivity} />
                </DashboardPanel>

                <DashboardPanel theme="admin" padding="md">
                  <AdminMiniCalendar />
                </DashboardPanel>
              </div>
            </div>

            {/* Row 3: Project status, Recent invoices, Quick metrics */}
            <div className="grid gap-6 lg:grid-cols-12">
              <DashboardPanel theme="admin" padding="md" className="lg:col-span-4">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--admin-text)]">Project status</h4>
                    <p className="text-xs text-[var(--admin-text-muted)]">By current status</p>
                  </div>
                  <Link
                    href="/admin/projects"
                    className="text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                  >
                    View all →
                  </Link>
                </div>
                <StatsChart
                  type="doughnut"
                  labels={projectStatusLabels}
                  datasets={[{ label: "Projects", data: projectStatusValues }]}
                  height={220}
                  emptyMessage="No projects yet. Create your first project to track status."
                />
              </DashboardPanel>

              <DashboardPanel theme="admin" padding="md" className="lg:col-span-4">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--admin-text)]">Recent invoices</h4>
                    <p className="text-xs text-[var(--admin-text-muted)]">Latest billing activity</p>
                  </div>
                  <Link
                    href="/admin/invoices"
                    className="text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                  >
                    View all →
                  </Link>
                </div>
                {stats.recentInvoices.length === 0 ? (
                  <DashboardEmptyState
                    theme="admin"
                    message="No invoices yet."
                    hint="Create an invoice from the billing section."
                  />
                ) : (
                  <ul className="space-y-3">
                    {stats.recentInvoices.map((inv) => (
                      <li key={inv.id}>
                        <Link
                          href="/admin/invoices"
                          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--admin-border-subtle)] px-3 py-2.5 transition-colors hover:border-[var(--admin-gold)]/30 hover:bg-[var(--admin-gold-soft)]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                              {inv.invoice_number}
                            </p>
                            <p className="truncate text-xs text-[var(--admin-text-muted)]">
                              {inv.client_name}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-sm font-semibold tabular-nums text-[var(--admin-gold-light)]">
                              {formatCurrency(inv.amount)}
                            </span>
                            <AdminStatusBadge status={inv.status} />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </DashboardPanel>

              <DashboardPanel theme="admin" padding="md" className="lg:col-span-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-[var(--admin-text)]">Studio snapshot</h4>
                  <p className="text-xs text-[var(--admin-text-muted)]">Content & conversion</p>
                </div>
                <div className="space-y-3">
                  <DashboardMetricRow
                    theme="admin"
                    label="Conversion rate"
                    value={`${stats.conversionRate}%`}
                    href="/admin/leads"
                  />
                  <DashboardMetricRow
                    theme="admin"
                    label="Portfolio items"
                    value={stats.portfolioCount}
                    href="/admin/portfolio"
                  />
                  <DashboardMetricRow
                    theme="admin"
                    label="Testimonials"
                    value={stats.testimonialsCount}
                    href="/admin/testimonials"
                  />
                  <DashboardMetricRow
                    theme="admin"
                    label="Unread messages"
                    value={stats.activitySummary.unreadMessagesCount}
                    href="/admin/messages"
                    highlight={stats.activitySummary.unreadMessagesCount > 0}
                  />
                </div>
              </DashboardPanel>
            </div>

            {/* Setup hint */}
            {needsSetup && (
              <DashboardPanel
                theme="admin"
                variant="featured"
                eyebrow="Getting started"
                title="Get your portal set up"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--admin-gold)_25%,transparent)] bg-[var(--admin-gold-soft)] text-[var(--admin-gold-light)]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed text-[var(--admin-text-muted)]">
                      Seed your site content at{" "}
                      <Link href="/admin/content" className="text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]">
                        Site Content → Seed Defaults
                      </Link>
                      . Add portfolio pieces and testimonials so your public site looks polished from
                      day one.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/admin/portfolio"
                        className="admin-luxury-card rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                      >
                        Add portfolio
                      </Link>
                      <Link
                        href="/admin/testimonials"
                        className="admin-luxury-card rounded-xl px-3 py-1.5 text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                      >
                        Add testimonials
                      </Link>
                    </div>
                  </div>
                </div>
              </DashboardPanel>
            )}

            {/* Content health */}
            <section>
              <DashboardSectionHeader
                theme="admin"
                eyebrow="Content"
                title="Site content health"
                subtitle="Public-facing content at a glance"
              />
              <DashboardPanel theme="admin" padding="md" className="space-y-4">
                <DashboardProgressRow
                  theme="admin"
                  label="Portfolio"
                  count={stats.portfolioCount}
                  href="/admin/portfolio"
                  target={6}
                />
                <DashboardProgressRow
                  theme="admin"
                  label="Testimonials"
                  count={stats.testimonialsCount}
                  href="/admin/testimonials"
                  target={4}
                />
                <DashboardProgressRow
                  theme="admin"
                  label="Page views (7d)"
                  count={totalPageViews}
                  href="/admin/analytics"
                  target={50}
                  suffix=""
                />
                <div className="border-t border-[var(--admin-border-subtle)] pt-4">
                  <Link
                    href="/"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                  >
                    Preview public site
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </Link>
                </div>
              </DashboardPanel>
            </section>

            {/* Leads pipeline chart */}
            <section>
              <DashboardSectionHeader
                theme="admin"
                eyebrow="Analytics"
                title="Lead pipeline"
                subtitle="Status breakdown"
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardPanel theme="admin" padding="md">
                  <StatsChart
                    type="doughnut"
                    labels={Object.keys(stats.leadStatusCounts)}
                    datasets={[
                      {
                        label: "Leads",
                        data: Object.values(stats.leadStatusCounts),
                      },
                    ]}
                    emptyMessage="No leads yet. Share your contact page to get inquiries."
                  />
                </DashboardPanel>
              </div>
            </section>

            {/* Recent leads table */}
            <section>
              <DashboardPanel
                theme="admin"
                eyebrow="Pipeline"
                title="Recent leads"
                subtitle="Latest inquiries from your contact form"
                actionHref="/admin/leads"
                actionLabel="View all"
              >
                {stats.recentLeads.length === 0 ? (
                  <DashboardEmptyState
                    theme="admin"
                    message="No leads yet."
                    hint="Share your contact page to start receiving inquiries."
                  />
                ) : (
                  <div className="-mx-2 overflow-x-auto">
                    <table className="w-full min-w-[480px] text-sm">
                      <thead>
                        <tr className="border-b border-[var(--admin-border-subtle)] text-left text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">
                          <th className="pb-3 pl-2 pr-4 font-medium">Name</th>
                          <th className="pb-3 pr-4 font-medium">Email</th>
                          <th className="pb-3 pr-4 font-medium">Status</th>
                          <th className="pb-3 pr-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentLeads.map((lead) => (
                          <tr
                            key={lead.id}
                            className="border-b border-[var(--admin-border-subtle)] text-[var(--admin-text)] last:border-0"
                          >
                            <td className="py-3.5 pl-2 pr-4 font-medium text-[var(--admin-text)]">{lead.name}</td>
                            <td className="py-3.5 pr-4 text-[var(--admin-text-muted)]">{lead.email}</td>
                            <td className="py-3.5 pr-4">
                              <AdminStatusBadge status={lead.status} />
                            </td>
                            <td className="py-3.5 pr-2 text-[var(--admin-text-muted)]">
                              {formatRelativeDate(lead.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {newLeadsCount > 0 && (
                  <div className="mt-5 border-t border-[var(--admin-border-subtle)] pt-4">
                    <Link
                      href="/admin/leads"
                      className="text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                    >
                      {newLeadsCount} lead{newLeadsCount === 1 ? "" : "s"} awaiting follow-up →
                    </Link>
                  </div>
                )}
              </DashboardPanel>
            </section>

            {/* Team presence — collapsible at bottom */}
            <section>
              <button
                type="button"
                onClick={() => setTeamExpanded((v) => !v)}
                className="admin-luxury-card flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-colors hover:border-[var(--admin-gold)]/25"
                aria-expanded={teamExpanded}
              >
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-gold)]">
                    Live status
                  </p>
                  <p className="mt-1 text-sm font-medium text-[var(--admin-text)]">
                    Team & activity
                    <span className="ml-2 text-[var(--admin-text-muted)]">
                      · {stats.activitySummary.onlineCount} online
                      {stats.activitySummary.awayCount > 0
                        ? ` · ${stats.activitySummary.awayCount} away`
                        : ""}
                    </span>
                  </p>
                </div>
                <svg
                  className={cn(
                    "h-5 w-5 shrink-0 text-[var(--admin-text-muted)] transition-transform",
                    teamExpanded && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {teamExpanded && (
                <DashboardPanel
                  theme="admin"
                  variant="featured"
                  className="mt-4"
                  headerExtra={
                    <div className="flex flex-col items-end gap-3">
                      <PresenceLegend />
                      {canEditActivity && (
                        <div className="admin-luxury-card flex flex-col items-end gap-2 rounded-xl p-3">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Your status
                          </span>
                          <ActivityStatusPicker
                            value={myActivityStatus}
                            onChange={handleActivityChange}
                            disabled={savingActivity}
                            compact
                            className="min-w-[180px]"
                          />
                        </div>
                      )}
                    </div>
                  }
                >
                  {stats.liveUsers.length === 0 ? (
                    <p className="text-sm text-[var(--admin-text-muted)]">No users found.</p>
                  ) : (
                    <ul className="space-y-3">
                      {stats.liveUsers.map((user) => (
                        <li key={user.id}>
                          <DashboardListRow
                            theme="admin"
                            featured={user.isFounder}
                            className="flex items-center justify-between gap-4 py-3.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-[var(--admin-text)]">
                                {user.full_name ?? user.email}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <RoleBadges roles={user.roles} size="sm" />
                                <ActivityStatusBadge status={user.activityStatus} />
                              </div>
                              {!user.isFounder && user.full_name && (
                                <p className="mt-0.5 truncate text-xs text-[var(--admin-text-muted)]">{user.email}</p>
                              )}
                            </div>
                            <PresenceIndicator
                              lastSeenAt={user.last_seen_at}
                              showLabel
                              showLastSeen
                              size={user.isFounder ? "lg" : "md"}
                              prominent={user.isFounder}
                            />
                          </DashboardListRow>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-5 grid gap-3 border-t border-[var(--admin-border-subtle)] pt-4 sm:grid-cols-3">
                    <DashboardMetricRow
                      theme="admin"
                      label="New leads awaiting follow-up"
                      value={stats.activitySummary.newLeadsCount}
                      href="/admin/leads"
                      highlight={stats.activitySummary.newLeadsCount > 0}
                    />
                    <DashboardMetricRow
                      theme="admin"
                      label="Unread messages"
                      value={stats.activitySummary.unreadMessagesCount}
                      href="/admin/messages"
                      highlight={stats.activitySummary.unreadMessagesCount > 0}
                    />
                    <DashboardMetricRow
                      theme="admin"
                      label="Users online now"
                      value={stats.activitySummary.onlineCount}
                      href="/admin/users"
                      suffix={
                        stats.activitySummary.awayCount > 0
                          ? ` · ${stats.activitySummary.awayCount} away`
                          : undefined
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--admin-border-subtle)] pt-4 text-xs">
                    <Link
                      href="/admin/users"
                      className="font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                    >
                      Manage users & roles →
                    </Link>
                  </div>
                </DashboardPanel>
              )}
            </section>
          </div>
        )}
      </AdminPageContent>
    </>
  );
}
