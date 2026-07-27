"use client";

import Link from "next/link";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { DashboardWidget } from "@/components/admin/dashboard/DashboardWidget";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  in_progress: "bg-[var(--admin-emerald)]",
  active: "bg-[var(--admin-emerald)]",
  review: "bg-[var(--admin-gold)]",
  in_review: "bg-[var(--admin-gold)]",
  completed: "bg-[var(--admin-emerald-deep)]",
  on_hold: "bg-[var(--admin-danger)]",
  cancelled: "bg-[var(--admin-text-muted)]",
  new: "bg-[var(--admin-emerald)]",
};

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function daysUntil(dateStr: string) {
  const target = new Date(`${dateStr}T12:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff} days left`;
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

type DeadlineRow = {
  id: string;
  title: string;
  deadline: string;
  status: string;
  client_name: string;
};

type PaymentRow = {
  id: string;
  invoice_number: string;
  amount: number;
  client_name: string;
  created_at: string;
};

export function DashboardProjectStatusBar({
  statusCounts,
  href = "/admin/projects",
}: {
  statusCounts: Record<string, number>;
  href?: string;
}) {
  const entries = Object.entries(statusCounts).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <DashboardWidget
      eyebrow="Pipeline"
      title="Project status"
      subtitle="Current workload breakdown"
      actionHref={href}
    >
      {total === 0 ? (
        <p className="admin-dashboard-empty-copy">No projects yet.</p>
      ) : (
        <>
          <div className="admin-dashboard-status-metrics">
            {entries.slice(0, 4).map(([status, count]) => (
              <div key={status} className="admin-dashboard-status-metric">
                <p className="admin-dashboard-status-metric-value">{count}</p>
                <p className="admin-dashboard-status-metric-label">{formatStatusLabel(status)}</p>
              </div>
            ))}
          </div>
          <div className="admin-dashboard-status-bar">
            {entries.map(([status, count]) => (
              <div
                key={status}
                className={cn("admin-dashboard-status-segment", STATUS_COLORS[status] ?? "bg-[var(--admin-gold)]")}
                style={{ width: `${(count / total) * 100}%` }}
                title={`${formatStatusLabel(status)}: ${count}`}
              />
            ))}
          </div>
        </>
      )}
    </DashboardWidget>
  );
}

export function DashboardDeadlinesTable({
  deadlines,
  href = "/admin/projects",
}: {
  deadlines: DeadlineRow[];
  href?: string;
}) {
  return (
    <DashboardWidget
      eyebrow="Delivery"
      title="Upcoming deadlines"
      subtitle="Projects due soon"
      actionHref={href}
      padding="sm"
    >
      {deadlines.length === 0 ? (
        <p className="admin-dashboard-empty-copy px-2 py-4">No upcoming deadlines.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-dashboard-table w-full min-w-[420px] text-sm">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={href} className="admin-dashboard-table-link">
                      {row.title}
                    </Link>
                    <p className="admin-dashboard-table-sub">{daysUntil(row.deadline)}</p>
                  </td>
                  <td className="text-[var(--admin-text-muted)]">{row.client_name}</td>
                  <td className="tabular-nums text-[var(--admin-text-muted)]">{formatShortDate(row.deadline)}</td>
                  <td>
                    <AdminStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardWidget>
  );
}

export function DashboardPaymentsTable({
  payments,
  href = "/admin/invoices",
}: {
  payments: PaymentRow[];
  href?: string;
}) {
  return (
    <DashboardWidget
      eyebrow="Revenue"
      title="Recent payments"
      subtitle="Completed transactions"
      actionHref={href}
      padding="sm"
    >
      {payments.length === 0 ? (
        <p className="admin-dashboard-empty-copy px-2 py-4">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-dashboard-table w-full min-w-[420px] text-sm">
            <thead>
              <tr>
                <th>Client</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((row) => (
                <tr key={row.id}>
                  <td className="font-medium text-[var(--admin-text)]">{row.client_name}</td>
                  <td className="text-[var(--admin-text-muted)]">{row.invoice_number}</td>
                  <td className="admin-dashboard-table-amount">{formatCurrency(row.amount)}</td>
                  <td className="tabular-nums text-[var(--admin-text-muted)]">{formatShortDate(row.created_at)}</td>
                  <td>
                    <AdminStatusBadge status="paid" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardWidget>
  );
}
