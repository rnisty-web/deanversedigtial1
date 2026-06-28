import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCMSContent, getPublicSiteConfig } from "@/lib/cms/get-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPublicSiteConfig();

  return createPageMetadata({
    title: "About",
    description: `Learn about ${config.creator}, the designer and developer behind ${config.name}. Based in ${config.location}.`,
    path: "/about",
  });
}

export default async function AboutPage() {
  const [cms, config] = await Promise.all([
    getCMSContent(),
    getPublicSiteConfig(),
  ]);
  const { about, techStack } = cms;
  const storyParagraphs = about.story.split("\n\n").filter(Boolean);

  return (
    <>
      <section className="px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="About"
            title={about.headline}
            subtitle={about.intro}
            align="left"
          />

          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal direction="left">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                    <Image
                      src={config.assets.profile}
                      alt={`${config.creator}, founder of ${config.name}`}
                      fill
                      priority
                      className="object-cover object-center"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a17]/70 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.15}>
              <div className="space-y-6">
                {storyParagraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-base leading-relaxed text-white/70 md:text-lg"
                  >
                    {paragraph}
                  </p>
                ))}

                <div className="flex flex-wrap gap-4 pt-4">
                  <Button href="/contact" variant="primary">
                    Work With Me
                  </Button>
                  <Button href="/portfolio" variant="secondary">
                    View Portfolio
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Skills"
            title="Tools and expertise I bring to every project"
            subtitle="A modern stack focused on performance, maintainability, and beautiful user experiences."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {about.skills.map((skill, index) => (
              <Reveal key={skill} delay={index * 0.05}>
                <GlassCard hover={false} className="text-center">
                  <p className="font-medium text-white">{skill}</p>
                </GlassCard>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <GlassCard hover={false} padding="lg">
              <h3 className="mb-6 text-lg font-semibold text-white">
                Tech Stack
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {techStack.map((tech) => (
                  <div key={tech.name} className="flex flex-col">
                    <span className="font-medium text-[#a3c9a8]">
                      {tech.name}
                    </span>
                    <span className="text-sm text-white/50">
                      {tech.category}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>
    </>
  );
}
