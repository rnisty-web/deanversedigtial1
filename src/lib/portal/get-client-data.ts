import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import {
  filterClientInvoices,
  getPortalSenderName,
  isUnpaidClientInvoice,
} from "@/lib/portal/client-access";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";

export type ClientInvoice = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  project_id: string | null;
  created_at: string;
  projects?: { title: string } | { title: string }[] | null;
};

async function getPortalClient(userId: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  return resolvePortalClient(supabase, userId, profile?.email ?? "");
}

export async function getClientInvoices(userId: string) {
  const supabase = await createClient();
  const client = await getPortalClient(userId);

  if (!client) {
    return { invoices: [] as ClientInvoice[], stats: { total: 0, unpaid: 0, paid: 0, overdue: 0 } };
  }

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, status, due_date, paid_at, project_id, created_at, projects(title)")
    .eq("client_id", client.id)
    .in("status", ["sent", "overdue", "paid"])
    .order("created_at", { ascending: false });

  const all = filterClientInvoices(invoices ?? []);
  const unpaid = all.filter((i) => isUnpaidClientInvoice(i.status)).length;
  const paid = all.filter((i) => i.status === "paid").length;
  const overdue = all.filter((i) => i.status === "overdue").length;

  return {
    invoices: all as ClientInvoice[],
    stats: { total: all.length, unpaid, paid, overdue },
  };
}

type ProjectDetailRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  deadline: string | null;
  created_at: string;
  client_id: string;
  lead_id?: string | null;
  leads?: { service_interest: string | null; message: string | null } | null;
};

export async function getProjectDetail(userId: string, projectId: string) {
  const supabase = await createClient();
  const client = await getPortalClient(userId);

  if (!client) return null;

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, title, description, status, deadline, created_at, client_id, lead_id, leads:lead_id(service_interest, message)",
    )
    .eq("id", projectId)
    .eq("client_id", client.id)
    .maybeSingle();

  let resolvedProject: ProjectDetailRow | null = project as ProjectDetailRow | null;

  if (projectError || !project) {
    const { data: fallback } = await supabase
      .from("projects")
      .select("id, title, description, status, deadline, created_at, client_id")
      .eq("id", projectId)
      .eq("client_id", client.id)
      .maybeSingle();

    if (!fallback) return null;
    resolvedProject = { ...fallback, lead_id: null, leads: null };
  }

  if (!resolvedProject) return null;

  const lead = resolvedProject.leads ?? null;

  const [{ data: files }, { data: messages }, { data: invoices }] = await Promise.all([
    supabase
      .from("files")
      .select("id, name, file_size, mime_type, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }),
    supabase
      .from("messages")
      .select("id, subject, content, read, created_at, sender:profiles!messages_sender_id_fkey(full_name)")
      .eq("project_id", projectId)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, status, due_date, paid_at")
      .eq("project_id", projectId)
      .in("status", ["sent", "overdue", "paid"])
      .order("created_at", { ascending: false }),
  ]);

  return {
    project: {
      id: resolvedProject.id,
      title: resolvedProject.title,
      description: resolvedProject.description,
      status: resolvedProject.status,
      deadline: resolvedProject.deadline,
      created_at: resolvedProject.created_at,
      client_id: resolvedProject.client_id,
      request_type: lead?.service_interest ?? null,
      request_summary: lead?.message ?? null,
    },
    files: files ?? [],
    messages: (messages ?? []).map((msg) => ({
      ...msg,
      sender: {
        full_name: getPortalSenderName(msg.sender),
      },
    })),
    invoices: filterClientInvoices(invoices ?? []),
  };
}
