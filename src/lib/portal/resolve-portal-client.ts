import type { SupabaseClient } from "@supabase/supabase-js";
import { ensurePortalClient } from "@/lib/portal/provision-portal-client";

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
  options?: {
    fullName?: string | null;
    phone?: string | null;
    company?: string | null;
    allowProvision?: boolean;
  },
): Promise<PortalClient | null> {
  const resolved = await resolvePortalClientInternal(supabase, userId, userEmail, options);
  if (resolved) return resolved;

  if (options?.allowProvision === false) return null;

  await ensurePortalClient({
    userId,
    email: userEmail,
    fullName: options?.fullName,
    phone: options?.phone,
    company: options?.company,
  });

  return resolvePortalClientInternal(supabase, userId, userEmail, options);
}

async function resolvePortalClientInternal(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string,
  options?: { allowProvision?: boolean },
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

  if (byEmail.profile_id && byEmail.profile_id !== userId) {
    return null;
  }

  if (!byEmail.profile_id) {
    if (options?.allowProvision === false) {
      return { ...byEmail, profile_id: null };
    }

    await ensurePortalClient({
      userId,
      email: userEmail,
    });

    const { data: linked } = await supabase
      .from("clients")
      .select("id, name, email, company, profile_id")
      .eq("profile_id", userId)
      .maybeSingle();

    if (linked) return linked;

    return { ...byEmail, profile_id: userId };
  }

  return byEmail;
}
