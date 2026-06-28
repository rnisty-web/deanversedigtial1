import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";
import type { InvoiceLineItem } from "@/types";

const INVOICE_SELECT =
  "*, clients(id, name, email), projects(id, title)";

function computeLineItemsTotal(lineItems: InvoiceLineItem[]) {
  return lineItems.reduce((sum, item) => sum + (item.total ?? item.quantity * item.unit_price), 0);
}

function normalizeLineItems(raw: unknown): InvoiceLineItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = item as Partial<InvoiceLineItem>;
      const quantity = Number(row.quantity) || 1;
      const unitPrice = Number(row.unit_price) || 0;
      const total = Number(row.total) || quantity * unitPrice;
      return {
        description: String(row.description ?? ""),
        quantity,
        unit_price: unitPrice,
        total,
      };
    })
    .filter((item) => item.description.trim().length > 0);
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [{ data: invoices, error: invoiceError }, { data: clients }, { data: projects }] =
    await Promise.all([
      auth.supabase!
        .from("invoices")
        .select(INVOICE_SELECT)
        .order("created_at", { ascending: false }),
      auth.supabase!.from("clients").select("id, name, email").order("name"),
      auth.supabase!.from("projects").select("id, title, client_id").order("title"),
    ]);

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 });
  }

  return NextResponse.json({
    invoices: invoices ?? [],
    clients: clients ?? [],
    projects: projects ?? [],
  });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const {
    client_id,
    project_id,
    invoice_number,
    amount,
    status,
    due_date,
    paid_at,
    line_items,
    notes,
  } = body;

  if (!client_id || !invoice_number) {
    return NextResponse.json(
      { error: "Client and invoice number are required" },
      { status: 400 },
    );
  }

  const normalizedLineItems = normalizeLineItems(line_items);
  const resolvedAmount =
    amount !== undefined && amount !== ""
      ? parseFloat(String(amount))
      : computeLineItemsTotal(normalizedLineItems);

  const { data: invoice, error } = await auth.supabase!
    .from("invoices")
    .insert({
      client_id,
      project_id: project_id || null,
      invoice_number,
      amount: resolvedAmount || 0,
      status: status ?? "draft",
      due_date: due_date || null,
      paid_at: paid_at || null,
      line_items: normalizedLineItems,
      notes: notes ?? null,
    })
    .select(INVOICE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, line_items, amount, paid_at, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { ...rest };

  if (line_items !== undefined) {
    const normalizedLineItems = normalizeLineItems(line_items);
    updates.line_items = normalizedLineItems;
    if (amount === undefined || amount === "") {
      updates.amount = computeLineItemsTotal(normalizedLineItems);
    }
  }

  if (amount !== undefined && amount !== "") {
    updates.amount = parseFloat(String(amount));
  }

  if (paid_at !== undefined) {
    updates.paid_at = paid_at || null;
  }

  if (updates.status === "paid" && !updates.paid_at) {
    updates.paid_at = new Date().toISOString();
  }

  const { data: invoice, error } = await auth.supabase!
    .from("invoices")
    .update(updates)
    .eq("id", id)
    .select(INVOICE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invoice });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
  }

  const { error } = await auth.supabase!.from("invoices").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
