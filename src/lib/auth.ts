import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/service";
import { siteConfig } from "@/lib/constants";
import { isFounderRole, isStaffRole, isCustomerRole, parseUserRoles, type UserRole } from "@/lib/roles";
import { getCachedRoleCatalog } from "@/lib/roles/catalog-server";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  roles?: UserRole[] | null;
  company: string | null;
  phone: string | null;
  last_seen_at: string | null;
  activity_status: string | null;
  created_at: string;
  updated_at: string;
};

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  let { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    try {
      await ensureUserProfile(user);
    } catch {
      return null;
    }

    const retry = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    data = retry.data;
  }

  return data ? ({ ...data, roles: parseUserRoles(data) } as Profile) : null;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getProfile();
  const catalog = await getCachedRoleCatalog();
  if (!profile || !isStaffRole(profile, catalog)) {
    redirect("/login?redirectTo=/admin");
  }
  return profile;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login?redirectTo=/portal");
  }
  return profile;
}

/** Client portal — customers only; staff are sent to the admin portal. */
export async function requireCustomer(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login?redirectTo=/portal");
  }
  if (!isCustomerRole(profile)) {
    redirect("/admin");
  }
  return profile;
}

export function getOwnerEmail(): string {
  const configured =
    process.env.ADMIN_OWNER_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    siteConfig.email;
  return configured.toLowerCase();
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  return !!email && email.trim().toLowerCase() === getOwnerEmail();
}

/** Founder = admin role or configured owner email (either auth or profile email). */
export function isFounder(
  role:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
  email?: string | null,
  authEmail?: string | null,
): boolean {
  if (isFounderRole(role)) return true;
  if (isOwnerEmail(email)) return true;
  if (authEmail && isOwnerEmail(authEmail)) return true;
  return false;
}

/** Staff who can access the admin portal may manage other users (founder row stays protected). */
export function canManageUsers(
  role:
    | UserRole
    | UserRole[]
    | string
    | { role?: UserRole | string | null; roles?: UserRole[] | string[] | null }
    | null
    | undefined,
  profileEmail?: string | null,
  authEmail?: string | null,
): boolean {
  if (isFounder(role, profileEmail, authEmail)) return true;
  return isStaffRole(role);
}

export async function verifyOwnerApi() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return {
      error: auth.error,
      status: auth.status,
      supabase: null,
      user: null,
      profile: null as Profile | null,
    };
  }

  const { data: profile } = await auth.supabase!
    .from("profiles")
    .select("*")
    .eq("id", auth.user!.id)
    .single();

  if (
    !profile ||
    !isFounder(profile, profile.email, auth.user!.email)
  ) {
    return {
      error: "Only the founder can perform this action",
      status: 403 as const,
      supabase: null,
      user: null,
      profile: null as Profile | null,
    };
  }

  return {
    supabase: auth.supabase,
    user: auth.user,
    profile: profile as Profile,
    error: null,
    status: 200 as const,
  };
}

export async function verifyUserManagementApi() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return {
      error: auth.error,
      status: auth.status,
      supabase: null,
      user: null,
      profile: null as Profile | null,
    };
  }

  const { data: profile } = await auth.supabase!
    .from("profiles")
    .select("*")
    .eq("id", auth.user!.id)
    .single();

  if (!profile || !canManageUsers(profile, profile.email, auth.user!.email)) {
    return {
      error: "You do not have permission to manage users",
      status: 403 as const,
      supabase: null,
      user: null,
      profile: null as Profile | null,
    };
  }

  return {
    supabase: auth.supabase,
    user: auth.user,
    profile: profile as Profile,
    error: null,
    status: 200 as const,
  };
}

export async function verifyAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 as const, supabase: null, user: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, roles")
    .eq("id", user.id)
    .single();

  const catalog = await getCachedRoleCatalog();

  if (!profile || !isStaffRole(profile, catalog)) {
    return { error: "Forbidden", status: 403 as const, supabase: null, user: null };
  }

  return { supabase, user, profile, error: null, status: 200 as const };
}

export async function verifyAuthApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 as const, supabase: null, user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { error: "Profile not found", status: 404 as const, supabase: null, user: null, profile: null };
  }

  return { supabase, user, profile, error: null, status: 200 as const };
}

export async function verifyCustomerApi() {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return {
      error: auth.error,
      status: auth.status,
      supabase: null,
      user: null,
      profile: null as Profile | null,
    };
  }

  if (!isCustomerRole(auth.profile!)) {
    return {
      error: "Forbidden",
      status: 403 as const,
      supabase: null,
      user: null,
      profile: null as Profile | null,
    };
  }

  return auth;
}
