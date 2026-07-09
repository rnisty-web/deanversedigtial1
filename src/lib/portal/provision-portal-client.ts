import { createServiceRoleClient } from "@/lib/supabase/server";
import type { PortalClient } from "@/lib/portal/resolve-portal-client";

type ProvisionInput = {
  userId: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  company?: string | null;
};

const CLIENT_SELECT = "id, name, email, company, profile_id";

function displayName(email: string, fullName?: string | null) {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;
  const prefix = email.split("@")[0]?.trim();
  if (!prefix) return "Client";
  return prefix.charAt(0).toUpperCase() + prefix.slice(1);
}

/**
 * Ensures every portal user has a linked `clients` row (service role).
 * Links existing rows by email (from contact form / lead conversion) or creates a new one.
 */
export async function ensurePortalClient(input: ProvisionInput): Promise<PortalClient | null> {
  const admin = createServiceRoleClient();
  if (!admin) return null;

  const email = input.email.trim();
  const normalizedEmail = email.toLowerCase();
  if (!normalizedEmail) return null;

  const { data: byProfile } = await admin
    .from("clients")
    .select(CLIENT_SELECT)
    .eq("profile_id", input.userId)
    .maybeSingle();

  if (byProfile) return byProfile;

  const { data: byEmail } = await admin
    .from("clients")
    .select(CLIENT_SELECT)
    .ilike("email", normalizedEmail)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (byEmail) {
    const updates: Record<string, unknown> = { profile_id: input.userId };
    if (!byEmail.profile_id) {
      if (input.phone) updates.phone = input.phone;
      if (input.company) updates.company = input.company;
    }

    const { data: linked, error } = await admin
      .from("clients")
      .update(updates)
      .eq("id", byEmail.id)
      .select(CLIENT_SELECT)
      .single();

    if (error) return { ...byEmail, profile_id: input.userId };
    return linked;
  }

  const { data: created, error } = await admin
    .from("clients")
    .insert({
      profile_id: input.userId,
      name: displayName(email, input.fullName),
      email,
      phone: input.phone?.trim() || null,
      company: input.company?.trim() || null,
      status: "active",
    })
    .select(CLIENT_SELECT)
    .single();

  if (error) return null;
  return created;
}

/**
 * Creates or updates a dormant client row when someone submits the contact form.
 */
export async function upsertClientFromLead(input: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}): Promise<void> {
  const admin = createServiceRoleClient();
  if (!admin) return;

  const email = input.email.trim();
  const normalizedEmail = email.toLowerCase();
  if (!normalizedEmail) return;

  const { data: existing } = await admin
    .from("clients")
    .select("id, profile_id")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (existing) {
    if (!existing.profile_id) {
      await admin
        .from("clients")
        .update({
          name: input.name.trim(),
          phone: input.phone?.trim() || null,
          company: input.company?.trim() || null,
        })
        .eq("id", existing.id);
    }
    return;
  }

  await admin.from("clients").insert({
    name: input.name.trim(),
    email,
    phone: input.phone?.trim() || null,
    company: input.company?.trim() || null,
    status: "active",
    profile_id: null,
  });
}
