import type { CMSKey } from "@/lib/cms/types";
import type { SectionId } from "@/lib/cms/sections";
import { HOMEPAGE_SECTION_KEYS, isHomepageLayoutSection } from "@/lib/cms/layout";

export { isHomepageLayoutSection };

/** Best public URL to preview a Site Content section after saving. */
export const CMS_SECTION_LIVE_PATHS: Partial<Record<SectionId, string>> = {
  site: "/",
  hero: "/",
  stats: "/",
  process: "/",
  processIntro: "/",
  portfolioPage: "/portfolio",
  testimonialsPage: "/testimonials",
  about: "/about",
  experience: "/experience",
  education: "/education",
  servicesPage: "/services",
  services: "/services",
  pricing: "/pricing",
  contact: "/contact",
  hireMePage: "/hire-me",
  techStack: "/about",
  cta: "/",
  faq: "/faq",
  portfolio: "/portfolio",
  testimonials: "/testimonials",
};

export function getSectionLivePath(sectionId: SectionId): string {
  return CMS_SECTION_LIVE_PATHS[sectionId] ?? "/";
}

export function isHomepageSection(sectionId: SectionId): boolean {
  return isHomepageLayoutSection(sectionId);
}

export const CMS_PAGE_PATHS = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/contact",
  "/portfolio",
  "/testimonials",
  "/faq",
  "/education",
  "/experience",
  "/hire-me",
] as const;

export type CMSPagePath = (typeof CMS_PAGE_PATHS)[number];

export const CMS_PAGE_LABELS: Record<CMSPagePath, string> = {
  "/": "Home",
  "/about": "About",
  "/services": "Services",
  "/pricing": "Pricing",
  "/contact": "Contact",
  "/portfolio": "Portfolio",
  "/testimonials": "Testimonials",
  "/faq": "FAQ",
  "/education": "Education",
  "/experience": "Experience",
  "/hire-me": "Hire Me",
};

/** CMS keys that affect each public page (for targeted revalidation). */
export const CMS_KEYS_BY_PAGE: Record<CMSPagePath, CMSKey[]> = {
  "/": [
    "site",
    "hero",
    "stats",
    "process",
    "processIntro",
    "portfolioPage",
    "testimonialsPage",
    "cta",
  ],
  "/about": ["site", "about", "techStack"],
  "/services": ["site", "servicesPage", "services"],
  "/pricing": ["site", "pricing"],
  "/contact": ["site", "contact"],
  "/portfolio": ["site", "portfolioPage"],
  "/testimonials": ["site", "testimonialsPage"],
  "/faq": ["site", "faq"],
  "/education": ["site", "education"],
  "/experience": ["site", "experience"],
  "/hire-me": ["site", "hireMePage", "process", "processIntro", "pricing", "cta"],
};

export const HOMEPAGE_SECTION_COUNT = HOMEPAGE_SECTION_KEYS.length;
