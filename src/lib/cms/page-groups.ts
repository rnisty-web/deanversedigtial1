import type { SectionDefinition, SectionId } from "@/lib/cms/sections";

export type ContentPageGroupId =
  | "all"
  | "global"
  | "home"
  | "about-page"
  | "services-page"
  | "pricing-page"
  | "experience-page"
  | "education-page"
  | "faq-page"
  | "hire-me"
  | "linked";

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
    label: "Homepage",
    path: "/",
    description: "Main landing page sections",
    sectionIds: ["hero", "stats", "about", "portfolio", "process", "testimonials", "cta"],
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
    description: "Services page offerings",
    sectionIds: ["services"],
  },
  {
    id: "pricing-page",
    label: "Pricing",
    path: "/pricing",
    description: "Pricing tiers and FAQs",
    sectionIds: ["pricing"],
  },
  {
    id: "experience-page",
    label: "Experience",
    path: "/experience",
    description: "Work history timeline",
    sectionIds: ["experience"],
  },
  {
    id: "education-page",
    label: "Education",
    path: "/education",
    description: "Courses and certifications",
    sectionIds: ["education"],
  },
  {
    id: "faq-page",
    label: "FAQ",
    path: "/faq",
    description: "Frequently asked questions page",
    sectionIds: ["faq"],
  },
  {
    id: "hire-me",
    label: "Hire Me",
    path: "/hire-me",
    description: "Hire page — process steps also show on homepage",
    sectionIds: ["process"],
  },
  {
    id: "linked",
    label: "Portfolio & Reviews",
    description: "Managed in separate admin tabs",
    sectionIds: ["portfolio", "testimonials"],
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
  about: "Homepage + /about",
  techStack: "/about page (tech list)",
  services: "/services page",
  pricing: "/pricing page",
  process: "Homepage + /hire-me",
  cta: "Homepage banner",
  faq: "/faq page",
  experience: "/experience page",
  education: "/education page",
  portfolio: "/portfolio (separate admin)",
  testimonials: "/testimonials (separate admin)",
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
