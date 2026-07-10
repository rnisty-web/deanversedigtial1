"use client";

import Image from "next/image";
import { useCMS, useSiteConfig } from "@/components/providers/CMSProvider";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function AboutPreview() {
  const { about } = useCMS();
  const config = useSiteConfig();
  const teaser = about.homepageTeaser?.trim() || about.intro;
  const previewSkills = about.skills.slice(0, 4);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="About"
          title={about.headline}
          subtitle={teaser}
          align="left"
        />

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="left">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl lg:aspect-[3/4]">
                  <Image
                    src={config.assets.profile}
                    alt={`${config.creator}, founder of ${config.name}`}
                    fill
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
              <p className="text-base leading-relaxed text-white/70 md:text-lg">
                {teaser}
              </p>

              {previewSkills.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {previewSkills.map((skill) => (
                    <GlassCard key={skill} hover={false} className="text-center">
                      <p className="text-sm font-medium text-white">{skill}</p>
                    </GlassCard>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                <Button href="/about" variant="primary">
                  Learn More About Me
                </Button>
                <Button href="/contact" variant="secondary">
                  Work With Me
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
