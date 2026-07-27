import { redirect } from "next/navigation";
import { getProfile, isFounder, type Profile } from "@/lib/auth";
import { getRoleCatalogSafe } from "@/lib/roles/catalog-server";
import { isStaffRole } from "@/lib/roles";
import type { RoleDefinition } from "@/lib/roles/catalog";
import {
  getDataScope,
  getEffectiveWorkspacePermissions,
  getVisibleModules,
  permissionKey,
  type DataScope,
  type WorkspacePermission,
} from "@/lib/workspace/permissions";
import type {
  WorkspaceAction,
  WorkspaceModule,
  WorkspaceModuleId,
} from "@/lib/workspace/modules";

/**
 * Everything the unified workspace needs about the current user, resolved once
 * per request. Server components take this whole object; client components get
 * the serializable `permissions` array.
 */
export type WorkspaceSession = {
  profile: Profile;
  roleCatalog: RoleDefinition[];
  isFounder: boolean;
  isStaff: boolean;
  /** Serializable list of `workspaceModule.action` keys for passing to client components. */
  permissions: WorkspacePermission[];
  scope: DataScope;
  modules: WorkspaceModule[];
  can: (workspaceModule: WorkspaceModuleId, action: WorkspaceAction) => boolean;
};

function buildSession(profile: Profile, roleCatalog: RoleDefinition[]): WorkspaceSession {
  const founder = isFounder(profile, profile.email);
  const options = { isFounder: founder };
  const granted = getEffectiveWorkspacePermissions(profile, roleCatalog, options);

  return {
    profile,
    roleCatalog,
    isFounder: founder,
    isStaff: isStaffRole(profile, roleCatalog),
    permissions: [...granted],
    scope: getDataScope(profile, roleCatalog, options),
    modules: getVisibleModules(profile, roleCatalog, options),
    can: (workspaceModule, action) => granted.has(permissionKey(workspaceModule, action)),
  };
}

/** Resolve the workspace session, or null when nobody is signed in. */
export async function getWorkspaceSession(): Promise<WorkspaceSession | null> {
  const [profile, roleCatalog] = await Promise.all([getProfile(), getRoleCatalogSafe()]);
  if (!profile) return null;
  return buildSession(profile, roleCatalog);
}

/** Resolve the session or bounce to login, preserving the intended destination. */
export async function requireWorkspaceSession(redirectTo = "/workspace"): Promise<WorkspaceSession> {
  const session = await getWorkspaceSession();
  if (!session) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return session;
}
