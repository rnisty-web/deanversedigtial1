import { SECTION_REGISTRY } from "@/lib/cms/sections";
import type { SectionId } from "@/lib/cms/sections";

export type SectionStatus = "published" | "draft";

export type CMSLayoutMeta = {
  status: SectionStatus;
  displayName?: string;
  updatedAt?: string;
};

export type CMSLayout = {
  order: string[];
  meta: Record<string, CMSLayoutMeta>;
};

/** Homepage sections shown in the reorder bar (matches public homepage flow). */
export const HOMEPAGE_SECTION_KEYS: SectionId[] = [
  "hero",
  "stats",
  "services",
  "portfolio",
  "process",
  "testimonials",
  "pricing",
  "cta",
];

export function defaultCMSLayout(): CMSLayout {
  const order = SECTION_REGISTRY.map((s) => s.id);
  const meta: Record<string, CMSLayoutMeta> = {};

  for (const section of SECTION_REGISTRY) {
    meta[section.id] = { status: "published" };
  }

  return { order, meta };
}

export function mergeLayout(saved: Partial<CMSLayout> | null | undefined, defaults: CMSLayout): CMSLayout {
  const base = defaults;
  const savedOrder = saved?.order ?? [];
  const order: string[] = [];
  const seen = new Set<string>();

  for (const id of savedOrder) {
    if (base.order.includes(id) && !seen.has(id)) {
      order.push(id);
      seen.add(id);
    }
  }

  for (const id of base.order) {
    if (!seen.has(id)) {
      order.push(id);
      seen.add(id);
    }
  }

  const meta: Record<string, CMSLayoutMeta> = { ...base.meta };

  if (saved?.meta) {
    for (const [key, value] of Object.entries(saved.meta)) {
      if (!value || typeof value !== "object") continue;

      const baseEntry = base.meta[key] ?? { status: "published" as SectionStatus };
      meta[key] = {
        ...baseEntry,
        ...value,
        status: value.status === "draft" ? "draft" : "published",
      };
    }
  }

  return { order, meta };
}

export function getHomepageOrder(layout: CMSLayout): SectionId[] {
  const homepageSet = new Set(HOMEPAGE_SECTION_KEYS);
  const ordered = layout.order.filter((id): id is SectionId =>
    homepageSet.has(id as SectionId),
  );

  for (const key of HOMEPAGE_SECTION_KEYS) {
    if (!ordered.includes(key)) {
      ordered.push(key);
    }
  }

  return ordered;
}

export function isHomepageSectionPublished(
  layout: CMSLayout,
  id: SectionId,
): boolean {
  return (layout.meta[id]?.status ?? "published") !== "draft";
}

export function getPublishedHomepageSections(layout: CMSLayout): SectionId[] {
  return getHomepageOrder(layout).filter((id) => isHomepageSectionPublished(layout, id));
}

/** Rebuild full section order after reordering homepage chips. */
export function applyHomepageOrder(fullOrder: string[], homepageOrder: SectionId[]): string[] {
  const homepageSet = new Set(HOMEPAGE_SECTION_KEYS);
  const queue = [...homepageOrder];
  return fullOrder.map((id) => {
    if (homepageSet.has(id as SectionId)) {
      return queue.shift() ?? id;
    }
    return id;
  });
}

export function reorderFullOrder(order: string[], fromIndex: number, toIndex: number): string[] {
  const next = [...order];
  const [moved] = next.splice(fromIndex, 1);
  if (moved === undefined) return order;
  next.splice(toIndex, 0, moved);
  return next;
}

export function touchLayoutMeta(layout: CMSLayout, key: string): CMSLayout {
  return {
    ...layout,
    meta: {
      ...layout.meta,
      [key]: {
        ...layout.meta[key],
        status: layout.meta[key]?.status ?? "published",
        updatedAt: new Date().toISOString(),
      },
    },
  };
}

export function formatLayoutDate(iso?: string): string {
  if (!iso) return "Never";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "Never";
  }
}
