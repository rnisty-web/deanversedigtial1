/** Invoice statuses visible to clients in the portal (drafts are internal). */
export const CLIENT_VISIBLE_INVOICE_STATUSES = ["sent", "overdue", "paid"] as const;

export type ClientVisibleInvoiceStatus = (typeof CLIENT_VISIBLE_INVOICE_STATUSES)[number];

export function isClientVisibleInvoice(status: string): boolean {
  return CLIENT_VISIBLE_INVOICE_STATUSES.includes(
    status as ClientVisibleInvoiceStatus,
  );
}

export function filterClientInvoices<T extends { status: string }>(invoices: T[]): T[] {
  return invoices.filter((inv) => isClientVisibleInvoice(inv.status));
}

export function isUnpaidClientInvoice(status: string): boolean {
  return status === "sent" || status === "overdue";
}

type ProfileNameRow = { full_name: string | null };

type LeadSummaryRow = { service_interest: string | null; message: string | null };

/** Supabase profile joins may return an object or a one-item array. */
export function getPortalSenderName(
  sender: ProfileNameRow | ProfileNameRow[] | null | undefined,
  fallback = "Your project team",
): string {
  const profile = Array.isArray(sender) ? sender[0] : sender;
  return profile?.full_name?.trim() || fallback;
}

/** Supabase lead joins may return an object or a one-item array. */
export function getPortalLeadSummary(
  lead: LeadSummaryRow | LeadSummaryRow[] | null | undefined,
): LeadSummaryRow | null {
  if (!lead) return null;
  return Array.isArray(lead) ? (lead[0] ?? null) : lead;
}
