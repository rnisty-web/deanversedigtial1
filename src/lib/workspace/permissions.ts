/**
 * DeanVerse Workspace — unified permission engine.
 *
 * One permission vocabulary for the whole product: `workspaceModule.action`, e.g.
 * `projects.edit`. Everything (nav, guards, API routes, UI affordances) asks
 * this module rather than checking roles directly.
 *
 * Back-compatibility: roles and per-user overrides saved before the merge hold
 * bare section keys ("projects", "invoices") in two arrays — `admin_permissions`
 * and `client_permissions`. Those are expanded here into the action sets they
 * already implied, so no data migration is required and no existing user's
 * access changes on deploy.
 */

import {
  getWorkspaceModule,
  WORKSPACE_ACTIONS,
  WORKSPACE_MODULES,
  type WorkspaceAction,
  type WorkspaceModule,
  type WorkspaceModuleId,
  moduleForPathname,
} from "@/lib/workspace/modules";
import { getRoleDefinition, type RoleDefinition } from "@/lib/roles/catalog";
import { isFounderRole, isStaffRole, parseUserRoles, type UserRole } from "@/lib/roles";

export type WorkspacePermission = `${WorkspaceModuleId}.${WorkspaceAction}`;

/** Data a user may reach within a module they can see. */
export type DataScope = "all" | "own";

export type WorkspacePermissionProfile = {
  role?: UserRole | string | null;
  roles?: UserRole[] | string[] | null;
  admin_permissions?: string[] | null;
  client_permissions?: string[] | null;
};

export type PermissionOptions = {
  /** Founder bypass — resolved from role or owner email by the caller. */
  isFounder?: boolean;
};

export function permissionKey(
  module: WorkspaceModuleId,
  action: WorkspaceAction,
): WorkspacePermission {
  return `${module}.${action}`;
}

const ACTION_SET = new Set<string>(WORKSPACE_ACTIONS);

/** Split "projects.edit" into its parts, or return null if malformed/unknown. */
function splitPermission(
  value: string,
): { def: WorkspaceModule; action: WorkspaceAction } | null {
  const separator = value.indexOf(".");
  if (separator < 0) return null;

  const moduleId = value.slice(0, separator);
  const action = value.slice(separator + 1);
  if (!ACTION_SET.has(action)) return null;

  const def = getWorkspaceModule(moduleId);
  if (!def) return null;
  if (!def.actions.includes(action as WorkspaceAction)) return null;

  return { def, action: action as WorkspaceAction };
}

type LegacySource = "staff" | "client";

const LEGACY_ADMIN_INDEX = new Map<string, WorkspaceModule>();
const LEGACY_CLIENT_INDEX = new Map<string, WorkspaceModule>();
for (const workspaceModule of WORKSPACE_MODULES) {
  if (workspaceModule.legacyAdminKey) LEGACY_ADMIN_INDEX.set(workspaceModule.legacyAdminKey, workspaceModule);
  if (workspaceModule.legacyClientKey) LEGACY_CLIENT_INDEX.set(workspaceModule.legacyClientKey, workspaceModule);
}

/**
 * Expand one stored permission entry into concrete `workspaceModule.action` keys.
 * Accepts both the new dotted format and legacy bare section keys.
 */
function expandEntry(value: string, source: LegacySource, into: Set<WorkspacePermission>) {
  const dotted = splitPermission(value);
  if (dotted) {
    into.add(permissionKey(dotted.def.id, dotted.action));
    return;
  }

  const index = source === "staff" ? LEGACY_ADMIN_INDEX : LEGACY_CLIENT_INDEX;
  const def = index.get(value);
  if (!def) return;

  const actions = source === "staff" ? def.legacyStaffActions : def.legacyClientActions;
  for (const action of actions) {
    into.add(permissionKey(def.id, action));
  }
}

function expandAll(
  values: readonly string[] | null | undefined,
  source: LegacySource,
  into: Set<WorkspacePermission>,
) {
  if (!values) return;
  for (const value of values) {
    if (typeof value === "string") expandEntry(value, source, into);
  }
}

export function allWorkspacePermissions(): WorkspacePermission[] {
  const all: WorkspacePermission[] = [];
  for (const workspaceModule of WORKSPACE_MODULES) {
    for (const action of workspaceModule.actions) {
      all.push(permissionKey(workspaceModule.id, action));
    }
  }
  return all;
}

/** Keep only entries that name a real module action; used before persisting. */
export function sanitizeWorkspacePermissions(raw: unknown): WorkspacePermission[] {
  if (!Array.isArray(raw)) return [];
  const result = new Set<WorkspacePermission>();
  for (const value of raw) {
    if (typeof value !== "string") continue;
    const dotted = splitPermission(value);
    if (dotted) result.add(permissionKey(dotted.def.id, dotted.action));
  }
  return [...result];
}

function mergeRoleArrays(
  roles: UserRole[],
  catalog: RoleDefinition[],
  field: "permissions" | "clientPermissions",
): string[] {
  const merged = new Set<string>();
  for (const role of roles) {
    const definition = getRoleDefinition(catalog, role);
    const values = definition?.[field];
    if (!values) continue;
    for (const value of values) merged.add(value);
  }
  return [...merged];
}

/**
 * Legacy staff defaults for roles whose catalog entry carries no explicit
 * permission array. Mirrors the pre-merge `DEFAULT_ROLE_PERMISSIONS`.
 */
const LEGACY_DEFAULT_STAFF_KEYS: Record<string, string[]> = {
  admin: [
    "dashboard",
    "site_content",
    "portfolio",
    "testimonials",
    "media",
    "leads",
    "clients",
    "projects",
    "messages",
    "invoices",
    "calendar",
    "analytics",
    "users",
    "settings",
  ],
  lead_developer: [
    "dashboard",
    "site_content",
    "portfolio",
    "testimonials",
    "media",
    "leads",
    "clients",
    "projects",
    "messages",
    "invoices",
    "calendar",
    "analytics",
    "settings",
  ],
  lead_web_designer: [
    "dashboard",
    "site_content",
    "portfolio",
    "testimonials",
    "media",
    "projects",
    "messages",
    "clients",
    "calendar",
  ],
  customer: [],
};

const ALL_LEGACY_CLIENT_KEYS = ["dashboard", "projects", "files", "messages", "invoices", "account"];

function defaultStaffKeysForRole(definition: RoleDefinition | undefined): string[] {
  if (!definition) return [];
  if (!definition.isStaff) return [];
  const slug = definition.slug === "founder" ? "admin" : definition.slug;
  return (
    LEGACY_DEFAULT_STAFF_KEYS[slug] ?? (slug.startsWith("custom_") ? ["dashboard", "messages"] : [])
  );
}

function resolveStaffKeys(
  profile: WorkspacePermissionProfile,
  roles: UserRole[],
  catalog: RoleDefinition[],
): string[] {
  // NULL/undefined override means "inherit from roles"; an empty array means
  // "explicitly nothing", which must be respected.
  if (profile.admin_permissions !== undefined && profile.admin_permissions !== null) {
    return profile.admin_permissions;
  }

  const merged = mergeRoleArrays(roles, catalog, "permissions");
  if (merged.length > 0) return merged;

  const fromDefaults = new Set<string>();
  for (const role of roles) {
    for (const key of defaultStaffKeysForRole(getRoleDefinition(catalog, role))) {
      fromDefaults.add(key);
    }
  }
  return [...fromDefaults];
}

function resolveClientKeys(
  profile: WorkspacePermissionProfile,
  roles: UserRole[],
  catalog: RoleDefinition[],
  staff: boolean,
): string[] {
  if (profile.client_permissions !== undefined && profile.client_permissions !== null) {
    return profile.client_permissions;
  }

  const merged = mergeRoleArrays(roles, catalog, "clientPermissions");
  if (merged.length > 0) return merged;

  // Pre-merge behaviour: a non-staff account with nothing configured got the
  // full client portal; staff browsing the portal got the home screen only.
  if (staff) return ["dashboard"];
  return ALL_LEGACY_CLIENT_KEYS;
}

/**
 * The complete set of `workspaceModule.action` keys a user holds.
 *
 * Order of resolution: founder bypass → stored overrides → role catalog →
 * legacy defaults, then derived and always-granted additions, then a final
 * staff-only sweep so a client can never end up holding a staff workspaceModule.
 */
export function getEffectiveWorkspacePermissions(
  profile: WorkspacePermissionProfile,
  catalog: RoleDefinition[],
  options?: PermissionOptions,
): Set<WorkspacePermission> {
  if (options?.isFounder || isFounderRole(profile)) {
    return new Set(allWorkspacePermissions());
  }

  const roles = parseUserRoles(profile);
  const staff = isStaffRole(profile, catalog);
  const granted = new Set<WorkspacePermission>();

  expandAll(resolveStaffKeys(profile, roles, catalog), "staff", granted);
  expandAll(resolveClientKeys(profile, roles, catalog, staff), "client", granted);

  // Staff inherit derived modules (project files follow projects).
  if (staff) {
    for (const workspaceModule of WORKSPACE_MODULES) {
      if (!workspaceModule.staffDerivesFrom) continue;
      const parent = getWorkspaceModule(workspaceModule.staffDerivesFrom);
      if (!parent) continue;
      for (const action of workspaceModule.actions) {
        if (parent.actions.includes(action) && granted.has(permissionKey(parent.id, action))) {
          granted.add(permissionKey(workspaceModule.id, action));
        }
      }
    }
  }

  for (const workspaceModule of WORKSPACE_MODULES) {
    if (workspaceModule.alwaysGranted) {
      for (const action of workspaceModule.alwaysGranted) {
        granted.add(permissionKey(workspaceModule.id, action));
      }
    }
    // Hard floor: staff-only modules never leak to non-staff accounts.
    if (workspaceModule.staffOnly && !staff) {
      for (const action of workspaceModule.actions) {
        granted.delete(permissionKey(workspaceModule.id, action));
      }
    }
  }

  return granted;
}

export function hasWorkspacePermission(
  profile: WorkspacePermissionProfile,
  moduleId: WorkspaceModuleId,
  action: WorkspaceAction,
  catalog: RoleDefinition[],
  options?: PermissionOptions,
): boolean {
  return getEffectiveWorkspacePermissions(profile, catalog, options).has(
    permissionKey(moduleId, action),
  );
}

/** Convenience for the common "can they open this section at all" check. */
export function canViewModule(
  profile: WorkspacePermissionProfile,
  moduleId: WorkspaceModuleId,
  catalog: RoleDefinition[],
  options?: PermissionOptions,
): boolean {
  return hasWorkspacePermission(profile, moduleId, "view", catalog, options);
}

export function canAccessWorkspacePath(
  profile: WorkspacePermissionProfile,
  pathname: string,
  catalog: RoleDefinition[],
  options?: PermissionOptions,
): boolean {
  return canViewModule(profile, moduleForPathname(pathname).id, catalog, options);
}

/** Modules the user may open, in catalog order — the source for the sidebar. */
export function getVisibleModules(
  profile: WorkspacePermissionProfile,
  catalog: RoleDefinition[],
  options?: PermissionOptions,
): WorkspaceModule[] {
  const granted = getEffectiveWorkspacePermissions(profile, catalog, options);
  const staff = isStaffRole(profile, catalog) || Boolean(options?.isFounder);
  return WORKSPACE_MODULES.filter((item) => {
    if (item.hiddenFromNav) return false;
    if (!granted.has(permissionKey(item.id, "view"))) return false;
    // The dedicated Files browser is client-scoped; staff manage files via Projects.
    if (item.id === "files" && staff) return false;
    return true;
  });
}

/** Actions the user holds within one module — drives buttons and menu items. */
export function getModuleActions(
  profile: WorkspacePermissionProfile,
  moduleId: WorkspaceModuleId,
  catalog: RoleDefinition[],
  options?: PermissionOptions,
): WorkspaceAction[] {
  const granted = getEffectiveWorkspacePermissions(profile, catalog, options);
  const definition = getWorkspaceModule(moduleId);
  if (!definition) return [];
  return definition.actions.filter((action) => granted.has(permissionKey(moduleId, action)));
}

/**
 * Whether a user sees every record in a module or only records tied to them.
 * Staff see everything; clients see the rows belonging to their client record.
 */
export function getDataScope(
  profile: WorkspacePermissionProfile,
  catalog: RoleDefinition[],
  options?: PermissionOptions,
): DataScope {
  if (options?.isFounder || isFounderRole(profile)) return "all";
  return isStaffRole(profile, catalog) ? "all" : "own";
}

/** Human-readable summary for the users directory. */
export function formatModuleSummary(modules: WorkspaceModule[]): string {
  if (modules.length === 0) return "No workspace access";
  if (modules.length >= WORKSPACE_MODULES.length) return "Full access";
  const labels = modules.map((item) => item.label);
  if (labels.length <= 3) return labels.join(", ");
  return `${labels.slice(0, 3).join(", ")} +${labels.length - 3} more`;
}
