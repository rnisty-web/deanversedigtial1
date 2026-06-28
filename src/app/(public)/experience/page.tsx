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
    title: "Experience",
    description: cms.experience.subtitle,
    path: "/experience",
  });
}

export default async function ExperiencePage() {
  const cms = await getCMSContent();
  const { experience } = cms;

  return (
    <>
      <section className="px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Experience"
            title={experience.headline}
            subtitle={experience.subtitle}
          />

          <div className="relative mt-12">
            <div className="absolute bottom-0 left-[1.125rem] top-0 w-px bg-gradient-to-b from-[#6f8f72] via-[#a3c9a8]/40 to-transparent sm:left-6" />

            <div className="space-y-8">
              {experience.items.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.08}>
                  <div className="relative pl-12 sm:pl-16">
                    <span className="absolute left-0 top-6 flex h-9 w-9 items-center justify-center rounded-full border border-[#6f8f72]/40 bg-[#0f1a17] sm:left-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#a3c9a8]" />
                    </span>

                    <GlassCard hover={false} className="liquid-glass">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-white">
                            {item.role}
                          </h2>
                          <p className="mt-1 text-[#a3c9a8]">{item.company}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                          {item.period}
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-white/60">
                        {item.description}
                      </p>
                      {item.highlights.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {item.highlights.map((highlight) => (
                            <li
                              key={highlight}
                              className="flex items-start gap-2 text-sm text-white/60"
                            >
                              <svg
                                className="mt-0.5 h-4 w-4 shrink-0 text-[#a3c9a8]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      )}
                    </GlassCard>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="mt-12 text-center">
            <p className="text-white/60">
              Interested in working together? Let&apos;s talk about your next project.
            </p>
            <div className="mt-6">
              <Button href="/contact" variant="primary" size="lg">
                Start a Project
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
