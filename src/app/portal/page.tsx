import { requireAuth } from "@/lib/auth";
import { getPortalDashboard } from "@/lib/portal/get-portal-dashboard";
import { getPendingInquiryState } from "@/lib/portal/pending-inquiry";
import { ProjectList } from "@/components/portal/ProjectList";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PendingInquiryNotice } from "@/components/portal/PendingInquiryNotice";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import {
  DashboardListRow,
  DashboardPanel,
} from "@/components/dashboard/DashboardPanel";
import { DashboardSectionHeader } from "@/components/dashboard/DashboardSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export default async function PortalDashboardPage() {
  const profile = await requireAuth();
  const [data, inquiryState] = await Promise.all([
    getPortalDashboard(profile.id),
    getPendingInquiryState(profile.id, profile.email),
  ]);

  return (
    <PortalPageContent>
      <PortalPageHeader
        title={`Welcome back, ${profile.full_name?.split(" ")[0] ?? "there"}`}
        subtitle="Your projects, messages, invoices, and account settings."
      />

      <PendingInquiryNotice state={inquiryState} />

      <section className="mb-8">
        <DashboardSectionHeader
          eyebrow="Your work"
          title="Project overview"
          subtitle="Status for your assigned projects only"
          theme="admin"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            label="Active projects"
            value={data.stats.activeProjects}
            hint={`${data.stats.totalProjects} total`}
            href="/portal/projects"
            variant="admin"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            }
          />
          <DashboardStatCard
            label="Unread messages"
            value={data.stats.unreadMessages}
            hint="From your project team"
            href="/portal/messages"
            accent={data.stats.unreadMessages > 0 ? "warning" : "neutral"}
            variant="admin"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            }
          />
          <DashboardStatCard
            label="Open invoices"
            value={data.stats.unpaidInvoices}
            hint={
              data.stats.totalInvoiceAmount > 0
                ? `$${data.stats.totalInvoiceAmount.toLocaleString()} outstanding`
                : "All caught up"
            }
            href="/portal/invoices"
            accent={data.stats.unpaidInvoices > 0 ? "warning" : "primary"}
            variant="admin"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            }
          />
          <DashboardStatCard
            label="Completed"
            value={data.stats.completedProjects}
            hint="Delivered projects"
            href="/portal/projects"
            accent="accent"
            variant="admin"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <DashboardSectionHeader
            eyebrow="Your request"
            title="My project"
            subtitle="Only projects from your contact form request — never other clients"
            actionHref="/portal/projects"
            actionLabel="View project"
            theme="admin"
          />
          <ProjectList projects={data.projects.slice(0, 4)} />
        </section>

        <section className="space-y-6 lg:col-span-2">
          <DashboardPanel
            eyebrow="Messages"
            title="Recent messages"
            actionHref="/portal/messages"
            actionLabel="Open inbox"
            theme="admin"
          >
            {data.recentMessages.length === 0 ? (
              <p className="text-sm text-[var(--admin-text-muted)]">No messages yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.recentMessages.slice(0, 4).map((msg) => (
                  <li key={msg.id}>
                    <DashboardListRow theme="admin">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                          {msg.subject ?? "No subject"}
                        </p>
                        {!msg.read && (
                          <span className="admin-nav-badge shrink-0 !min-w-0 px-2 py-0.5 text-[10px]">New</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">{msg.senderName}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--admin-text-muted)]">{msg.content}</p>
                    </DashboardListRow>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPanel>

          <DashboardPanel
            eyebrow="Invoices"
            title="Your invoices"
            actionHref="/portal/invoices"
            actionLabel="View all"
            theme="admin"
          >
            {data.upcomingInvoices.length === 0 ? (
              <p className="text-sm text-[var(--admin-text-muted)]">No invoices on file yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.upcomingInvoices.map((inv) => (
                  <li key={inv.id}>
                    <DashboardListRow className="flex items-center justify-between gap-3 py-2.5" theme="admin">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[var(--admin-text)]">{inv.invoice_number}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          {inv.due_date
                            ? `Due ${new Date(inv.due_date).toLocaleDateString()}`
                            : "No due date"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[var(--admin-gold-light)]">
                          ${Number(inv.amount).toLocaleString()}
                        </p>
                        <AdminStatusBadge status={inv.status} />
                      </div>
                    </DashboardListRow>
                  </li>
                ))}
              </ul>
            )}
          </DashboardPanel>
        </section>
      </div>
    </PortalPageContent>
  );
}
