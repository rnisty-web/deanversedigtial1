import { HOMEPAGE_SECTION_KEYS, type CMSLayout } from "@/lib/cms/layout";
import { SECTION_REGISTRY, type SectionCategory } from "@/lib/cms/sections";

export type CMSStats = {
  total: number;
  published: number;
  drafts: number;
  homepage: number;
  linked: number;
  categories: { category: SectionCategory; count: number }[];
};

const CATEGORY_LABELS: Record<SectionCategory, string> = {
  hero: "Hero",
  about: "About",
  services: "Services",
  faq: "FAQ",
  cta: "CTA",
  other: "Other",
};

export function getCategoryLabel(category: SectionCategory) {
  return CATEGORY_LABELS[category] ?? category;
}

export function computeCMSStats(layout: CMSLayout): CMSStats {
  let published = 0;
  let drafts = 0;
  let linked = 0;

  for (const id of layout.order) {
    const status = layout.meta[id]?.status ?? "published";
    if (status === "draft") drafts += 1;
    else published += 1;

    if (SECTION_REGISTRY.find((s) => s.id === id)?.isLinked) linked += 1;
  }

  const categoryMap = new Map<SectionCategory, number>();
  for (const section of SECTION_REGISTRY) {
    if (!layout.order.includes(section.id)) continue;
    categoryMap.set(section.category, (categoryMap.get(section.category) ?? 0) + 1);
  }

  const homepage = HOMEPAGE_SECTION_KEYS.filter((id) => layout.order.includes(id)).length;

  return {
    total: layout.order.length,
    published,
    drafts,
    homepage,
    linked,
    categories: [...categoryMap.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
  };
}
