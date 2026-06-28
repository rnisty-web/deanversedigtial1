"use client";

import { useEffect } from "react";

type PrintInvoice = {
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  notes: string | null;
  line_items: unknown;
  projectTitle: string | null;
  clientName: string;
};

export function InvoicePrintView({ invoice }: { invoice: PrintInvoice }) {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  const lineItems = Array.isArray(invoice.line_items)
    ? (invoice.line_items as { description?: string; amount?: number; quantity?: number }[])
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-auto">
    <div className="invoice-print min-h-full bg-white p-8 text-[#0f1a17] print:p-0">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-[#6f8f72] px-4 py-2 text-sm font-medium text-white"
        >
          Print / Save as PDF
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="rounded-lg border border-[#0f1a17]/20 px-4 py-2 text-sm"
        >
          Close
        </button>
      </div>

      <header className="border-b border-[#0f1a17]/10 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6f8f72]">
          DeanVerse Digital
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Invoice {invoice.invoice_number}</h1>
        <p className="mt-1 text-sm text-[#0f1a17]/60">Prepared for {invoice.clientName}</p>
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0f1a17]/45">Status</p>
          <p className="mt-1 capitalize">{invoice.status.replace(/_/g, " ")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0f1a17]/45">Project</p>
          <p className="mt-1">{invoice.projectTitle ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0f1a17]/45">Issued</p>
          <p className="mt-1">{new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0f1a17]/45">Due date</p>
          <p className="mt-1">
            {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
          </p>
        </div>
      </section>

      {lineItems.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0f1a17]/45">
            Line items
          </h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-[#0f1a17]/10 text-left text-[#0f1a17]/55">
                <th className="py-2 font-medium">Description</th>
                <th className="py-2 font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className="border-b border-[#0f1a17]/5">
                  <td className="py-2">{item.description ?? "Item"}</td>
                  <td className="py-2">{item.quantity ?? 1}</td>
                  <td className="py-2 text-right">
                    ${Number(item.amount ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="mt-10 border-t border-[#0f1a17]/10 pt-6">
        <div className="flex items-end justify-between">
          <div>
            {invoice.paid_at && (
              <p className="text-sm text-[#6f8f72]">
                Paid on {new Date(invoice.paid_at).toLocaleDateString()}
              </p>
            )}
            {invoice.notes && (
              <p className="mt-2 max-w-md text-sm text-[#0f1a17]/60">{invoice.notes}</p>
            )}
          </div>
          <p className="text-2xl font-semibold">
            ${Number(invoice.amount).toLocaleString()}
          </p>
        </div>
      </section>

      <footer className="mt-16 text-xs text-[#0f1a17]/45">
        <p>DeanVerse Digital · adean2440@gmail.com · (619) 559-1008</p>
        <p className="mt-1">Thank you for your business.</p>
      </footer>
    </div>
    </div>
  );
}
