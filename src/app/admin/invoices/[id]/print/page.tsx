import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InvoicePrintView } from "@/components/portal/InvoicePrintView";

export default async function AdminInvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, amount, status, due_date, paid_at, created_at, notes, line_items, clients(name), projects(title)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!invoice) notFound();

  const clientRow = invoice.clients as { name: string } | { name: string }[] | null;
  const clientName = Array.isArray(clientRow) ? clientRow[0]?.name ?? "Client" : clientRow?.name ?? "Client";
  const projectRow = invoice.projects as { title: string } | { title: string }[] | null;
  const projectTitle = Array.isArray(projectRow) ? projectRow[0]?.title ?? null : projectRow?.title ?? null;

  return (
    <InvoicePrintView
      invoice={{
        invoice_number: invoice.invoice_number,
        amount: Number(invoice.amount),
        status: invoice.status,
        due_date: invoice.due_date,
        paid_at: invoice.paid_at,
        created_at: invoice.created_at,
        notes: invoice.notes,
        line_items: invoice.line_items,
        projectTitle,
        clientName,
      }}
    />
  );
}
