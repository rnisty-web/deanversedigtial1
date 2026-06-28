import { createClient } from "@/lib/supabase/server";
import {
  filterClientInvoices,
  isUnpaidClientInvoice,
} from "@/lib/portal/client-access";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";

export type PortalNotifications = {
  unreadMessages: number;
  unpaidInvoices: number;
  overdueInvoices: number;
};

export async function getPortalNotifications(
  userId: string,
  userEmail: string,
): Promise<PortalNotifications> {
  const empty: PortalNotifications = {
    unreadMessages: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
  };

  const supabase = await createClient();
  const client = await resolvePortalClient(supabase, userId, userEmail);

  const [{ count: unreadMessages }, invoiceCounts] = await Promise.all([
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .eq("read", false),
    client
      ? supabase
          .from("invoices")
          .select("status")
          .eq("client_id", client.id)
          .in("status", ["sent", "overdue", "paid"])
      : Promise.resolve({ data: [] as { status: string }[] }),
  ]);

  const invoices = filterClientInvoices(invoiceCounts.data ?? []);
  const unpaid = invoices.filter((inv) => isUnpaidClientInvoice(inv.status));
  const overdue = invoices.filter((inv) => inv.status === "overdue");

  return {
    unreadMessages: unreadMessages ?? 0,
    unpaidInvoices: unpaid.length,
    overdueInvoices: overdue.length,
  };
}
