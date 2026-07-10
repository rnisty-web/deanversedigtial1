import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { parseUserRoles, type UserRole } from "@/lib/roles";
import { parseAdminPermissions, type AdminPermission } from "@/lib/roles/permissions";
import { parseClientPermissions, type ClientPermission } from "@/lib/roles/client-permissions";

export const ADMIN_USER_SELECT_WITH_PRESENCE =
  "id, email, full_name, role, roles, admin_permissions, client_permissions, company, phone, avatar_url, created_at, last_seen_at, activity_status";

export const ADMIN_USER_SELECT_BASE =
  "id, email, full_name, role, company, phone, avatar_url, created_at";

export const DASHBOARD_PROFILE_SELECT_WITH_PRESENCE =
  "id, email, full_name, role, roles, last_seen_at, activity_status";

export const DASHBOARD_PROFILE_SELECT_BASE = "id, email, full_name, role";

type ProfileRow = Record<string, unknown> & {
  role?: UserRole | string | null;
  roles?: UserRole[] | string[] | null;
};

export function isMissingColumnError(
  error: PostgrestError | null,
  column: string,
): boolean {
  if (!error?.message) return false;
  const msg = error.message.toLowerCase();
  return msg.includes(column.toLowerCase()) && msg.includes("does not exist");
}

export function isMissingLastSeenColumnError(error: PostgrestError | null): boolean {
  return isMissingColumnError(error, "last_seen_at");
}

export function isMissingActivityStatusColumnError(error: PostgrestError | null): boolean {
  return isMissingColumnError(error, "activity_status");
}

export function isMissingRolesColumnError(error: PostgrestError | null): boolean {
  return isMissingColumnError(error, "roles");
}

export function isMissingAdminPermissionsColumnError(error: PostgrestError | null): boolean {
  return isMissingColumnError(error, "admin_permissions");
}

export function isMissingClientPermissionsColumnError(error: PostgrestError | null): boolean {
  return isMissingColumnError(error, "client_permissions");
}

function isMissingOptionalPermissionColumnError(error: PostgrestError | null): boolean {
  return (
    isMissingAdminPermissionsColumnError(error) || isMissingClientPermissionsColumnError(error)
  );
}

function stripMissingPermissionColumns(select: string, error: PostgrestError | null): string {
  let next = select;
  if (isMissingAdminPermissionsColumnError(error)) {
    next = next.replace(", admin_permissions", "");
  }
  if (isMissingClientPermissionsColumnError(error)) {
    next = next.replace(", client_permissions", "");
  }
  return next;
}

function withPermissionDefaults<T extends Record<string, unknown>>(
  rows: T[],
): (T & { admin_permissions: AdminPermission[] | null; client_permissions: ClientPermission[] | null })[] {
  return rows.map((row) => ({
    ...row,
    admin_permissions:
      row.admin_permissions === undefined || row.admin_permissions === null
        ? null
        : parseAdminPermissions(row.admin_permissions),
    client_permissions:
      row.client_permissions === undefined || row.client_permissions === null
        ? null
        : parseClientPermissions(row.client_permissions),
  }));
}

function withPermissionDefaultsSingle<T extends Record<string, unknown>>(
  row: T | null,
): (T & { admin_permissions: AdminPermission[] | null; client_permissions: ClientPermission[] | null }) | null {
  if (!row) return null;
  return {
    ...row,
    admin_permissions:
      row.admin_permissions === undefined || row.admin_permissions === null
        ? null
        : parseAdminPermissions(row.admin_permissions),
    client_permissions:
      row.client_permissions === undefined || row.client_permissions === null
        ? null
        : parseClientPermissions(row.client_permissions),
  };
}

function withRolesDefaults<T extends ProfileRow>(
  rows: T[],
): (T & { roles: UserRole[]; admin_permissions: AdminPermission[] | null; client_permissions: ClientPermission[] | null })[] {
  return withPermissionDefaults(withRolesDefaultsOnly(rows));
}

function withRolesDefaultsOnly<T extends ProfileRow>(
  rows: T[],
): (T & { roles: UserRole[] })[] {
  return rows.map((row) => ({
    ...row,
    roles: parseUserRoles(row),
  }));
}

function withRolesDefault<T extends ProfileRow>(
  row: T | null,
): (T & { roles: UserRole[]; admin_permissions: AdminPermission[] | null; client_permissions: ClientPermission[] | null }) | null {
  if (!row) return null;
  return withPermissionDefaultsSingle(withRolesDefaultOnly(row));
}

function withRolesDefaultOnly<T extends ProfileRow>(
  row: T | null,
): (T & { roles: UserRole[] }) | null {
  if (!row) return null;
  return {
    ...row,
    roles: parseUserRoles(row),
  };
}

function withPresenceDefaults<T extends Record<string, unknown>>(
  rows: T[],
): (T & { last_seen_at: null; activity_status: string | null })[] {
  return rows.map((row) => ({
    ...row,
    last_seen_at: null,
    activity_status: null,
  }));
}

type ProfilesClient = SupabaseClient;

export async function fetchAdminUsers(supabase: ProfilesClient) {
  const withPresence = await supabase
    .from("profiles")
    .select(ADMIN_USER_SELECT_WITH_PRESENCE)
    .order("created_at", { ascending: false });

  if (!withPresence.error) {
    return {
      data: withRolesDefaults(withPresence.data ?? []),
      error: null as PostgrestError | null,
    };
  }

  if (
    !isMissingLastSeenColumnError(withPresence.error) &&
    !isMissingActivityStatusColumnError(withPresence.error) &&
    !isMissingRolesColumnError(withPresence.error) &&
    !isMissingOptionalPermissionColumnError(withPresence.error)
  ) {
    return { data: null, error: withPresence.error };
  }

  if (isMissingOptionalPermissionColumnError(withPresence.error)) {
    const withoutPermissions = await supabase
      .from("profiles")
      .select(stripMissingPermissionColumns(ADMIN_USER_SELECT_WITH_PRESENCE, withPresence.error))
      .order("created_at", { ascending: false });

    if (!withoutPermissions.error) {
      return {
        data: withRolesDefaults((withoutPermissions.data ?? []) as unknown as ProfileRow[]),
        error: null as PostgrestError | null,
      };
    }
  }

  const fallback = await supabase
    .from("profiles")
    .select(ADMIN_USER_SELECT_BASE)
    .order("created_at", { ascending: false });

  if (fallback.error) {
    return { data: null, error: fallback.error };
  }

  return {
    data: withRolesDefaults(withPresenceDefaults(fallback.data ?? [])),
    error: null as PostgrestError | null,
  };
}

export async function fetchAdminUserById(supabase: ProfilesClient, id: string) {
  const withPresence = await supabase
    .from("profiles")
    .select(ADMIN_USER_SELECT_WITH_PRESENCE)
    .eq("id", id)
    .single();

  if (!withPresence.error) {
    return {
      data: withRolesDefault(withPresence.data),
      error: null as PostgrestError | null,
    };
  }

  if (
    !isMissingLastSeenColumnError(withPresence.error) &&
    !isMissingActivityStatusColumnError(withPresence.error) &&
    !isMissingRolesColumnError(withPresence.error) &&
    !isMissingOptionalPermissionColumnError(withPresence.error)
  ) {
    return { data: null, error: withPresence.error };
  }

  if (isMissingOptionalPermissionColumnError(withPresence.error)) {
    const withoutPermissions = await supabase
      .from("profiles")
      .select(stripMissingPermissionColumns(ADMIN_USER_SELECT_WITH_PRESENCE, withPresence.error))
      .eq("id", id)
      .single();

    if (!withoutPermissions.error) {
      return {
        data: withRolesDefault(withoutPermissions.data as unknown as ProfileRow | null),
        error: null as PostgrestError | null,
      };
    }
  }

  const fallback = await supabase
    .from("profiles")
    .select(ADMIN_USER_SELECT_BASE)
    .eq("id", id)
    .single();

  if (fallback.error) {
    return { data: null, error: fallback.error };
  }

  return {
    data: withRolesDefault(
      fallback.data
        ? { ...fallback.data, last_seen_at: null, activity_status: null }
        : null,
    ),
    error: null as PostgrestError | null,
  };
}

export async function fetchDashboardProfiles(supabase: ProfilesClient) {
  const withPresence = await supabase
    .from("profiles")
    .select(DASHBOARD_PROFILE_SELECT_WITH_PRESENCE)
    .order("last_seen_at", { ascending: false, nullsFirst: false });

  if (!withPresence.error) {
    return {
      data: withRolesDefaults(withPresence.data ?? []),
      error: null as PostgrestError | null,
      presenceReady: true,
    };
  }

  if (
    !isMissingLastSeenColumnError(withPresence.error) &&
    !isMissingActivityStatusColumnError(withPresence.error) &&
    !isMissingRolesColumnError(withPresence.error)
  ) {
    return { data: null, error: withPresence.error, presenceReady: false };
  }

  const fallback = await supabase
    .from("profiles")
    .select(DASHBOARD_PROFILE_SELECT_BASE)
    .order("created_at", { ascending: false });

  if (fallback.error) {
    return { data: null, error: fallback.error, presenceReady: false };
  }

  return {
    data: withRolesDefaults(withPresenceDefaults(fallback.data ?? [])),
    error: null as PostgrestError | null,
    presenceReady: false,
  };
}

export async function fetchCurrentProfilePresenceFields(
  supabase: ProfilesClient,
  userId: string,
) {
  const withPresence = await supabase
    .from("profiles")
    .select("role, roles, email, activity_status")
    .eq("id", userId)
    .single();

  if (!withPresence.error && withPresence.data) {
    return {
      data: withRolesDefault(withPresence.data),
      error: null as PostgrestError | null,
      presenceReady: true,
    };
  }

  if (
    withPresence.error &&
    !isMissingActivityStatusColumnError(withPresence.error) &&
    !isMissingRolesColumnError(withPresence.error)
  ) {
    return { data: null, error: withPresence.error, presenceReady: false };
  }

  const fallback = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", userId)
    .single();

  if (fallback.error || !fallback.data) {
    return { data: null, error: fallback.error, presenceReady: false };
  }

  return {
    data: withRolesDefault({ ...fallback.data, activity_status: null }),
    error: null as PostgrestError | null,
    presenceReady: false,
  };
}

export async function updateProfileLastSeen(
  supabase: ProfilesClient,
  userId: string,
): Promise<{
  ok: boolean;
  last_seen_at: string | null;
  presenceReady: boolean;
  error: PostgrestError | null;
}> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("profiles")
    .update({ last_seen_at: now })
    .eq("id", userId);

  if (!error) {
    return { ok: true, last_seen_at: now, presenceReady: true, error: null };
  }

  if (isMissingLastSeenColumnError(error)) {
    return { ok: false, last_seen_at: null, presenceReady: false, error: null };
  }

  return { ok: false, last_seen_at: null, presenceReady: true, error };
}

export async function updateProfileActivityStatus(
  supabase: ProfilesClient,
  userId: string,
  activityStatus: string,
): Promise<{
  ok: boolean;
  activity_status: string | null;
  activityStatusReady: boolean;
  error: PostgrestError | null;
}> {
  const { error } = await supabase
    .from("profiles")
    .update({ activity_status: activityStatus })
    .eq("id", userId);

  if (!error) {
    return {
      ok: true,
      activity_status: activityStatus,
      activityStatusReady: true,
      error: null,
    };
  }

  if (isMissingActivityStatusColumnError(error)) {
    return {
      ok: false,
      activity_status: null,
      activityStatusReady: false,
      error: null,
    };
  }

  return { ok: false, activity_status: null, activityStatusReady: true, error };
}
