import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PortfolioItem } from "@/types";

interface PortfolioPreviewProps {
  projects: PortfolioItem[];
}

export function PortfolioPreview({ projects }: PortfolioPreviewProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Portfolio"
          title="Recent work that speaks for itself"
          subtitle="A selection of projects built with care — each one crafted to reflect the client's unique brand and goals."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={index * 0.1}>
              <Link href={`/portfolio/${project.slug}`} className="group block h-full">
                <GlassCard padding="sm" className="h-full overflow-hidden p-0">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.image_url ?? siteConfig.assets.background}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a17] via-[#0f1a17]/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {project.tags && project.tags.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#6f8f72]/30 px-2.5 py-0.5 text-xs font-medium text-[#a3c9a8]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-white">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="mt-1 text-sm text-white/60 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center">
          <Button href="/portfolio" variant="secondary">
            View Full Portfolio
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
