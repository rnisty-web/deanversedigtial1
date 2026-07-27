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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DashboardInvoicesWidget({
  invoices,
  href = "/admin/invoices",
}: {
  invoices: InvoiceItem[];
  href?: string;
}) {
  return (
    <DashboardWidget
      eyebrow="Billing"
      title="Recent invoices"
      subtitle="Latest payment activity"
      actionHref={href}
    >
      {invoices.length === 0 ? (
        <p className="admin-dashboard-empty-copy">No invoices yet.</p>
      ) : (
        <ul className="admin-dashboard-list">
          {invoices.map((inv) => (
            <li key={inv.id}>
              <DashboardWidgetLink href={href}>
                <div className="admin-dashboard-list-row">
                  <div className="min-w-0">
                    <p className="admin-dashboard-list-title">{inv.client_name}</p>
                    <p className="admin-dashboard-list-meta">{inv.invoice_number}</p>
                  </div>
                  <div className="admin-dashboard-list-aside">
                    <span className="admin-dashboard-list-value">{formatCurrency(inv.amount)}</span>
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

export function DashboardMessagesWidget({
  messages,
  href = "/admin/messages",
}: {
  messages: MessageItem[];
  href?: string;
}) {
  return (
    <DashboardWidget
      eyebrow="Inbox"
      title="Messages"
      subtitle="Recent conversations"
      actionHref={href}
    >
      {messages.length === 0 ? (
        <p className="admin-dashboard-empty-copy">No messages yet.</p>
      ) : (
        <ul className="admin-dashboard-list">
          {messages.map((msg) => (
            <li key={msg.id}>
              <DashboardWidgetLink href={href}>
                <div className="admin-dashboard-list-row">
                  <div className="admin-dashboard-avatar">{msg.sender_name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="admin-dashboard-list-title">{msg.sender_name}</p>
                      {!msg.read ? <span className="admin-dashboard-unread-dot" aria-label="Unread" /> : null}
                    </div>
                    <p className="admin-dashboard-list-meta">{msg.subject}</p>
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

export function DashboardTasksWidget({
  tasks,
  href = "/admin/leads",
}: {
  tasks: TaskItem[];
  href?: string;
}) {
  return (
    <DashboardWidget
      eyebrow="Action items"
      title="Priority tasks"
      subtitle="What needs attention now"
      actionHref={href}
    >
      {tasks.length === 0 ? (
        <p className="admin-dashboard-empty-copy">You&apos;re all caught up.</p>
      ) : (
        <ul className="admin-dashboard-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={task.href} className="admin-dashboard-task">
                <span className="admin-dashboard-task-marker" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="admin-dashboard-task-label">{task.label}</p>
                  <p className="admin-dashboard-task-due">{task.due}</p>
                </div>
                <span className="admin-dashboard-task-arrow" aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardWidget>
  );
}
