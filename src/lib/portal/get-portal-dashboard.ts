import { createClient } from "@/lib/supabase/server";
import {
  filterClientInvoices,
  getPortalSenderName,
  isUnpaidClientInvoice,
} from "@/lib/portal/client-access";
import { getClientProjects } from "@/lib/portal/get-client-projects";

export type PortalDashboardData = {
  projects: Awaited<ReturnType<typeof getClientProjects>>["projects"];
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    unreadMessages: number;
    unpaidInvoices: number;
    totalInvoiceAmount: number;
  };
  recentMessages: {
    id: string;
    subject: string | null;
    content: string;
    read: boolean;
    created_at: string;
    senderName: string;
  }[];
  upcomingInvoices: {
    id: string;
    invoice_number: string;
    amount: number;
    status: string;
    due_date: string | null;
  }[];
};

export async function getPortalDashboard(userId: string): Promise<PortalDashboardData> {
  const supabase = await createClient();
  const { projects, stats, client } = await getClientProjects(userId);

  const emptyStats = {
    totalProjects: stats.total,
    activeProjects: stats.active,
    completedProjects: stats.completed,
    unreadMessages: 0,
    unpaidInvoices: 0,
    totalInvoiceAmount: 0,
  };

  if (!client) {
    return {
      projects,
      stats: emptyStats,
      recentMessages: [],
      upcomingInvoices: [],
    };
  }

  const [{ count: unreadMessages }, { data: recentMessages }, { data: invoices }] =
    await Promise.all([
      supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .eq("read", false),
      supabase
        .from("messages")
        .select("id, subject, content, read, created_at, sender:profiles!messages_sender_id_fkey(full_name)")
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("invoices")
        .select("id, invoice_number, amount, status, due_date")
        .eq("client_id", client.id)
        .in("status", ["sent", "overdue", "paid"])
        .order("due_date", { ascending: true }),
    ]);

  const visibleInvoices = filterClientInvoices(invoices ?? []);
  const unpaid = visibleInvoices.filter((inv) => isUnpaidClientInvoice(inv.status));

  return {
    projects,
    stats: {
      ...emptyStats,
      unreadMessages: unreadMessages ?? 0,
      unpaidInvoices: unpaid.length,
      totalInvoiceAmount: unpaid.reduce((sum, inv) => sum + Number(inv.amount ?? 0), 0),
    },
    recentMessages: (recentMessages ?? []).map((msg) => ({
      id: msg.id,
      subject: msg.subject,
      content: msg.content,
      read: msg.read,
      created_at: msg.created_at,
      senderName: getPortalSenderName(msg.sender),
    })),
    upcomingInvoices: visibleInvoices.slice(0, 5),
  };
}
