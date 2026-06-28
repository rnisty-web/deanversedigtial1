"use client";

import { useCMS } from "@/components/providers/CMSProvider";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";

export function StatsStrip() {
  const { stats } = useCMS();

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <Reveal>
        <GlassCard
          hover={false}
          padding="lg"
          className="mx-auto max-w-7xl"
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-4">
            {stats.map((stat, index) => (
              <AnimatedCounter
                key={stat.label}
                value={stat.value}
                label={stat.label}
                duration={1.5 + index * 0.2}
              />
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
