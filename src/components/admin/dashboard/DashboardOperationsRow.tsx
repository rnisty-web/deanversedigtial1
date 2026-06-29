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
}: {
  statusCounts: Record<string, number>;
}) {
  const entries = Object.entries(statusCounts).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <DashboardWidget title="Project Status" subtitle="Current pipeline breakdown" actionHref="/admin/projects">
      {total === 0 ? (
        <p className="text-sm text-[var(--admin-text-muted)]">No projects yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {entries.slice(0, 4).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-3xl font-bold tabular-nums text-[var(--admin-gold-light)]">{count}</p>
                <p className="mt-1 text-xs text-[var(--admin-text-muted)]">{formatStatusLabel(status)}</p>
              </div>
            ))}
          </div>
          <div className="admin-dashboard-status-bar mt-5">
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
  formatDate,
}: {
  deadlines: DeadlineRow[];
  formatDate: (d: string) => string;
}) {
  return (
    <DashboardWidget title="Upcoming Deadlines" subtitle="Projects due soon" actionHref="/admin/projects" padding="sm">
      {deadlines.length === 0 ? (
        <p className="px-2 py-4 text-sm text-[var(--admin-text-muted)]">No upcoming deadlines.</p>
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
                    <Link href="/admin/projects" className="font-medium text-[var(--admin-text)] hover:text-[var(--admin-gold-light)]">
                      {row.title}
                    </Link>
                    <p className="text-xs text-[var(--admin-gold)]">{daysUntil(row.deadline)}</p>
                  </td>
                  <td className="text-[var(--admin-text-muted)]">{row.client_name}</td>
                  <td className="tabular-nums text-[var(--admin-text-muted)]">{formatDate(row.deadline)}</td>
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
  formatCurrency,
  formatDate,
}: {
  payments: PaymentRow[];
  formatCurrency: (n: number) => string;
  formatDate: (d: string) => string;
}) {
  return (
    <DashboardWidget title="Recent Payments" subtitle="Completed transactions" actionHref="/admin/invoices" padding="sm">
      {payments.length === 0 ? (
        <p className="px-2 py-4 text-sm text-[var(--admin-text-muted)]">No payments recorded yet.</p>
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
                  <td className="tabular-nums text-[var(--admin-gold-light)]">{formatCurrency(row.amount)}</td>
                  <td className="tabular-nums text-[var(--admin-text-muted)]">{formatDate(row.created_at)}</td>
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
