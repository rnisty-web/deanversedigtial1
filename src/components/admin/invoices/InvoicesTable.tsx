"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import type { InvoiceRecord } from "@/lib/invoices/utils";
import {
  formatCurrency,
  formatDate,
  initials,
  invoiceStatuses,
  joinClientEmail,
  joinClientName,
  joinProjectTitle,
  statusStyle,
} from "@/lib/invoices/utils";
import { cn } from "@/lib/utils";

export function InvoiceStatusBadge({ status }: { status: string }) {
  const style = statusStyle(status);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
}

type MenuState = { invoice: InvoiceRecord; top: number; left: number };

const MENU_WIDTH = 192;
const MENU_ESTIMATED_HEIGHT = 260;

function getMenuPosition(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
  let top = rect.bottom + 6;
  if (top + MENU_ESTIMATED_HEIGHT > window.innerHeight - 8) {
    top = Math.max(8, rect.top - MENU_ESTIMATED_HEIGHT - 6);
  }
  return { top, left };
}

type InvoicesTableProps = {
  invoices: InvoiceRecord[];
  loading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onView: (invoice: InvoiceRecord) => void;
  onEdit: (invoice: InvoiceRecord) => void;
  onDelete: (id: string) => void;
  onStatusChange: (invoice: InvoiceRecord, status: string) => void;
};

export function InvoicesTable({
  invoices,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: InvoicesTableProps) {
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const allSelected = invoices.length > 0 && invoices.every((inv) => selectedIds.has(inv.id));

  useEffect(() => {
    if (!menuState) return;
    function close(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuState(null);
    }
    function closeOnEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuState(null);
    }
    function closeOnScroll() {
      setMenuState(null);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [menuState]);

  if (loading) return <AdminTableSkeleton rows={8} />;

  if (invoices.length === 0) {
    return (
      <div className="admin-invoices-empty px-6 py-16 text-center">
        <p className="text-sm font-medium text-[var(--admin-text)]">No invoices found</p>
        <p className="mt-1 text-sm text-[var(--admin-text-muted)]">Adjust filters or create a new invoice.</p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-invoices-table-wrap">
        <table className="admin-invoices-table w-full min-w-[960px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  aria-label="Select all invoices"
                  className="rounded border-[var(--admin-border-subtle)]"
                />
              </th>
              <th className="px-4 py-3 font-semibold">Invoice</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Due Date</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const clientName = joinClientName(invoice.clients);
              return (
                <tr key={invoice.id} className="admin-invoices-table-row">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(invoice.id)}
                      onChange={() => onToggleSelect(invoice.id)}
                      aria-label={`Select ${invoice.invoice_number}`}
                      className="rounded border-[var(--admin-border-subtle)]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onView(invoice)}
                      className="text-left font-medium text-[var(--admin-text)] hover:text-[var(--admin-gold-light)]"
                    >
                      {invoice.invoice_number}
                    </button>
                    <p className="text-[11px] text-[var(--admin-text-muted)]">#{invoice.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="admin-invoices-avatar">{initials(clientName)}</span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--admin-text)]">{clientName}</p>
                        <p className="truncate text-xs text-[var(--admin-text-muted)]">{joinClientEmail(invoice.clients)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--admin-text-muted)]">{joinProjectTitle(invoice.projects)}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--admin-text-muted)]">{formatDate(invoice.created_at)}</td>
                  <td className="px-4 py-3 tabular-nums text-[var(--admin-text-muted)]">{formatDate(invoice.due_date)}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-[var(--admin-gold-light)]">
                    {formatCurrency(Number(invoice.amount))}
                  </td>
                  <td className="px-4 py-3">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onView(invoice)}
                        className="admin-invoices-action-btn"
                        aria-label={`View ${invoice.invoice_number}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="admin-invoices-action-btn"
                        aria-label={`Download ${invoice.invoice_number}`}
                        onClick={() => window.open(`/portal/invoices/${invoice.id}/print`, "_blank")}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="admin-invoices-action-btn"
                        aria-label={`More actions for ${invoice.invoice_number}`}
                        onClick={(e) => setMenuState({ invoice, ...getMenuPosition(e.currentTarget) })}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {menuState
        ? createPortal(
            <div
              ref={menuRef}
              className="admin-invoices-menu"
              style={{ position: "fixed", top: menuState.top, left: menuState.left, width: MENU_WIDTH }}
              role="menu"
            >
              <button type="button" className="admin-invoices-menu-item" role="menuitem" onClick={() => { onView(menuState.invoice); setMenuState(null); }}>
                View details
              </button>
              <button type="button" className="admin-invoices-menu-item" role="menuitem" onClick={() => { onEdit(menuState.invoice); setMenuState(null); }}>
                Edit invoice
              </button>
              <div className="my-1 border-t border-[var(--admin-border-subtle)]" />
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Update status</p>
              {invoiceStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={cn(
                    "admin-invoices-menu-item capitalize",
                    menuState.invoice.status === status && "text-[var(--admin-gold-light)]",
                  )}
                  role="menuitem"
                  onClick={() => {
                    onStatusChange(menuState.invoice, status);
                    setMenuState(null);
                  }}
                >
                  {statusStyle(status).label}
                </button>
              ))}
              <div className="my-1 border-t border-[var(--admin-border-subtle)]" />
              <button
                type="button"
                className="admin-invoices-menu-item text-red-300"
                role="menuitem"
                onClick={() => {
                  onDelete(menuState.invoice.id);
                  setMenuState(null);
                }}
              >
                Delete invoice
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
