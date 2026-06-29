"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { PortalCard } from "@/components/portal/PortalCard";
import { isUnpaidClientInvoice } from "@/lib/portal/client-access";
import type { ClientInvoice } from "@/lib/portal/get-client-data";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  invoices: ClientInvoice[];
  stripeEnabled: boolean;
};

function InvoicePayButton({
  invoiceId,
  stripeEnabled,
}: {
  invoiceId: string;
  stripeEnabled: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!stripeEnabled) {
    return (
      <a
        href={`mailto:${siteConfig.email}?subject=Invoice%20payment`}
        className="text-xs text-[var(--admin-gold-light)] hover:underline"
      >
        Contact us to pay
      </a>
    );
  }

  async function handlePay() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/invoices/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ invoice_id: invoiceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Payment could not be started");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Payment could not be started");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="admin-btn-gold min-h-[44px] disabled:opacity-50"
      >
        {loading ? "Redirecting…" : "Pay now"}
      </button>
      {error && <span className="text-[10px] text-red-300">{error}</span>}
    </div>
  );
}

function PaymentBanner() {
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid");
  const cancelled = searchParams.get("cancelled");

  if (paid) {
    return (
      <AdminAlert tone="success" className="mb-6">
        Thank you — your payment is being processed. Invoice status will update shortly.
      </AdminAlert>
    );
  }

  if (cancelled) {
    return (
      <AdminAlert tone="warning" className="mb-6">
        Payment was cancelled. You can try again when ready.
      </AdminAlert>
    );
  }

  return null;
}

export function PortalInvoiceList({ invoices, stripeEnabled }: Props) {
  if (invoices.length === 0) {
    return (
      <PortalCard padding="lg" className="text-center">
        <p className="text-[var(--admin-text-muted)]">No invoices yet.</p>
        <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
          Invoices appear here when your project milestones are billed.
        </p>
        <Link href="/portal/messages" className="mt-4 inline-block text-sm text-[var(--admin-gold-light)] hover:underline">
          Questions about billing? Message us →
        </Link>
      </PortalCard>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <PaymentBanner />
      </Suspense>
      <PortalCard padding="none" className="overflow-hidden">
        <ul className="divide-y divide-[var(--admin-border-subtle)] md:hidden">
          {invoices.map((invoice) => {
            const canPay = isUnpaidClientInvoice(invoice.status);
            const projectTitle = Array.isArray(invoice.projects)
              ? invoice.projects[0]?.title
              : invoice.projects?.title ?? "—";

            return (
              <li
                key={invoice.id}
                className={cn("p-4", invoice.status === "overdue" && "bg-red-500/[0.04]")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--admin-text)]">{invoice.invoice_number}</p>
                    <p className="mt-1 truncate text-sm text-[var(--admin-text-muted)]">{projectTitle}</p>
                  </div>
                  <AdminStatusBadge status={invoice.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--admin-text-muted)]">Amount</p>
                    <p className="font-medium text-[var(--admin-gold-light)]">
                      ${Number(invoice.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-[var(--admin-text-muted)]">Due</p>
                    <p className="text-[var(--admin-text)]">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/portal/invoices/${invoice.id}/print`}
                    target="_blank"
                    className="inline-flex min-h-[44px] items-center text-sm text-[var(--admin-gold-light)] hover:underline"
                  >
                    Download summary
                  </Link>
                  {canPay && <InvoicePayButton invoiceId={invoice.id} stripeEnabled={stripeEnabled} />}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="admin-table-wrap hidden md:block">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due</th>
                <th>Paid</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const canPay = isUnpaidClientInvoice(invoice.status);
                const projectTitle = Array.isArray(invoice.projects)
                  ? invoice.projects[0]?.title
                  : invoice.projects?.title ?? "—";

                return (
                  <tr
                    key={invoice.id}
                    className={cn(invoice.status === "overdue" && "bg-red-500/[0.04]")}
                  >
                    <td className="font-medium text-[var(--admin-text)]">{invoice.invoice_number}</td>
                    <td className="text-[var(--admin-text-muted)]">{projectTitle}</td>
                    <td className="text-[var(--admin-gold-light)]">${Number(invoice.amount).toLocaleString()}</td>
                    <td>
                      <AdminStatusBadge status={invoice.status} />
                    </td>
                    <td className="text-[var(--admin-text-muted)]">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="text-[var(--admin-text-muted)]">
                      {invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          href={`/portal/invoices/${invoice.id}/print`}
                          target="_blank"
                          className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-gold-light)]"
                        >
                          Download summary
                        </Link>
                        {canPay && (
                          <InvoicePayButton invoiceId={invoice.id} stripeEnabled={stripeEnabled} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PortalCard>
    </>
  );
}
