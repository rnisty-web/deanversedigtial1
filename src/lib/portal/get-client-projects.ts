import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { getPortalLeadSummary } from "@/lib/portal/client-access";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";

export type ClientProject = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  deadline: string | null;
  created_at: string;
  request_type: string | null;
  request_summary: string | null;
};

const PROJECT_FIELDS =
  "id, title, description, status, deadline, created_at, lead_id, leads:lead_id(service_interest, message)";

export async function getClientProjects(userId: string, userEmail?: string) {
  const supabase = await createClient();

  let email = userEmail;
  if (!email) {
    const profile = await getProfile();
    email = profile?.email ?? "";
  }

  const client = await resolvePortalClient(supabase, userId, email);

  if (!client) {
    return { projects: [] as ClientProject[], stats: { total: 0, active: 0, completed: 0 }, client: null };
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select(PROJECT_FIELDS)
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  if (error) {
    const { data: fallback } = await supabase
      .from("projects")
      .select("id, title, description, status, deadline, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false });

    const all = (fallback ?? []).map((p) => ({
      ...p,
      request_type: null,
      request_summary: null,
    }));
    return buildResult(all, client);
  }

  const all = (projects ?? []).map((row) => {
    const lead = getPortalLeadSummary(row.leads);
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      deadline: row.deadline,
      created_at: row.created_at,
      request_type: lead?.service_interest ?? null,
      request_summary: lead?.message ?? null,
    };
  });

  return buildResult(all, client);
}

function buildResult(
  all: ClientProject[],
  client: { id: string; name: string; email: string },
) {
  const active = all.filter((p) => !["completed", "cancelled"].includes(p.status)).length;
  const completed = all.filter((p) => p.status === "completed").length;

  return {
    projects: all,
    stats: { total: all.length, active, completed },
    client,
  };
}
