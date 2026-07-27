/**
 * DeanVerse Workspace — single module catalog.
 *
 * This is the one source of truth for what exists in the product. Navigation,
 * permission checks, route guards, and the role editor all read from here, so a
 * module is added in exactly one place.
 *
 * Historically permissions were section-level strings living in two separate
 * namespaces (`AdminPermission` for /admin, `ClientPermission` for /portal).
 * Those legacy keys are mapped onto modules below so saved roles and per-user
 * overrides keep working untouched — see `lib/workspace/permissions.ts`.
 */

export const WORKSPACE_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "manage",
  "approve",
  "export",
  "configure",
] as const;

export type WorkspaceAction = (typeof WORKSPACE_ACTIONS)[number];

export const WORKSPACE_ACTION_LABELS: Record<WorkspaceAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  manage: "Manage",
  approve: "Approve",
  export: "Export",
  configure: "Configure",
};

export type WorkspaceModuleId =
  | "workspace"
  | "site_content"
  | "portfolio"
  | "testimonials"
  | "media"
  | "leads"
  | "clients"
  | "projects"
  | "messages"
  | "files"
  | "invoices"
  | "calendar"
  | "analytics"
  | "users"
  | "settings"
  | "account";

export type WorkspaceNavGroup = "Overview" | "Content" | "Business" | "System";

export const WORKSPACE_NAV_GROUPS: WorkspaceNavGroup[] = [
  "Overview",
  "Content",
  "Business",
  "System",
];

export type WorkspaceModule = {
  id: WorkspaceModuleId;
  label: string;
  description: string;
  group: WorkspaceNavGroup;
  href: string;
  /** Actions this module supports — drives the role editor matrix. */
  actions: WorkspaceAction[];
  /**
   * Actions granted when a legacy bare admin key (e.g. "projects") is found on
   * a role or user override. Mirrors what that key already allowed so the
   * migration is behaviour-preserving.
   */
  legacyStaffActions: WorkspaceAction[];
  /** Same, for a legacy bare client-portal key. Empty means clients never had it. */
  legacyClientActions: WorkspaceAction[];
  /** Legacy `AdminPermission` key this module replaces, if any. */
  legacyAdminKey?: string;
  /** Legacy `ClientPermission` key this module replaces, if any. */
  legacyClientKey?: string;
  /** Hidden from the sidebar (reachable, but not a top-level destination). */
  hiddenFromNav?: boolean;
  /** Only users with a staff role may ever hold this workspaceModule. */
  staffOnly?: boolean;
  /**
   * Every authenticated user holds these actions. Used for the home screen and
   * a user's own account so nobody can be locked out of the app entirely.
   */
  alwaysGranted?: WorkspaceAction[];
  /**
   * Staff inherit this module's actions from another workspaceModule. Project files had
   * no dedicated staff permission before the merge — staff reached them through
   * Projects — so `files` follows `projects` for staff.
   */
  staffDerivesFrom?: WorkspaceModuleId;
};

export const WORKSPACE_MODULES: WorkspaceModule[] = [
  {
    id: "workspace",
    label: "Workspace",
    description: "Personalized home overview and activity",
    group: "Overview",
    href: "/workspace",
    actions: ["view"],
    legacyStaffActions: ["view"],
    legacyClientActions: ["view"],
    legacyAdminKey: "dashboard",
    legacyClientKey: "dashboard",
    // The home screen composes itself from whatever the user can see, so it is
    // safe — and necessary — for everyone to have a landing page.
    alwaysGranted: ["view"],
  },
  {
    id: "site_content",
    label: "Site Content",
    description: "Edit homepage and marketing copy",
    group: "Content",
    href: "/workspace/content",
    actions: ["view", "edit", "approve"],
    legacyStaffActions: ["view", "edit", "approve"],
    legacyClientActions: [],
    legacyAdminKey: "site_content",
    staffOnly: true,
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Manage portfolio case studies",
    group: "Content",
    href: "/workspace/portfolio",
    actions: ["view", "create", "edit", "delete", "approve"],
    legacyStaffActions: ["view", "create", "edit", "delete", "approve"],
    legacyClientActions: [],
    legacyAdminKey: "portfolio",
    staffOnly: true,
  },
  {
    id: "testimonials",
    label: "Testimonials",
    description: "Manage client testimonials",
    group: "Content",
    href: "/workspace/testimonials",
    actions: ["view", "create", "edit", "delete", "approve"],
    legacyStaffActions: ["view", "create", "edit", "delete", "approve"],
    legacyClientActions: [],
    legacyAdminKey: "testimonials",
    staffOnly: true,
  },
  {
    id: "media",
    label: "Media Library",
    description: "Upload and organize site media",
    group: "Content",
    href: "/workspace/media",
    actions: ["view", "create", "delete", "manage"],
    legacyStaffActions: ["view", "create", "delete", "manage"],
    legacyClientActions: [],
    legacyAdminKey: "media",
    staffOnly: true,
  },
  {
    id: "leads",
    label: "Leads",
    description: "Review and manage inbound leads",
    group: "Business",
    href: "/workspace/leads",
    actions: ["view", "edit", "delete", "export"],
    legacyStaffActions: ["view", "edit", "delete", "export"],
    legacyClientActions: [],
    legacyAdminKey: "leads",
    staffOnly: true,
  },
  {
    id: "clients",
    label: "Clients",
    description: "Manage client accounts",
    group: "Business",
    href: "/workspace/clients",
    actions: ["view", "create", "edit", "delete", "export"],
    legacyStaffActions: ["view", "create", "edit", "delete", "export"],
    legacyClientActions: [],
    legacyAdminKey: "clients",
    staffOnly: true,
  },
  {
    id: "projects",
    label: "Projects",
    description: "Track project status and milestones",
    group: "Business",
    href: "/workspace/projects",
    actions: ["view", "create", "edit", "delete", "export"],
    legacyStaffActions: ["view", "create", "edit", "delete", "export"],
    // Clients could always see their own projects, never mutate them.
    legacyClientActions: ["view"],
    legacyAdminKey: "projects",
    legacyClientKey: "projects",
  },
  {
    id: "messages",
    label: "Messages",
    description: "Read and send messages",
    group: "Business",
    href: "/workspace/messages",
    actions: ["view", "create", "delete"],
    legacyStaffActions: ["view", "create", "delete"],
    legacyClientActions: ["view", "create"],
    legacyAdminKey: "messages",
    legacyClientKey: "messages",
  },
  {
    id: "files",
    label: "Files",
    description: "Upload and download project files",
    group: "Business",
    href: "/workspace/files",
    actions: ["view", "create", "delete"],
    legacyStaffActions: ["view", "create", "delete"],
    legacyClientActions: ["view", "create"],
    legacyClientKey: "files",
    staffDerivesFrom: "projects",
  },
  {
    id: "invoices",
    label: "Invoices",
    description: "Create, send, and settle invoices",
    group: "Business",
    href: "/workspace/invoices",
    actions: ["view", "create", "edit", "delete", "export"],
    legacyStaffActions: ["view", "create", "edit", "delete", "export"],
    // Paying an invoice you own is covered by view + owned data scope.
    legacyClientActions: ["view"],
    legacyAdminKey: "invoices",
    legacyClientKey: "invoices",
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Manage scheduling and deadlines",
    group: "Business",
    href: "/workspace/calendar",
    actions: ["view", "create", "edit", "delete"],
    legacyStaffActions: ["view", "create", "edit", "delete"],
    legacyClientActions: [],
    legacyAdminKey: "calendar",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "View traffic and performance data",
    group: "System",
    href: "/workspace/analytics",
    actions: ["view", "export"],
    legacyStaffActions: ["view", "export"],
    legacyClientActions: [],
    legacyAdminKey: "analytics",
    staffOnly: true,
  },
  {
    id: "users",
    label: "Users & Roles",
    description: "Manage team accounts, roles, and permissions",
    group: "System",
    href: "/workspace/users",
    actions: ["view", "create", "edit", "delete", "manage"],
    legacyStaffActions: ["view", "create", "edit", "delete", "manage"],
    legacyClientActions: [],
    legacyAdminKey: "users",
    staffOnly: true,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Change workspace settings and appearance",
    group: "System",
    href: "/workspace/settings",
    actions: ["view", "configure"],
    legacyStaffActions: ["view", "configure"],
    legacyClientActions: [],
    legacyAdminKey: "settings",
    staffOnly: true,
  },
  {
    id: "account",
    label: "Account",
    description: "Update your own profile and password",
    group: "System",
    href: "/workspace/account",
    actions: ["view", "edit"],
    legacyStaffActions: ["view", "edit"],
    legacyClientActions: ["view", "edit"],
    legacyClientKey: "account",
    // Everyone manages their own profile and password.
    alwaysGranted: ["view", "edit"],
  },
];

const MODULE_BY_ID = new Map<string, WorkspaceModule>(
  WORKSPACE_MODULES.map((item) => [item.id, item]),
);

export const WORKSPACE_MODULE_IDS: WorkspaceModuleId[] = WORKSPACE_MODULES.map((item) => item.id);

export function isWorkspaceModuleId(value: string): value is WorkspaceModuleId {
  return MODULE_BY_ID.has(value);
}

export function getWorkspaceModule(id: string): WorkspaceModule | undefined {
  return MODULE_BY_ID.get(id);
}

export function getWorkspaceModulesInGroup(group: WorkspaceNavGroup): WorkspaceModule[] {
  return WORKSPACE_MODULES.filter((item) => item.group === group && !item.hiddenFromNav);
}

/**
 * Longest-prefix match so nested routes (e.g. /workspace/projects/abc) resolve
 * to their parent module. `/workspace` itself only matches the home module.
 */
export function moduleForPathname(pathname: string): WorkspaceModule {
  const home = MODULE_BY_ID.get("workspace")!;
  if (!pathname.startsWith("/workspace")) return home;

  let best: WorkspaceModule = home;
  let bestLength = 0;

  for (const item of WORKSPACE_MODULES) {
    if (item.id === "workspace") continue;
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (item.href.length > bestLength) {
        best = item;
        bestLength = item.href.length;
      }
    }
  }

  return best;
}

/** Map a legacy /admin or /portal path onto its unified /workspace equivalent. */
export function workspaceHrefForLegacyPath(pathname: string): string {
  const legacyMap: Record<string, string> = {
    "/admin": "/workspace",
    "/admin/content": "/workspace/content",
    "/admin/portfolio": "/workspace/portfolio",
    "/admin/testimonials": "/workspace/testimonials",
    "/admin/media": "/workspace/media",
    "/admin/leads": "/workspace/leads",
    "/admin/clients": "/workspace/clients",
    "/admin/projects": "/workspace/projects",
    "/admin/messages": "/workspace/messages",
    "/admin/invoices": "/workspace/invoices",
    "/admin/calendar": "/workspace/calendar",
    "/admin/analytics": "/workspace/analytics",
    "/admin/users": "/workspace/users",
    "/admin/settings/my-account": "/workspace/account",
    "/admin/settings": "/workspace/settings",
    "/portal": "/workspace",
    "/portal/projects": "/workspace/projects",
    "/portal/files": "/workspace/files",
    "/portal/messages": "/workspace/messages",
    "/portal/invoices": "/workspace/invoices",
    "/portal/account": "/workspace/account",
  };

  // Longest prefix wins so /admin/invoices/123/print keeps its tail.
  const prefixes = Object.keys(legacyMap).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (pathname === prefix) return legacyMap[prefix];
    if (pathname.startsWith(`${prefix}/`)) {
      return `${legacyMap[prefix]}${pathname.slice(prefix.length)}`;
    }
  }

  return "/workspace";
}
