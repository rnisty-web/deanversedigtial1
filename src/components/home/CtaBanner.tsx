"use client";

import { motion } from "framer-motion";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { useCMS, useSiteConfig } from "@/components/providers/CMSProvider";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function CtaBanner() {
  const siteConfig = useSiteConfig();
  const { cta } = useCMS();
  const prefersReducedMotion = useHydratedReducedMotion();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <Reveal>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-[#6f8f72]/30 bg-gradient-to-br from-[#6f8f72]/20 via-[#0f1a17]/80 to-[#2f5d50]/30 p-8 backdrop-blur-xl sm:p-12 lg:p-16">
          {prefersReducedMotion ? (
            <>
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#a3c9a8]/20 blur-3xl opacity-40" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#6f8f72]/20 blur-3xl opacity-40" />
            </>
          ) : (
            <>
              <motion.div
                className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#a3c9a8]/20 blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#6f8f72]/20 blur-3xl"
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#a3c9a8]">
              {cta.eyebrow}
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
              {cta.headline}{" "}
              <span className="bg-gradient-to-r from-[#a3c9a8] to-[#6f8f72] bg-clip-text text-transparent">
                {cta.headlineAccent}
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60 md:text-lg">
              {cta.body} Based in {siteConfig.location}, working with clients worldwide.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" variant="solid" size="lg">
                {cta.primaryCta}
              </Button>
              <Button
                href={`mailto:${siteConfig.email}`}
                variant="ghost"
                size="lg"
              >
                {cta.secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
