"use client";

import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { DashboardWidget, DashboardWidgetLink } from "@/components/admin/dashboard/DashboardWidget";

type InvoiceItem = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  client_name: string;
};

type MessageItem = {
  id: string;
  subject: string;
  sender_name: string;
  read: boolean;
};

type TaskItem = {
  id: string;
  label: string;
  due: string;
  href: string;
};

export function DashboardInvoicesWidget({
  invoices,
  formatCurrency,
}: {
  invoices: InvoiceItem[];
  formatCurrency: (n: number) => string;
}) {
  return (
    <DashboardWidget title="Recent Invoices" subtitle="Latest billing activity" actionHref="/admin/invoices">
      {invoices.length === 0 ? (
        <p className="text-sm text-[var(--admin-text-muted)]">No invoices yet.</p>
      ) : (
        <ul className="space-y-2">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <DashboardWidgetLink href="/admin/invoices">
                <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--admin-text)]">{inv.client_name}</p>
                    <p className="truncate text-xs text-[var(--admin-text-muted)]">{inv.invoice_number}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums text-[var(--admin-gold-light)]">
                      {formatCurrency(inv.amount)}
                    </span>
                    <AdminStatusBadge status={inv.status} />
                  </div>
                </div>
              </DashboardWidgetLink>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}

export function DashboardMessagesWidget({ messages }: { messages: MessageItem[] }) {
  return (
    <DashboardWidget title="Messages" subtitle="Recent conversations" actionHref="/admin/messages">
      {messages.length === 0 ? (
        <p className="text-sm text-[var(--admin-text-muted)]">No messages yet.</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((msg) => (
            <li key={msg.id}>
              <DashboardWidgetLink href="/admin/messages">
                <div className="flex items-start gap-3 px-3 py-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--admin-emerald)]/20 text-xs font-semibold text-[var(--admin-gold-light)]">
                    {msg.sender_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-[var(--admin-text)]">{msg.sender_name}</p>
                      {!msg.read ? (
                        <span className="admin-dashboard-unread-dot" aria-label="Unread" />
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-[var(--admin-text-muted)]">{msg.subject}</p>
                  </div>
                </div>
              </DashboardWidgetLink>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}

export function DashboardTasksWidget({ tasks }: { tasks: TaskItem[] }) {
  return (
    <DashboardWidget title="Tasks" subtitle="Priority follow-ups" actionHref="/admin/leads">
      {tasks.length === 0 ? (
        <p className="text-sm text-[var(--admin-text-muted)]">You&apos;re all caught up.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link
                href={task.href}
                className="admin-dashboard-task flex items-start gap-3 rounded-xl border border-[var(--admin-border-subtle)] px-3 py-2.5 transition-colors hover:border-[var(--admin-gold)]/25"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--admin-gold)]/40" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--admin-text)]">{task.label}</p>
                  <p className="mt-0.5 text-xs text-[var(--admin-gold)]">{task.due}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}

export function DashboardAiInsights({
  summary,
  leadsThisMonth,
  activeProjects,
  conversionRate,
}: {
  summary: string;
  leadsThisMonth: number;
  activeProjects: number;
  conversionRate: number;
}) {
  return (
    <DashboardWidget title="AI Insights" subtitle="Performance summary" actionHref="/admin/analytics" actionLabel="View report">
      <div className="relative">
        <div className="admin-dashboard-ai-orb" aria-hidden />
        <p className="text-sm leading-relaxed text-[var(--admin-text-muted)]">{summary}</p>
        <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
        <div>
          <p className="text-lg font-bold tabular-nums text-[var(--admin-gold-light)]">{leadsThisMonth}</p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">Leads</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-[var(--admin-text)]">{activeProjects}</p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">Projects</p>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-[var(--admin-emerald)]">{conversionRate}%</p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">Conversion</p>
        </div>
      </div>
        <Link href="/admin/analytics" className="admin-btn-gold relative mt-4 inline-flex w-full justify-center py-2.5 text-sm">
          View Full Report
        </Link>
      </div>
    </DashboardWidget>
  );
}
