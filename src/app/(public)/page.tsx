import { HomePageSections } from "@/components/home/HomePageSections";
import {
  getFeaturedPortfolio,
  getFeaturedTestimonials,
  getPublicSiteConfig,
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
  const [projects, testimonials] = await Promise.all([
    getFeaturedPortfolio(3),
    getFeaturedTestimonials(3),
  ]);

  return <HomePageSections projects={projects} testimonials={testimonials} />;
}
