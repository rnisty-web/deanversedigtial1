import { navLinks } from "@/lib/constants";

export type SearchablePage = {
  href: string;
  label: string;
  description: string;
  type: "page";
};

export const searchablePages: SearchablePage[] = [
  ...navLinks.map((link) => ({
    href: link.href,
    label: link.label,
    description: getPageDescription(link.href),
    type: "page" as const,
  })),
  {
    href: "/experience",
    label: "Experience",
    description: "Career timeline and professional work history.",
    type: "page",
  },
  {
    href: "/education",
    label: "Education",
    description: "Certifications, courses, and ongoing training.",
    type: "page",
  },
  {
    href: "/hire-me",
    label: "Hire Me",
    description: "Why hire DeanVerse Digital and how to get started.",
    type: "page",
  },
  {
    href: "/faq",
    label: "FAQ",
    description: "Frequently asked questions about projects and pricing.",
    type: "page",
  },
  {
    href: "/privacy",
    label: "Privacy Policy",
    description: "How we handle your data and privacy.",
    type: "page",
  },
  {
    href: "/terms",
    label: "Terms of Service",
    description: "Terms and conditions for using this site.",
    type: "page",
  },
];

function getPageDescription(href: string): string {
  const descriptions: Record<string, string> = {
    "/": "Premium web design and development for small businesses and startups.",
    "/about": "Learn about the designer and developer behind DeanVerse Digital.",
    "/services": "Custom websites, e-commerce, redesigns, SEO, and development services.",
    "/portfolio": "Recent web design and development project showcase.",
    "/testimonials": "Client reviews and testimonials.",
    "/pricing": "Transparent pricing packages with no hidden fees.",
    "/contact": "Start your project or request a quote.",
  };
  return descriptions[href] ?? "";
}

export function searchPages(query: string): SearchablePage[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return searchablePages.filter(
    (page) =>
      page.label.toLowerCase().includes(q) ||
      page.description.toLowerCase().includes(q) ||
      page.href.toLowerCase().includes(q),
  );
}
