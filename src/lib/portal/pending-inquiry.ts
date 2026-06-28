import { createClient } from "@/lib/supabase/server";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";

export type PendingInquiryState = {
  isPending: boolean;
  hasLead: boolean;
  hasClient: boolean;
};

/**
 * True when the portal user has no active project workspace yet —
 * e.g. signed up after a contact form inquiry but work hasn't started.
 */
export async function getPendingInquiryState(
  userId: string,
  userEmail: string,
): Promise<PendingInquiryState> {
  const supabase = await createClient();
  const client = await resolvePortalClient(supabase, userId, userEmail);

  if (client) {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("client_id", client.id);

    if ((count ?? 0) > 0) {
      return { isPending: false, hasLead: false, hasClient: true };
    }
  }

  const email = userEmail.trim().toLowerCase();
  let hasLead = false;

  if (email) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .ilike("email", email)
      .not("status", "eq", "converted")
      .not("status", "eq", "lost")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    hasLead = !!lead;
  }

  return {
    isPending: true,
    hasLead,
    hasClient: !!client,
  };
}
