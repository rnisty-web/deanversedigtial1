import { NextResponse } from "next/server";
import { verifyAuthApi } from "@/lib/auth";
import { isUnpaidClientInvoice } from "@/lib/portal/client-access";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";
import { createInvoiceCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { siteConfig } from "@/lib/constants";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Online payments are not available. Please contact us to pay." },
      { status: 503 },
    );
  }

  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { invoice_id: invoiceId } = body as { invoice_id?: string };

  if (!invoiceId) {
    return NextResponse.json({ error: "invoice_id is required" }, { status: 400 });
  }

  const client = await resolvePortalClient(
    auth.supabase!,
    auth.user!.id,
    auth.user!.email ?? auth.profile!.email ?? "",
  );

  if (!client) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const { data: invoice, error } = await auth.supabase!
    .from("invoices")
    .select("id, invoice_number, amount, status, client_id")
    .eq("id", invoiceId)
    .eq("client_id", client.id)
    .maybeSingle();

  if (error || !invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (!isUnpaidClientInvoice(invoice.status)) {
    return NextResponse.json({ error: "This invoice is already paid" }, { status: 400 });
  }

  const amountCents = Math.round(Number(invoice.amount) * 100);
  if (amountCents <= 0) {
    return NextResponse.json({ error: "Invalid invoice amount" }, { status: 400 });
  }

  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const session = await createInvoiceCheckoutSession({
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoice_number,
    amountCents,
    customerEmail: auth.user!.email ?? client.email,
    successUrl: `${baseUrl}/portal/invoices?paid=${invoice.id}`,
    cancelUrl: `${baseUrl}/portal/invoices?cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
