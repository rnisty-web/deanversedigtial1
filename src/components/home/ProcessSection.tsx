"use client";

import { useCMS } from "@/components/providers/CMSProvider";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ProcessSection() {
  const { process } = useCMS();

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Process"
          title="A clear path from idea to launch"
          subtitle="No surprises, no jargon — just a proven workflow that keeps you informed at every step."
        />

        <div className="relative">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-[#6f8f72] via-[#a3c9a8]/50 to-transparent md:left-1/2 md:block md:-translate-x-1/2" />

          <div className="space-y-8 md:space-y-12">
            {process.map((step, index) => (
              <Reveal
                key={step.step}
                delay={index * 0.1}
                direction={index % 2 === 0 ? "right" : "left"}
              >
                <div
                  className={cn(
                    "relative md:grid md:grid-cols-2 md:gap-12",
                    index % 2 === 1 && "md:direction-rtl",
                  )}
                >
                  <div
                    className={cn(
                      "md:col-start-1",
                      index % 2 === 1 && "md:col-start-2 md:row-start-1",
                    )}
                  >
                    <GlassCard className={cn(index % 2 === 1 && "md:ml-auto md:max-w-lg")}>
                      <div className="mb-3 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6f8f72] text-sm font-bold text-white">
                          {step.step}
                        </span>
                        <h3 className="text-xl font-semibold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-white/60">
                        {step.description}
                      </p>
                    </GlassCard>
                  </div>

                  <div
                    className={cn(
                      "hidden md:flex md:items-center",
                      index % 2 === 0 ? "md:justify-start" : "md:justify-end md:col-start-1 md:row-start-1",
                    )}
                  >
                    <div className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#a3c9a8] bg-[#0f1a17]">
                      <div className="h-2 w-2 rounded-full bg-[#a3c9a8]" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
