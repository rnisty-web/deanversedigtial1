import type { CMSContent, CMSKey } from "@/lib/cms/types";

export type LinkedSectionId = "portfolio" | "testimonials";
export type SectionId = CMSKey | LinkedSectionId;

export type SectionCategory =
  | "hero"
  | "about"
  | "services"
  | "faq"
  | "cta"
  | "other";

export type SectionFilter = "all" | SectionCategory;

export type SectionIconKey =
  | "site"
  | "hero"
  | "stats"
  | "process"
  | "processIntro"
  | "about"
  | "services"
  | "servicesPage"
  | "pricing"
  | "contact"
  | "portfolioPage"
  | "testimonialsPage"
  | "cta"
  | "tech"
  | "experience"
  | "education"
  | "faq"
  | "portfolio"
  | "testimonials";

export type SectionDefinition = {
  id: SectionId;
  title: string;
  typeLabel: string;
  category: SectionCategory;
  description: string;
  icon: SectionIconKey;
  href?: string;
  isLinked?: boolean;
  isArray?: boolean;
};

export const SECTION_REGISTRY: SectionDefinition[] = [
  {
    id: "site",
    title: "Site Settings",
    typeLabel: "Global",
    category: "other",
    description: "Site name, contact info, social links, and brand assets.",
    icon: "site",
  },
  {
    id: "hero",
    title: "Hero Banner",
    typeLabel: "Hero",
    category: "hero",
    description: "Homepage hero headline, badge, and call-to-action buttons.",
    icon: "hero",
  },
  {
    id: "stats",
    title: "Stats Strip",
    typeLabel: "Hero",
    category: "hero",
    description: "Key metrics displayed below the hero section.",
    icon: "stats",
    isArray: true,
  },
  {
    id: "about",
    title: "About",
    typeLabel: "Dedicated Page",
    category: "about",
    description: "Content for the /about page only (not shown on the homepage).",
    icon: "about",
  },
  {
    id: "experience",
    title: "Experience",
    typeLabel: "About",
    category: "about",
    description: "Work history and career highlights.",
    icon: "experience",
    isArray: true,
  },
  {
    id: "education",
    title: "Education",
    typeLabel: "About",
    category: "about",
    description: "Certifications, courses, and education entries.",
    icon: "education",
    isArray: true,
  },
  {
    id: "servicesPage",
    title: "Services Page",
    typeLabel: "Dedicated Page",
    category: "services",
    description: "Headings and bottom call-to-action on /services.",
    icon: "servicesPage",
  },
  {
    id: "services",
    title: "Service Offerings",
    typeLabel: "Dedicated Page",
    category: "services",
    description: "Individual services listed on the /services page.",
    icon: "services",
    isArray: true,
  },
  {
    id: "pricing",
    title: "Pricing",
    typeLabel: "Dedicated Page",
    category: "services",
    description: "Page headings, tiers, FAQs, and closing CTA on /pricing.",
    icon: "pricing",
  },
  {
    id: "contact",
    title: "Contact Page",
    typeLabel: "Dedicated Page",
    category: "cta",
    description: "Headings, sidebar labels, and next steps on /contact.",
    icon: "contact",
  },
  {
    id: "hireMePage",
    title: "Hire Me Page",
    typeLabel: "Dedicated Page",
    category: "cta",
    description: "Hero, benefits, pricing teaser, and form copy on /hire-me.",
    icon: "cta",
  },
  {
    id: "portfolioPage",
    title: "Portfolio Page",
    typeLabel: "Homepage + /portfolio",
    category: "other",
    description: "Headings for the homepage portfolio preview and full /portfolio page.",
    icon: "portfolioPage",
  },
  {
    id: "techStack",
    title: "Tech Stack",
    typeLabel: "/about page",
    category: "about",
    description: "Technology list at the bottom of the About page (not on homepage).",
    icon: "tech",
    isArray: true,
  },
  {
    id: "process",
    title: "Process Steps",
    typeLabel: "Homepage + /hire-me",
    category: "services",
    description: "Workflow step content on the homepage and Hire Me page.",
    icon: "process",
    isArray: true,
  },
  {
    id: "processIntro",
    title: "Process Headings",
    typeLabel: "Homepage + /hire-me",
    category: "services",
    description: "Section titles and subtitles above the process steps.",
    icon: "processIntro",
  },
  {
    id: "cta",
    title: "Call to Action",
    typeLabel: "CTA",
    category: "cta",
    description: "Bottom-of-page CTA banner content.",
    icon: "cta",
  },
  {
    id: "faq",
    title: "FAQ",
    typeLabel: "FAQ",
    category: "faq",
    description: "Frequently asked questions page content.",
    icon: "faq",
    isArray: true,
  },
  {
    id: "portfolio",
    title: "Portfolio Projects",
    typeLabel: "Linked",
    category: "other",
    description: "Case studies and project showcase — add and edit in Portfolio admin.",
    icon: "portfolio",
    href: "/admin/portfolio",
    isLinked: true,
  },
  {
    id: "testimonialsPage",
    title: "Testimonials Page",
    typeLabel: "Homepage + /testimonials",
    category: "other",
    description: "Headings for the homepage reviews preview and full /testimonials page.",
    icon: "testimonialsPage",
  },
  {
    id: "testimonials",
    title: "Client Reviews",
    typeLabel: "Linked",
    category: "other",
    description: "Client quotes and ratings — add and edit in Testimonials admin.",
    icon: "testimonials",
    href: "/admin/testimonials",
    isLinked: true,
  },
];

export const SECTION_BY_ID = Object.fromEntries(
  SECTION_REGISTRY.map((s) => [s.id, s]),
) as Record<SectionId, SectionDefinition>;

export const FILTER_TABS: { id: SectionFilter; label: string }[] = [
  { id: "all", label: "All Sections" },
  { id: "hero", label: "Hero Sections" },
  { id: "about", label: "About Sections" },
  { id: "services", label: "Services" },
  { id: "faq", label: "FAQs" },
  { id: "cta", label: "CTAs" },
  { id: "other", label: "Other" },
];

export function isCMSKey(id: SectionId): id is CMSKey {
  return id !== "portfolio" && id !== "testimonials";
}

export function getSectionsByCategory(category: SectionFilter): SectionDefinition[] {
  if (category === "all") return SECTION_REGISTRY;
  return SECTION_REGISTRY.filter((s) => s.category === category);
}

export function filterSectionsBySearch(
  sections: SectionDefinition[],
  query: string,
): SectionDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return sections;
  return sections.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.typeLabel.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q),
  );
}

export function getSectionDisplayTitle(
  section: SectionDefinition,
  content: CMSContent | null,
  displayName?: string,
): string {
  if (displayName) return displayName;
  if (!content || !isCMSKey(section.id)) return section.title;

  const data = content[section.id];
  if (section.id === "hero" && "headline" in data) {
    return (data as CMSContent["hero"]).headline || section.title;
  }
  if (section.id === "about" && "headline" in data) {
    return (data as CMSContent["about"]).headline || section.title;
  }
  if (section.id === "cta" && "headline" in data) {
    return (data as CMSContent["cta"]).headline || section.title;
  }
  if (section.id === "faq" && "headline" in data) {
    return (data as CMSContent["faq"]).headline || section.title;
  }
  if (section.id === "experience" && "headline" in data) {
    return (data as CMSContent["experience"]).headline || section.title;
  }
  if (section.id === "education" && "headline" in data) {
    return (data as CMSContent["education"]).headline || section.title;
  }
  if (section.id === "servicesPage" && "intro" in data) {
    return (data as CMSContent["servicesPage"]).intro.title || section.title;
  }
  if (section.id === "contact" && "intro" in data) {
    return (data as CMSContent["contact"]).intro.title || section.title;
  }
  if (section.id === "portfolioPage" && "pageIntro" in data) {
    return (data as CMSContent["portfolioPage"]).pageIntro.title || section.title;
  }
  if (section.id === "testimonialsPage" && "pageIntro" in data) {
    return (data as CMSContent["testimonialsPage"]).pageIntro.title || section.title;
  }
  if (section.id === "pricing" && "intro" in data) {
    return (data as CMSContent["pricing"]).intro.title || section.title;
  }
  return section.title;
}

export function orderedSections(order: string[]): SectionDefinition[] {
  const seen = new Set<string>();
  const result: SectionDefinition[] = [];

  for (const id of order) {
    const section = SECTION_BY_ID[id as SectionId];
    if (section && !seen.has(id)) {
      result.push(section);
      seen.add(id);
    }
  }

  for (const section of SECTION_REGISTRY) {
    if (!seen.has(section.id)) {
      result.push(section);
    }
  }

  return result;
}
