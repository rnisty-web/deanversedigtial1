import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { filterClientInvoices, isClientVisibleInvoice } from "@/lib/portal/client-access";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";
import { InvoicePrintView } from "@/components/portal/InvoicePrintView";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuth();
  const supabase = await createClient();
  const client = await resolvePortalClient(supabase, profile.id, profile.email);

  if (!client) notFound();

  const { data: invoice } = await supabase
    .from("invoices")
    .select(
      "id, invoice_number, amount, status, due_date, paid_at, created_at, notes, line_items, projects(title)",
    )
    .eq("id", id)
    .eq("client_id", client.id)
    .maybeSingle();

  if (!invoice || !isClientVisibleInvoice(invoice.status)) {
    notFound();
  }

  const visible = filterClientInvoices([invoice])[0];
  if (!visible) notFound();

  const projectRow = invoice.projects as { title: string } | { title: string }[] | null;
  const projectTitle = Array.isArray(projectRow)
    ? projectRow[0]?.title ?? null
    : projectRow?.title ?? null;

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
        clientName: client.name,
      }}
    />
  );
}
