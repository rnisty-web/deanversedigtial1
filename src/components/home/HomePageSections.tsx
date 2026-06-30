import { CtaBanner } from "@/components/home/CtaBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { PricingPreview } from "@/components/home/PricingPreview";
import { ProcessSection } from "@/components/home/ProcessSection";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { StatsStrip } from "@/components/home/StatsStrip";
import { TestimonialsPreview } from "@/components/home/TestimonialsPreview";
import {
  getPublishedHomepageSections,
  isHomepageSectionPublished,
} from "@/lib/cms/get-content";
import type { CMSLayout } from "@/lib/cms/layout";
import type { SectionId } from "@/lib/cms/sections";
import type { PortfolioItem, Testimonial } from "@/types";

type HomePageSectionsProps = {
  layout: CMSLayout;
  projects: PortfolioItem[];
  testimonials: Testimonial[];
};

function renderHomepageSection(
  id: SectionId,
  layout: CMSLayout,
  projects: PortfolioItem[],
  testimonials: Testimonial[],
) {
  switch (id) {
    case "hero":
      return <HeroSection key={id} />;
    case "stats":
      return <StatsStrip key={id} />;
    case "services":
      return <ServicesPreview key={id} />;
    case "portfolio":
      if (!isHomepageSectionPublished(layout, "portfolio") || projects.length === 0) {
        return null;
      }
      return <PortfolioPreview key={id} projects={projects} />;
    case "process":
      return <ProcessSection key={id} />;
    case "testimonials":
      if (!isHomepageSectionPublished(layout, "testimonials") || testimonials.length === 0) {
        return null;
      }
      return <TestimonialsPreview key={id} testimonials={testimonials} />;
    case "pricing":
      return <PricingPreview key={id} />;
    case "cta":
      return <CtaBanner key={id} />;
    default:
      return null;
  }
}

export function HomePageSections({
  layout,
  projects,
  testimonials,
}: HomePageSectionsProps) {
  const sections = getPublishedHomepageSections(layout);

  return (
    <>
      {sections.map((id) => renderHomepageSection(id, layout, projects, testimonials))}
    </>
  );
}
