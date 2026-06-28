"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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
        className="text-xs text-[var(--accent)] hover:underline"
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
        className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 min-h-[44px]"
      >
        {loading ? "Redirecting…" : "Pay now"}
      </button>
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}

function PaymentBanner() {
  const searchParams = useSearchParams();
  const paid = searchParams.get("paid");
  const cancelled = searchParams.get("cancelled");

  if (paid) {
    return (
      <div className="mb-6 rounded-xl border border-[var(--accent)]/30 bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--accent)]">
        Thank you — your payment is being processed. Invoice status will update shortly.
      </div>
    );
  }

  if (cancelled) {
    return (
      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
        Payment was cancelled. You can try again when ready.
      </div>
    );
  }

  return null;
}

export function PortalInvoiceList({ invoices, stripeEnabled }: Props) {
  if (invoices.length === 0) {
    return (
      <PortalCard padding="lg" className="text-center">
        <p className="text-white/60">No invoices yet.</p>
        <p className="mt-2 text-sm text-white/40">
          Invoices appear here when your project milestones are billed.
        </p>
        <Link href="/portal/messages" className="mt-4 inline-block text-sm text-[#a3c9a8] hover:underline">
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
        {/* Mobile card layout */}
        <ul className="divide-y divide-white/[0.06] md:hidden">
          {invoices.map((invoice) => {
            const canPay = isUnpaidClientInvoice(invoice.status);
            const projectTitle = Array.isArray(invoice.projects)
              ? invoice.projects[0]?.title
              : invoice.projects?.title ?? "—";

            return (
              <li
                key={invoice.id}
                className={cn(
                  "p-4",
                  invoice.status === "overdue" && "bg-red-500/[0.04]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{invoice.invoice_number}</p>
                    <p className="mt-1 truncate text-sm text-white/50">{projectTitle}</p>
                  </div>
                  <AdminStatusBadge status={invoice.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white/35">Amount</p>
                    <p className="font-medium text-white">${Number(invoice.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white/35">Due</p>
                    <p className="text-white/70">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/portal/invoices/${invoice.id}/print`}
                    target="_blank"
                    className="inline-flex min-h-[44px] items-center text-sm text-[var(--accent)] hover:underline"
                  >
                    Download summary
                  </Link>
                  {canPay && (
                    <InvoicePayButton invoiceId={invoice.id} stripeEnabled={stripeEnabled} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06] bg-white/[0.03]">
              <tr className="text-left text-white/45">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Due</th>
                <th className="px-5 py-3 font-medium">Paid</th>
                <th className="px-5 py-3 font-medium">Actions</th>
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
                    className={cn(
                      "border-t border-white/[0.06] text-white/80",
                      invoice.status === "overdue" && "bg-red-500/[0.04]",
                    )}
                  >
                    <td className="px-5 py-4 font-medium text-white">{invoice.invoice_number}</td>
                    <td className="px-5 py-4 text-white/55">{projectTitle}</td>
                    <td className="px-5 py-4">${Number(invoice.amount).toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <AdminStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-4">
                      {invoice.due_date
                        ? new Date(invoice.due_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {invoice.paid_at
                        ? new Date(invoice.paid_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          href={`/portal/invoices/${invoice.id}/print`}
                          target="_blank"
                          className="text-xs text-white/50 hover:text-[var(--accent)]"
                        >
                          Download summary
                        </Link>
                        {canPay && (
                          <InvoicePayButton
                            invoiceId={invoice.id}
                            stripeEnabled={stripeEnabled}
                          />
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
