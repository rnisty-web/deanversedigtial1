import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCMSContent } from "@/lib/cms/get-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCMSContent();
  return createPageMetadata({
    title: "Education",
    description: cms.education.subtitle,
    path: "/education",
  });
}

export default async function EducationPage() {
  const cms = await getCMSContent();
  const { education } = cms;

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Education"
          title={education.headline}
          subtitle={education.subtitle}
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {education.items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.06}>
              <GlassCard hover={false} className="flex h-full flex-col liquid-glass">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                  <span className="shrink-0 rounded-full bg-[#6f8f72]/20 px-2.5 py-0.5 text-xs font-medium text-[#a3c9a8]">
                    {item.year}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-[#a3c9a8]/90">
                  {item.provider}
                </p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-white/60">
                  {item.description}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Button href="/experience" variant="secondary">
            View Experience
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
