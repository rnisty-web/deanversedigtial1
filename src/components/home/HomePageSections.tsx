import { CtaBanner } from "@/components/home/CtaBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { PricingPreview } from "@/components/home/PricingPreview";
import { ProcessSection } from "@/components/home/ProcessSection";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { StatsStrip } from "@/components/home/StatsStrip";
import { TestimonialsPreview } from "@/components/home/TestimonialsPreview";
import {
  getCMSLayout,
  getFeaturedPortfolio,
  getFeaturedTestimonials,
  getPublishedHomepageSections,
} from "@/lib/cms/get-content";
import type { SectionId } from "@/lib/cms/sections";
import type { PortfolioItem, Testimonial } from "@/types";

type HomePageSectionsProps = {
  projects: PortfolioItem[];
  testimonials: Testimonial[];
};

function renderHomepageSection(
  id: SectionId,
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
      return <PortfolioPreview key={id} projects={projects} />;
    case "process":
      return <ProcessSection key={id} />;
    case "testimonials":
      return <TestimonialsPreview key={id} testimonials={testimonials} />;
    case "pricing":
      return <PricingPreview key={id} />;
    case "cta":
      return <CtaBanner key={id} />;
    default:
      return null;
  }
}

export async function HomePageSections({ projects, testimonials }: HomePageSectionsProps) {
  const layout = await getCMSLayout();
  const sections = getPublishedHomepageSections(layout);

  return (
    <>
      {sections.map((id) => renderHomepageSection(id, projects, testimonials))}
    </>
  );
}
