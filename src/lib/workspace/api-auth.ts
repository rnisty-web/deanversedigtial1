import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isFounder, type Profile } from "@/lib/auth";
import { isStaffRole, parseUserRoles } from "@/lib/roles";
import type { RoleDefinition } from "@/lib/roles/catalog";
import { getRoleCatalogSafe } from "@/lib/roles/catalog-server";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";
import {
  getDataScope,
  getEffectiveWorkspacePermissions,
  permissionKey,
  type DataScope,
} from "@/lib/workspace/permissions";
import type { WorkspaceAction, WorkspaceModuleId } from "@/lib/workspace/modules";

type Failure = {
  error: string;
  status: 401 | 403 | 404;
  supabase: null;
  user: null;
  profile: null;
  scope: null;
  clientId: null;
  roleCatalog: null;
  isFounder: false;
  can: () => false;
};

type Success = {
  error: null;
  status: 200;
  supabase: SupabaseClient;
  user: User;
  profile: Profile;
  roleCatalog: RoleDefinition[];
  isFounder: boolean;
  /**
   * "all" for staff, "own" for clients. Handlers must narrow their queries with
   * `clientId` whenever this is "own".
   */
  scope: DataScope;
  /** Resolved client record id — present only when scope is "own". */
  clientId: string | null;
  can: (workspaceModule: WorkspaceModuleId, action: WorkspaceAction) => boolean;
};

export type WorkspaceApiAuth = Failure | Success;

function fail(error: string, status: 401 | 403 | 404): Failure {
  return {
    error,
    status,
    supabase: null,
    user: null,
    profile: null,
    scope: null,
    clientId: null,
    roleCatalog: null,
    isFounder: false,
    can: () => false,
  };
}

/**
 * The single authorization gate for every workspace API route.
 *
 * Replaces the old split between `verifyAdminPermissionApi` (staff only) and
 * `verifyCustomerPermissionApi` (which rejected staff outright). Both roles now
 * pass through the same check and are separated by `scope`, so a founder and a
 * client can call the same endpoint and each receive the right rows.
 */
export async function verifyWorkspaceApi(
  module: WorkspaceModuleId,
  action: WorkspaceAction = "view",
): Promise<WorkspaceApiAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return fail("Unauthorized", 401);

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!data) return fail("Profile not found", 404);

  const profile = { ...data, roles: parseUserRoles(data) } as Profile;
  const roleCatalog = await getRoleCatalogSafe();
  const founder = isFounder(profile, profile.email, user.email);
  const options = { isFounder: founder };

  const granted = getEffectiveWorkspacePermissions(profile, roleCatalog, options);
  if (!granted.has(permissionKey(module, action))) {
    return fail("You do not have permission to perform this action", 403);
  }

  const scope = getDataScope(profile, roleCatalog, options);

  // Clients are limited to rows belonging to their own client record. Resolve it
  // up front so handlers cannot forget to scope their queries.
  let clientId: string | null = null;
  if (scope === "own") {
    const client = await resolvePortalClient(supabase, user.id, user.email ?? profile.email);
    clientId = client?.id ?? null;
  }

  return {
    error: null,
    status: 200,
    supabase,
    user,
    profile,
    roleCatalog,
    isFounder: founder,
    scope,
    clientId,
    can: (checkModule, checkAction) => granted.has(permissionKey(checkModule, checkAction)),
  };
}

/** True when the caller is a client with no linked client record — no data to show. */
export function isUnlinkedClient(auth: Success): boolean {
  return auth.scope === "own" && !auth.clientId;
}

/** Narrow a Supabase query to the caller's own client when scope requires it. */
export function scopeToClient<T extends { eq: (column: string, value: string) => T }>(
  query: T,
  auth: Success,
  column = "client_id",
): T {
  if (auth.scope === "own" && auth.clientId) {
    return query.eq(column, auth.clientId);
  }
  return query;
}

export function isStaffSession(profile: Profile, catalog: RoleDefinition[]): boolean {
  return isStaffRole(profile, catalog);
}
