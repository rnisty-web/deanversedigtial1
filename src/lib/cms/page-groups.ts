import type { SectionDefinition, SectionId } from "@/lib/cms/sections";

export type ContentPageGroupId =
  | "all"
  | "global"
  | "home"
  | "about-page"
  | "services-page"
  | "portfolio-page"
  | "testimonials-page"
  | "pricing-page"
  | "contact-page"
  | "hire-me"
  | "more";

export type ContentPageGroup = {
  id: ContentPageGroupId;
  label: string;
  path?: string;
  description: string;
  sectionIds: SectionId[];
};

export const CONTENT_PAGE_GROUPS: ContentPageGroup[] = [
  {
    id: "all",
    label: "All",
    description: "Every content block on your site",
    sectionIds: [],
  },
  {
    id: "global",
    label: "Global",
    path: "/",
    description: "Site name, logo, contact info — appears on every page",
    sectionIds: ["site"],
  },
  {
    id: "home",
    label: "Home",
    path: "/",
    description: "Hero, stats, process, portfolio & testimonials previews, and CTA",
    sectionIds: ["hero", "stats", "process", "processIntro", "portfolioPage", "testimonialsPage", "cta"],
  },
  {
    id: "about-page",
    label: "About",
    path: "/about",
    description: "About page story, skills, and tech stack",
    sectionIds: ["about", "techStack"],
  },
  {
    id: "services-page",
    label: "Services",
    path: "/services",
    description: "Services page headings and service offerings",
    sectionIds: ["servicesPage", "services"],
  },
  {
    id: "portfolio-page",
    label: "Portfolio",
    path: "/portfolio",
    description: "Portfolio page headings — add projects in Portfolio admin",
    sectionIds: ["portfolioPage", "portfolio"],
  },
  {
    id: "testimonials-page",
    label: "Testimonials",
    path: "/testimonials",
    description: "Testimonials page headings — add reviews in Testimonials admin",
    sectionIds: ["testimonialsPage", "testimonials"],
  },
  {
    id: "pricing-page",
    label: "Pricing",
    path: "/pricing",
    description: "Pricing page tiers, FAQs, and headings",
    sectionIds: ["pricing"],
  },
  {
    id: "contact-page",
    label: "Contact",
    path: "/contact",
    description: "Contact page headings and sidebar copy",
    sectionIds: ["contact"],
  },
  {
    id: "hire-me",
    label: "Hire Me",
    path: "/hire-me",
    description: "Hire page hero, benefits, process, pricing teaser, and contact form",
    sectionIds: ["hireMePage", "process", "processIntro"],
  },
  {
    id: "more",
    label: "More",
    description: "FAQ, experience, and education pages",
    sectionIds: ["faq", "experience", "education"],
  },
];

const PAGE_GROUP_BY_ID = Object.fromEntries(
  CONTENT_PAGE_GROUPS.map((group) => [group.id, group]),
) as Record<ContentPageGroupId, ContentPageGroup>;

/** Short label shown under each section in the admin list. */
export const SECTION_PAGE_HINTS: Partial<Record<SectionId, string>> = {
  site: "Every page",
  hero: "Homepage",
  stats: "Homepage",
  hireMePage: "/hire-me page",
  process: "Process steps (Home + Hire Me)",
  processIntro: "Process headings (Home + Hire Me)",
  portfolioPage: "Homepage preview + /portfolio",
  testimonialsPage: "Homepage preview + /testimonials",
  cta: "Homepage banner",
  about: "/about page",
  techStack: "/about page (tech list)",
  servicesPage: "/services page headings",
  services: "/services offerings",
  pricing: "/pricing page",
  contact: "/contact page",
  faq: "/faq page",
  experience: "/experience page",
  education: "/education page",
  portfolio: "Projects — Portfolio admin",
  testimonials: "Reviews — Testimonials admin",
};

export function getSectionPageHint(sectionId: SectionId): string {
  return SECTION_PAGE_HINTS[sectionId] ?? "Site content";
}

export function getPageGroup(id: ContentPageGroupId): ContentPageGroup {
  return PAGE_GROUP_BY_ID[id];
}

export function getPageGroupForSection(sectionId: SectionId): ContentPageGroup | null {
  for (const group of CONTENT_PAGE_GROUPS) {
    if (group.id === "all") continue;
    if (group.sectionIds.includes(sectionId)) {
      return group;
    }
  }
  return null;
}

export function getSectionIdsForPageGroup(groupId: ContentPageGroupId): SectionId[] | null {
  if (groupId === "all") return null;
  return PAGE_GROUP_BY_ID[groupId]?.sectionIds ?? [];
}

export function filterSectionsByPageGroup(
  sections: SectionDefinition[],
  groupId: ContentPageGroupId,
): SectionDefinition[] {
  const ids = getSectionIdsForPageGroup(groupId);
  if (!ids) return sections;
  const idSet = new Set(ids);
  return sections.filter((section) => idSet.has(section.id));
}

export const CONTENT_PAGE_GROUP_TABS = CONTENT_PAGE_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
}));
