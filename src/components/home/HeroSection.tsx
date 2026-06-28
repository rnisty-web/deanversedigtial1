"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useCMS, useSiteConfig } from "@/components/providers/CMSProvider";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function HeroSection() {
  const siteConfig = useSiteConfig();
  const { hero, techStack } = useCMS();
  const prefersReducedMotion = useHydratedReducedMotion();

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#6f8f72]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#a3c9a8]/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Reveal delay={0.1}>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#a3c9a8]/30 bg-[#a3c9a8]/10 px-4 py-1.5 text-sm font-medium text-[#a3c9a8] backdrop-blur-sm">
              <span
                className={`h-2 w-2 rounded-full bg-[#a3c9a8] ${prefersReducedMotion ? "" : "animate-pulse"}`}
              />
              {hero.badge}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {hero.headline}{" "}
              <span className="bg-gradient-to-r from-[#a3c9a8] to-[#6f8f72] bg-clip-text text-transparent">
                {hero.headlineAccent}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
              {hero.subheadline}
            </p>
          </Reveal>

          <Reveal delay={0.4}>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/contact" variant="primary" size="lg">
                {hero.primaryCta}
              </Button>
              <Button href="/portfolio" variant="secondary" size="lg">
                {hero.secondaryCta}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="mt-10 flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm"
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3} direction="left" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative">
            {prefersReducedMotion ? (
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#6f8f72]/30 to-[#a3c9a8]/20 blur-2xl opacity-65" />
            ) : (
              <motion.div
                className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#6f8f72]/30 to-[#a3c9a8]/20 blur-2xl"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <Image
                  src={siteConfig.assets.profile}
                  alt={`${siteConfig.creator}, ${siteConfig.name}`}
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  suppressHydrationWarning
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a17]/90 via-[#0f1a17]/10 to-transparent" />
              </div>
              <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-[#0f1a17]/80 p-4 backdrop-blur-xl">
                <p className="font-semibold text-white">{siteConfig.creator}</p>
                <p className="text-sm text-[#a3c9a8]">{siteConfig.tagline}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
