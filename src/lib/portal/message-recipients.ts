import { getOwnerEmail } from "@/lib/auth";
import { getPrimaryRole, getRoleLabel, isStaffRole } from "@/lib/roles";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type PortalMessageRecipient = {
  id: string;
  full_name: string | null;
  email: string;
  label: string;
  is_default: boolean;
};

function recipientLabel(profile: {
  full_name: string | null;
  email: string;
  role?: string | null;
  roles?: string[] | null;
}) {
  const name = profile.full_name?.trim() || profile.email.split("@")[0] || "Team member";
  const roleLabel = getRoleLabel(getPrimaryRole(profile) ?? profile.role ?? "admin");
  return `${name} · ${roleLabel}`;
}

export async function getPortalMessageRecipients(): Promise<PortalMessageRecipient[]> {
  const admin = createServiceRoleClient();
  if (!admin) return [];

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, full_name, role, roles")
    .order("full_name", { ascending: true });

  const staff = (profiles ?? []).filter((profile) => isStaffRole(profile));
  if (staff.length === 0) return [];

  const ownerEmail = getOwnerEmail().toLowerCase();
  const defaultProfile =
    staff.find((profile) => profile.email.trim().toLowerCase() === ownerEmail) ?? staff[0];

  return staff.map((profile) => ({
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    label: recipientLabel(profile),
    is_default: profile.id === defaultProfile.id,
  }));
}

export async function resolveStaffRecipient(recipientId: string) {
  const admin = createServiceRoleClient();
  if (!admin) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, full_name, role, roles")
    .eq("id", recipientId)
    .maybeSingle();

  if (!profile || !isStaffRole(profile)) return null;
  return profile;
}
