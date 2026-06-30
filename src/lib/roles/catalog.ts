export type RoleDefinition = {
  slug: string;
  label: string;
  color: string;
  isStaff: boolean;
  isSystem: boolean;
  founderOnly?: boolean;
  sortOrder: number;
  archived?: boolean;
};

export const ROLE_CATALOG_SETTINGS_KEY = "roleCatalog";

export const DEFAULT_ROLE_CATALOG: RoleDefinition[] = [
  {
    slug: "admin",
    label: "Founder",
    color: "#fb7185",
    isStaff: true,
    isSystem: true,
    founderOnly: true,
    sortOrder: 0,
  },
  {
    slug: "lead_developer",
    label: "Lead Developer",
    color: "#22d3ee",
    isStaff: true,
    isSystem: true,
    sortOrder: 10,
  },
  {
    slug: "lead_web_designer",
    label: "Lead Web Designer",
    color: "#a78bfa",
    isStaff: true,
    isSystem: true,
    sortOrder: 20,
  },
  {
    slug: "customer",
    label: "Customer",
    color: "#fbbf24",
    isStaff: false,
    isSystem: true,
    sortOrder: 30,
  },
];

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;

export function slugifyRoleLabel(label: string) {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);

  if (!base) return "";
  if (/^[0-9]/.test(base)) return `role_${base}`;
  return base.startsWith("custom_") ? base : `custom_${base}`;
}

export function normalizeHexColor(value: string, fallback = "#c9a962") {
  const trimmed = value.trim();
  if (HEX_COLOR.test(trimmed)) return trimmed.toLowerCase();
  if (HEX_COLOR.test(`#${trimmed}`)) return `#${trimmed}`.toLowerCase();
  return fallback;
}

export function parseRoleCatalog(raw: unknown): RoleDefinition[] {
  if (!Array.isArray(raw)) return DEFAULT_ROLE_CATALOG;

  const parsed = raw
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((item, index) => ({
      slug: String(item.slug ?? "").trim(),
      label: String(item.label ?? "").trim(),
      color: normalizeHexColor(String(item.color ?? "#c9a962")),
      isStaff: Boolean(item.isStaff),
      isSystem: Boolean(item.isSystem),
      founderOnly: item.founderOnly ? true : undefined,
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index * 10,
      archived: item.archived ? true : undefined,
    }))
    .filter((item) => item.slug && item.label);

  if (parsed.length === 0) return DEFAULT_ROLE_CATALOG;

  const merged = new Map<string, RoleDefinition>();
  for (const role of DEFAULT_ROLE_CATALOG) merged.set(role.slug, role);
  for (const role of parsed) {
    merged.set(role.slug, { ...(merged.get(role.slug) ?? {} as RoleDefinition), ...role });
  }

  return [...merged.values()]
    .filter((role) => role.slug && role.label && (!role.archived || role.isSystem))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getActiveRoleCatalog(catalog: RoleDefinition[]) {
  return catalog.filter((role) => !role.archived);
}

export function getRoleDefinition(catalog: RoleDefinition[], slug: string) {
  const resolved = slug === "founder" ? "admin" : slug === "client" ? "customer" : slug;
  return catalog.find((role) => role.slug === resolved);
}

export function getStaffRoleSlugs(catalog: RoleDefinition[]) {
  return getActiveRoleCatalog(catalog)
    .filter((role) => role.isStaff)
    .map((role) => role.slug);
}

export function getAssignableRoleDefinitions(catalog: RoleDefinition[], assignerIsFounder: boolean) {
  return getActiveRoleCatalog(catalog).filter((role) => {
    if (role.founderOnly && !assignerIsFounder) return false;
    return true;
  });
}

export function roleStyleFromDefinition(definition: RoleDefinition) {
  return {
    label: definition.label,
    color: definition.color,
    badge: "",
    dot: "",
    selectBg: "",
  };
}

export function isRoleStaff(slug: string, catalog: RoleDefinition[]) {
  if (slug === "admin" || slug === "founder") return true;
  const definition = getRoleDefinition(catalog, slug);
  return Boolean(definition?.isStaff);
}

export function canAssignRoleDefinition(
  slug: string,
  assignerIsFounder: boolean,
  catalog: RoleDefinition[],
) {
  const definition = getRoleDefinition(catalog, slug);
  if (!definition || definition.archived) return false;
  if (definition.founderOnly && !assignerIsFounder) return false;
  return true;
}

export function validateNewRoleInput(input: {
  label: string;
  color: string;
  isStaff: boolean;
  catalog: RoleDefinition[];
}) {
  const label = input.label.trim();
  if (label.length < 2) return "Role name must be at least 2 characters.";
  if (label.length > 40) return "Role name must be 40 characters or fewer.";

  const slug = slugifyRoleLabel(label);
  if (!slug) return "Could not generate a valid role key from that name.";

  if (input.catalog.some((role) => role.slug === slug && !role.archived)) {
    return "A role with a similar name already exists.";
  }

  return null;
}

export const ROLE_COLOR_PRESETS = [
  "#c9a962",
  "#6f8f72",
  "#fb7185",
  "#22d3ee",
  "#a78bfa",
  "#fbbf24",
  "#f97316",
  "#38bdf8",
];
