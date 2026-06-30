import { HomePageSections } from "@/components/home/HomePageSections";
import {
  getCMSLayout,
  getFeaturedPortfolio,
  getFeaturedTestimonials,
  getPublicSiteConfig,
  isHomepageSectionPublished,
} from "@/lib/cms/get-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPublicSiteConfig();

  return createPageMetadata({
    title: "Premium Web Design & Development",
    description: config.description,
    path: "/",
  });
}

export default async function HomePage() {
  const layout = await getCMSLayout();
  const showPortfolio = isHomepageSectionPublished(layout, "portfolio");
  const showTestimonials = isHomepageSectionPublished(layout, "testimonials");

  const [projects, testimonials] = await Promise.all([
    showPortfolio
      ? getFeaturedPortfolio(3, { useFallback: false })
      : Promise.resolve([]),
    showTestimonials
      ? getFeaturedTestimonials(3, { useFallback: false })
      : Promise.resolve([]),
  ]);

  return (
    <HomePageSections
      layout={layout}
      projects={projects}
      testimonials={testimonials}
    />
  );
}
