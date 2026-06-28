import type { SupabaseClient } from "@supabase/supabase-js";

export type PortalClient = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  profile_id: string | null;
};

/**
 * Resolve the client record for a portal user.
 * Matches by linked profile_id first, then by email (contact form lead conversion).
 * Auto-links profile_id when the client row was created from a lead before signup.
 */
export async function resolvePortalClient(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
): Promise<PortalClient | null> {
  const { data: byProfile } = await supabase
    .from("clients")
    .select("id, name, email, company, profile_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (byProfile) return byProfile;

  const email = userEmail.trim().toLowerCase();
  if (!email) return null;

  const { data: byEmail } = await supabase
    .from("clients")
    .select("id, name, email, company, profile_id")
    .ilike("email", email)
    .maybeSingle();

  if (!byEmail) return null;

  if (!byEmail.profile_id) {
    await supabase
      .from("clients")
      .update({ profile_id: userId })
      .eq("id", byEmail.id)
      .is("profile_id", null);
  }

  return { ...byEmail, profile_id: byEmail.profile_id ?? userId };
}
