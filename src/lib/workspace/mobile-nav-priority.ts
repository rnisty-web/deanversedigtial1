import type { WorkspaceModuleId } from "@/lib/workspace/modules";
import type { WorkspaceNavItem } from "@/components/workspace/workspace-nav";

/** Primary bottom-tab destinations — shown first on mobile when the user has access. */
const MOBILE_TAB_PRIORITY: WorkspaceModuleId[] = [
  "workspace",
  "messages",
  "projects",
  "invoices",
  "files",
  "clients",
  "leads",
];

const MOBILE_TAB_LIMIT = 4;

export function getMobileTabItems(items: WorkspaceNavItem[]): WorkspaceNavItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const picked: WorkspaceNavItem[] = [];

  for (const id of MOBILE_TAB_PRIORITY) {
    const item = byId.get(id);
    if (item) {
      picked.push(item);
    }
    if (picked.length >= MOBILE_TAB_LIMIT) {
      break;
    }
  }

  if (picked.length < MOBILE_TAB_LIMIT) {
    for (const item of items) {
      if (picked.some((entry) => entry.id === item.id)) continue;
      picked.push(item);
      if (picked.length >= MOBILE_TAB_LIMIT) break;
    }
  }

  return picked;
}

export function isMobileTabItem(items: WorkspaceNavItem[], id: WorkspaceModuleId): boolean {
  return getMobileTabItems(items).some((item) => item.id === id);
}
