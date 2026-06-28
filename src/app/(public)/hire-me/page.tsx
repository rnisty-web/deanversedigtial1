import { Suspense } from "react";
import { LeadForm } from "@/components/contact/LeadForm";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCMSContent, getPublicSiteConfig } from "@/lib/cms/get-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getPublicSiteConfig();
  return createPageMetadata({
    title: "Hire Me",
    description: `Work directly with ${config.creator} on your next website — premium design, clear process, and transparent pricing.`,
    path: "/hire-me",
  });
}

const whyHireReasons = [
  {
    title: "Direct partnership",
    description:
      "No account managers or hand-offs. You work with me from discovery through launch and beyond.",
  },
  {
    title: "Premium craft",
    description:
      "Custom design, fast performance, and attention to detail — never cookie-cutter templates.",
  },
  {
    title: "Clear communication",
    description:
      "Regular updates, honest timelines, and a client portal to keep everything organized.",
  },
  {
    title: "Results-focused",
    description:
      "Sites built to convert visitors into customers with SEO, accessibility, and UX best practices.",
  },
];

export default async function HireMePage() {
  const [cms, config] = await Promise.all([
    getCMSContent(),
    getPublicSiteConfig(),
  ]);
  const { process, pricing, cta } = cms;
  const highlightedTier =
    pricing.tiers.find((t) => t.highlighted) ?? pricing.tiers[0];

  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[#6f8f72]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#a3c9a8]/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#a3c9a8]/30 bg-[#a3c9a8]/10 px-4 py-1.5 text-sm font-medium text-[#a3c9a8]">
              Available for new projects
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hire {config.creator} for your{" "}
              <span className="bg-gradient-to-r from-[#a3c9a8] to-[#6f8f72] bg-clip-text text-transparent">
                next website
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
              {config.name} delivers custom web design and development for businesses
              that want to stand out. Based in {config.location}, working with clients
              worldwide.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="#hire-form" variant="primary" size="lg">
                {cta.primaryCta}
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                {cta.secondaryCta}
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why hire me"
            title="What you get when we work together"
            subtitle="A focused, personal approach to building websites that perform."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyHireReasons.map((reason, index) => (
              <Reveal key={reason.title} delay={index * 0.06}>
                <GlassCard hover={false} className="h-full liquid-glass">
                  <h2 className="text-lg font-semibold text-white">{reason.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">
                    {reason.description}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Process"
            title="How we'll work together"
            subtitle="A proven four-step workflow from idea to launch."
          />
          <div className="mt-10 space-y-4">
            {process.map((step, index) => (
              <Reveal key={step.step} delay={index * 0.06}>
                <GlassCard hover={false} className="flex gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6f8f72]/20 text-sm font-bold text-[#a3c9a8]">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {step.description}
                    </p>
                  </div>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Pricing"
            title="Transparent packages to get started"
            subtitle="Most projects begin with one of these tiers — custom scope available anytime."
          />
          <Reveal>
            <GlassCard
              className={cn(
                "relative mt-8 text-center",
                highlightedTier?.highlighted &&
                  "border-[#6f8f72]/50 bg-[#6f8f72]/10",
              )}
            >
              {highlightedTier && (
                <>
                  <p className="text-sm font-medium uppercase tracking-wider text-[#a3c9a8]">
                    {highlightedTier.name} — {highlightedTier.priceLabel}
                  </p>
                  <p className="mt-3 text-white/60">{highlightedTier.description}</p>
                </>
              )}
              <div className="mt-6">
                <Button href="/pricing" variant="secondary">
                  View Full Pricing
                </Button>
              </div>
            </GlassCard>
          </Reveal>
        </div>
      </section>

      <section id="hire-form" className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Get started"
            title="Tell me about your project"
            subtitle="Fill out the form below and I'll respond within 24 hours."
          />
          <Reveal className="mt-8">
            <Suspense
              fallback={
                <div className="h-96 animate-pulse rounded-2xl bg-white/5" />
              }
            >
              <LeadForm />
            </Suspense>
          </Reveal>
          <Reveal className="mt-8 text-center">
            <p className="text-sm text-white/50">
              Prefer email?{" "}
              <a
                href={`mailto:${config.email}`}
                className="text-[#a3c9a8] transition-colors hover:text-white"
              >
                {config.email}
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
