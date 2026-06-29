"use client";

import { AdminModal } from "@/components/admin/AdminModal";
import { InvoiceStatusBadge } from "@/components/admin/invoices/InvoicesTable";
import { Button } from "@/components/ui/Button";
import type { InvoiceRecord } from "@/lib/invoices/utils";
import {
  formatCurrency,
  formatDate,
  invoiceStatuses,
  joinClientName,
  joinProjectTitle,
} from "@/lib/invoices/utils";

type InvoicesDetailModalProps = {
  invoice: InvoiceRecord | null;
  onClose: () => void;
  onEdit: (invoice: InvoiceRecord) => void;
  onDelete: (id: string) => void;
  onStatusChange: (invoice: InvoiceRecord, status: string) => void;
};

export function InvoicesDetailModal({
  invoice,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}: InvoicesDetailModalProps) {
  return (
    <AdminModal open={!!invoice} onClose={onClose} title={invoice?.invoice_number ?? "Invoice"} size="lg">
      {invoice ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <InvoiceStatusBadge status={invoice.status} />
              <p className="mt-3 text-sm text-[var(--admin-text-muted)]">{joinClientName(invoice.clients)}</p>
              {invoice.project_id ? (
                <p className="mt-1 text-sm text-[var(--admin-text-muted)]">Project: {joinProjectTitle(invoice.projects)}</p>
              ) : null}
            </div>
            <p className="text-2xl font-bold tabular-nums text-[var(--admin-gold-light)]">
              {formatCurrency(Number(invoice.amount))}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Created</p>
              <p className="mt-1 text-sm text-[var(--admin-text)]">{formatDate(invoice.created_at)}</p>
            </div>
            <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Due date</p>
              <p className="mt-1 text-sm text-[var(--admin-text)]">{formatDate(invoice.due_date)}</p>
            </div>
          </div>

          {invoice.line_items && invoice.line_items.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Line items</p>
              <ul className="space-y-2">
                {invoice.line_items.map((item, i) => (
                  <li key={i} className="flex justify-between gap-2 rounded-xl border border-[var(--admin-border-subtle)] px-3 py-2 text-sm">
                    <span className="text-[var(--admin-text-muted)]">{item.description}</span>
                    <span className="tabular-nums text-[var(--admin-text)]">
                      {formatCurrency(item.total ?? item.quantity * item.unit_price)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {invoice.notes ? <p className="text-sm text-[var(--admin-text-muted)]">{invoice.notes}</p> : null}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
              Update status
            </label>
            <select
              value={invoice.status}
              onChange={(e) => onStatusChange(invoice, e.target.value)}
              className="admin-input w-full text-sm"
            >
              {invoiceStatuses.map((s) => (
                <option key={s} value={s} className="bg-[var(--admin-bg)]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
            <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => onEdit(invoice)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" className="admin-btn-ghost" onClick={() => onDelete(invoice.id)}>
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </AdminModal>
  );
}
