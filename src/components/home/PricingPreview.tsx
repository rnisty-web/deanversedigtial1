"use client";

import { useCMS } from "@/components/providers/CMSProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function PricingPreview() {
  const { pricing } = useCMS();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Pricing"
          title="Transparent packages, no hidden fees"
          subtitle="Choose a starting point that fits your scope — every project includes a personal touch and post-launch support."
        />

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {pricing.tiers.map((tier, index) => (
            <Reveal key={tier.id} delay={index * 0.1}>
              <GlassCard
                className={cn(
                  "relative flex h-full flex-col",
                  tier.highlighted &&
                    "border-[#6f8f72]/50 bg-[#6f8f72]/10 shadow-[0_0_40px_-10px_rgba(111,143,114,0.4)]",
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6f8f72] px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <p className="mt-2 text-sm text-white/50">{tier.description}</p>
                  <p className="mt-4 text-4xl font-bold text-white">
                    {tier.priceLabel}
                  </p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
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
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  href="/contact"
                  variant={tier.highlighted ? "primary" : "secondary"}
                  className="w-full"
                >
                  {tier.cta}
                </Button>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center">
          <Button href="/pricing" variant="ghost">
            Compare full pricing details &rarr;
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
