import type {
  WorkspaceModule,
  WorkspaceModuleId,
  WorkspaceNavGroup,
} from "@/lib/workspace/modules";

/**
 * Serializable nav item. Built on the server from the user's visible modules
 * and handed to the client nav, which stays free of permission logic.
 */
export type WorkspaceNavItem = {
  id: WorkspaceModuleId;
  label: string;
  description: string;
  href: string;
  group: WorkspaceNavGroup;
};

export function toNavItems(modules: WorkspaceModule[]): WorkspaceNavItem[] {
  return modules.map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description,
    href: item.href,
    group: item.group,
  }));
}
