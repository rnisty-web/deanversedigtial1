import { createClient } from "@/lib/supabase/server";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";
import { filterClientInvoices, isUnpaidClientInvoice } from "@/lib/portal/client-access";
import type { WorkspaceSession } from "@/lib/workspace/session";

export type HomeProject = {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  client_name: string | null;
};

export type HomeInvoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  client_name: string;
};

export type HomeMessage = {
  id: string;
  subject: string;
  sender_name: string;
  read: boolean;
};

export type WorkspaceHomeData = {
  viewerName: string;
  unreadMessages: number;
  projects: {
    total: number;
    active: number;
    completed: number;
    statusCounts: Record<string, number>;
    upcoming: HomeProject[];
  } | null;
  invoices: {
    openCount: number;
    openAmount: number;
    paidTotal: number;
    recent: HomeInvoice[];
  } | null;
  leads: { total: number; newCount: number } | null;
  clientsCount: number | null;
  recentMessages: HomeMessage[];
  /** Client has no linked client record yet — nothing to scope queries to. */
  awaitingClientLink: boolean;
};

function displayName(profile: { full_name: string | null; email: string }) {
  return profile.full_name?.split(" ")[0] ?? profile.email.split("@")[0];
}

/**
 * Loads only the widgets the viewer is allowed to see, scoped to their data.
 * Staff get studio-wide figures; clients get their own client record's rows.
 */
export async function getWorkspaceHome(session: WorkspaceSession): Promise<WorkspaceHomeData> {
  const supabase = await createClient();
  const { profile, scope, can } = session;

  let clientId: string | null = null;
  if (scope === "own") {
    const client = await resolvePortalClient(supabase, profile.id, profile.email);
    clientId = client?.id ?? null;
  }

  const awaitingClientLink = scope === "own" && !clientId;
  const scoped = scope === "own";

  const base: WorkspaceHomeData = {
    viewerName: displayName(profile),
    unreadMessages: 0,
    projects: null,
    invoices: null,
    leads: null,
    clientsCount: null,
    recentMessages: [],
    awaitingClientLink,
  };

  // A client with no linked record has nothing to query against yet.
  if (awaitingClientLink) return base;

  const [unread, projectRows, invoiceRows, leadRows, clientCount, messageRows] = await Promise.all([
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("recipient_id", profile.id)
      .eq("read", false),

    can("projects", "view")
      ? (() => {
          const query = supabase
            .from("projects")
            .select("id, title, status, deadline, clients(name)")
            .order("created_at", { ascending: false });
          return scoped && clientId ? query.eq("client_id", clientId) : query;
        })()
      : Promise.resolve({ data: null }),

    can("invoices", "view")
      ? (() => {
          const query = supabase
            .from("invoices")
            .select("id, invoice_number, amount, status, created_at, clients(name)")
            .order("created_at", { ascending: false })
            .limit(50);
          return scoped && clientId
            ? query.eq("client_id", clientId).in("status", ["sent", "overdue", "paid"])
            : query;
        })()
      : Promise.resolve({ data: null }),

    can("leads", "view")
      ? supabase.from("leads").select("id, status")
      : Promise.resolve({ data: null }),

    can("clients", "view")
      ? supabase.from("clients").select("id", { count: "exact", head: true })
      : Promise.resolve({ count: null }),

    can("messages", "view")
      ? supabase
          .from("messages")
          .select(
            "id, subject, read, created_at, sender:profiles!messages_sender_id_fkey(full_name, email)",
          )
          .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: null }),
  ]);

  base.unreadMessages = unread.count ?? 0;

  if (projectRows.data) {
    const rows = projectRows.data as {
      id: string;
      title: string;
      status: string;
      deadline: string | null;
      clients: { name: string } | { name: string }[] | null;
    }[];

    const statusCounts: Record<string, number> = {};
    for (const row of rows) {
      statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
    }

    const clientName = (value: (typeof rows)[number]["clients"]) =>
      Array.isArray(value) ? (value[0]?.name ?? null) : (value?.name ?? null);

    base.projects = {
      total: rows.length,
      active: rows.filter((row) => !["completed", "cancelled"].includes(row.status)).length,
      completed: rows.filter((row) => row.status === "completed").length,
      statusCounts,
      upcoming: rows
        .filter((row) => row.deadline && !["completed", "cancelled"].includes(row.status))
        .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? ""))
        .slice(0, 5)
        .map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          deadline: row.deadline,
          client_name: clientName(row.clients),
        })),
    };
  }

  if (invoiceRows.data) {
    const rows = invoiceRows.data as {
      id: string;
      invoice_number: string;
      amount: number;
      status: string;
      clients: { name: string } | { name: string }[] | null;
    }[];

    // Clients only ever see invoices that have actually been issued.
    const visible = scoped ? filterClientInvoices(rows) : rows;
    const open = visible.filter((row) => isUnpaidClientInvoice(row.status));

    const clientName = (value: (typeof rows)[number]["clients"]) =>
      Array.isArray(value) ? (value[0]?.name ?? "—") : (value?.name ?? "—");

    base.invoices = {
      openCount: open.length,
      openAmount: open.reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
      paidTotal: visible
        .filter((row) => row.status === "paid")
        .reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
      recent: visible.slice(0, 5).map((row) => ({
        id: row.id,
        invoice_number: row.invoice_number,
        amount: Number(row.amount ?? 0),
        status: row.status,
        client_name: clientName(
          (row as { clients?: { name: string } | { name: string }[] | null }).clients ?? null,
        ),
      })),
    };
  }

  if (leadRows.data) {
    const rows = leadRows.data as { id: string; status: string }[];
    base.leads = {
      total: rows.length,
      newCount: rows.filter((row) => row.status === "new").length,
    };
  }

  if (typeof clientCount.count === "number") {
    base.clientsCount = clientCount.count;
  }

  if (messageRows.data) {
    const rows = messageRows.data as {
      id: string;
      subject: string | null;
      read: boolean;
      sender: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
    }[];

    base.recentMessages = rows.map((row) => {
      const sender = Array.isArray(row.sender) ? row.sender[0] : row.sender;
      return {
        id: row.id,
        subject: row.subject ?? "No subject",
        sender_name: sender?.full_name ?? sender?.email?.split("@")[0] ?? "Unknown",
        read: row.read,
      };
    });
  }

  return base;
}
