import { FaqStructuredData } from "@/components/seo/FaqStructuredData";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCMSContent, getPublicSiteConfig } from "@/lib/cms/get-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCMSContent();
  return createPageMetadata({
    title: "FAQ",
    description: cms.faq.subtitle,
    path: "/faq",
  });
}

export default async function FaqPage() {
  const [cms, config] = await Promise.all([
    getCMSContent(),
    getPublicSiteConfig(),
  ]);
  const { faq } = cms;

  return (
    <>
      <FaqStructuredData faqs={faq.items} pageUrl="/faq" />

      <section className="px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title={faq.headline}
            subtitle={faq.subtitle}
          />

          <Reveal className="mt-10">
            <FaqAccordion items={faq.items} />
          </Reveal>

          <Reveal className="mt-12 text-center">
            <p className="text-white/60">
              Still have questions? {config.creator} is happy to help.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="primary" size="lg">
                Get in Touch
              </Button>
              <Button href="/hire-me" variant="secondary" size="lg">
                Hire Me
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
