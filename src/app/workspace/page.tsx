import Link from "next/link";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminStatCard } from "@/components/admin/AdminPageHeader";
import {
  DashboardInvoicesWidget,
  DashboardMessagesWidget,
  DashboardTasksWidget,
} from "@/components/admin/dashboard/DashboardSideWidgets";
import {
  DashboardDeadlinesTable,
  DashboardProjectStatusBar,
} from "@/components/admin/dashboard/DashboardOperationsRow";
import { DashboardSectionHeader } from "@/components/admin/dashboard/DashboardWidget";
import { WorkspaceHero } from "@/components/workspace/WorkspaceHero";
import { workspaceNavIcons } from "@/components/workspace/workspace-nav-icons";
import { toNavItems } from "@/components/workspace/workspace-nav";
import { WORKSPACE_NAV_GROUPS } from "@/lib/workspace/modules";
import { getWorkspaceHome } from "@/lib/workspace/get-workspace-home";
import { requireWorkspaceSession } from "@/lib/workspace/session";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function WorkspaceHomePage() {
  const session = await requireWorkspaceSession();
  const data = await getWorkspaceHome(session);
  const navItems = toNavItems(session.modules);

  const subtitle = session.isStaff
    ? "Your studio command center — priorities, pipeline health, and performance at a glance."
    : "Your project hub — status, messages, files, and invoices in one place.";

  const tasks: { id: string; label: string; due: string; href: string }[] = [];
  if (data.leads && data.leads.newCount > 0) {
    tasks.push({
      id: "new-leads",
      label: `Follow up on ${data.leads.newCount} new lead${data.leads.newCount === 1 ? "" : "s"}`,
      due: "Today",
      href: "/workspace/leads",
    });
  }
  if (data.unreadMessages > 0 && session.can("messages", "view")) {
    tasks.push({
      id: "messages",
      label: `Reply to ${data.unreadMessages} unread message${data.unreadMessages === 1 ? "" : "s"}`,
      due: "Today",
      href: "/workspace/messages",
    });
  }
  if (data.invoices && data.invoices.openCount > 0) {
    tasks.push({
      id: "invoices",
      label: session.scope === "own" ? "Review open invoices" : "Review pending invoices",
      due: "This week",
      href: "/workspace/invoices",
    });
  }
  if (data.projects?.upcoming[0]) {
    tasks.push({
      id: "deadline",
      label: `Deadline: ${data.projects.upcoming[0].title}`,
      due: formatShortDate(data.projects.upcoming[0].deadline!),
      href: "/workspace/projects",
    });
  }

  const kpiCards: {
    label: string;
    value: string | number;
    hint: string;
    href: string;
    goldValue?: boolean;
  }[] = [];

  if (data.invoices && session.isStaff) {
    kpiCards.push({
      label: "Total Revenue",
      value: formatCurrency(data.invoices.paidTotal),
      hint:
        data.invoices.openAmount > 0
          ? `${formatCurrency(data.invoices.openAmount)} pending`
          : "Paid invoices to date",
      href: "/workspace/invoices",
      goldValue: true,
    });
  }

  if (data.projects) {
    kpiCards.push({
      label: session.scope === "own" ? "Active Projects" : "Active Projects",
      value: data.projects.active,
      hint: `${data.projects.total} total`,
      href: "/workspace/projects",
    });
  }

  if (typeof data.clientsCount === "number") {
    kpiCards.push({
      label: "Total Clients",
      value: data.clientsCount,
      hint: "Active relationships",
      href: "/workspace/clients",
    });
  }

  if (data.leads) {
    kpiCards.push({
      label: "New Leads",
      value: data.leads.newCount,
      hint: `${data.leads.total} total`,
      href: "/workspace/leads",
    });
  }

  if (data.invoices && session.scope === "own") {
    kpiCards.push({
      label: "Open Invoices",
      value: data.invoices.openCount,
      hint:
        data.invoices.openAmount > 0
          ? `${formatCurrency(data.invoices.openAmount)} outstanding`
          : "All caught up",
      href: "/workspace/invoices",
      goldValue: true,
    });
  }

  if (session.can("messages", "view")) {
    kpiCards.push({
      label: "Unread Messages",
      value: data.unreadMessages,
      hint: "Inbox",
      href: "/workspace/messages",
    });
  }

  const toolItems = navItems.filter((item) => item.id !== "workspace");
  const toolGroups = WORKSPACE_NAV_GROUPS.map((group) => ({
    label: group,
    items: toolItems.filter((item) => item.group === group),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <WorkspaceHero
        viewerName={data.viewerName}
        unreadMessagesCount={data.unreadMessages}
        navItems={navItems}
        subtitle={subtitle}
      />

      <AdminPageContent>
        <div className="admin-dashboard-page admin-dashboard-page--vivid">
          {data.awaitingClientLink ? (
            <div className="admin-dashboard-setup-panel admin-luxury-card mb-2 p-6">
              <p className="admin-dashboard-widget-eyebrow">Getting started</p>
              <h3 className="admin-dashboard-widget-title mt-1">Your workspace is almost ready</h3>
              <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
                We&apos;re linking your account to your client record. If this persists, contact
                your project team.
              </p>
            </div>
          ) : null}

          {kpiCards.length > 0 ? (
            <div className="admin-dashboard-kpi-grid">
              {kpiCards.map((card, index) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="admin-dashboard-kpi-link"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <AdminStatCard
                    label={card.label}
                    value={card.value}
                    hint={card.hint}
                    goldValue={card.goldValue}
                    className="admin-dashboard-kpi-card"
                  />
                </Link>
              ))}
            </div>
          ) : null}

          <section className="admin-dashboard-section">
            <DashboardSectionHeader
              eyebrow="Today"
              title="Priority actions"
              subtitle="Tasks, messages, and billing that need your attention"
            />
            <div className="admin-dashboard-widget-grid">
              {session.isStaff || tasks.length > 0 ? (
                <DashboardTasksWidget tasks={tasks.slice(0, 4)} href="/workspace/projects" />
              ) : null}
              {session.can("messages", "view") ? (
                <DashboardMessagesWidget
                  messages={data.recentMessages}
                  href="/workspace/messages"
                />
              ) : null}
              {data.invoices && session.can("invoices", "view") ? (
                <DashboardInvoicesWidget
                  invoices={data.invoices.recent}
                  href="/workspace/invoices"
                />
              ) : null}
            </div>
          </section>

          {data.projects && session.can("projects", "view") ? (
            <section className="admin-dashboard-section">
              <DashboardSectionHeader
                eyebrow={session.scope === "own" ? "Your work" : "Studio"}
                title={session.scope === "own" ? "Project overview" : "Operations snapshot"}
                subtitle={
                  session.scope === "own"
                    ? "Status for your assigned projects"
                    : "Pipeline health and upcoming deadlines"
                }
              />
              <div className="admin-dashboard-widget-grid">
                <DashboardProjectStatusBar
                  statusCounts={data.projects.statusCounts}
                  href="/workspace/projects"
                />
                <DashboardDeadlinesTable
                  deadlines={data.projects.upcoming.map((row) => ({
                    id: row.id,
                    title: row.title,
                    deadline: row.deadline!,
                    status: row.status,
                    client_name: row.client_name ?? "—",
                  }))}
                  href="/workspace/projects"
                />
              </div>
            </section>
          ) : null}

          <section className="admin-dashboard-section">
            <DashboardSectionHeader
              eyebrow="Navigate"
              title="Your tools"
              subtitle="Jump to any section you have access to"
            />
            {toolGroups.map((group) => (
              <div key={group.label} className="workspace-tool-group">
                <p className="workspace-tool-group-label">{group.label}</p>
                <div className="workspace-tool-grid">
                  {group.items.map((item) => (
                    <Link key={item.id} href={item.href} className="workspace-tool-card">
                      <span className="workspace-tool-icon" aria-hidden>
                        {workspaceNavIcons[item.id]}
                      </span>
                      <span className="workspace-tool-body">
                        <span className="workspace-tool-label">{item.label}</span>
                        <span className="workspace-tool-desc">{item.description}</span>
                      </span>
                      <svg
                        className="workspace-tool-arrow"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </AdminPageContent>
    </>
  );
}
