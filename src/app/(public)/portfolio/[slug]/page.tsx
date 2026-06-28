import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { CreativeWorkStructuredData } from "@/components/seo/CreativeWorkStructuredData";
import {
  getAllPortfolioSlugs,
  getCaseStudyDetails,
  getPortfolioBySlug,
} from "@/lib/data/queries";
import { siteConfig } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { PortfolioCaseStudy } from "@/types";
import type { Metadata } from "next";

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>;
}

function resolveCaseStudy(
  slug: string,
  project: NonNullable<Awaited<ReturnType<typeof getPortfolioBySlug>>>,
): (PortfolioCaseStudy & { industry?: string }) | null {
  const dbStudy = project.case_study;
  const hasDbContent =
    dbStudy &&
    (dbStudy.challenge ||
      dbStudy.solution ||
      dbStudy.content ||
      (dbStudy.results && dbStudy.results.length > 0));

  if (hasDbContent) {
    return {
      ...dbStudy,
      industry: project.industry ?? undefined,
    };
  }

  const fallback = getCaseStudyDetails(slug);
  if (!fallback) {
    return project.industry ? { industry: project.industry } : null;
  }

  return fallback;
}

export async function generateStaticParams() {
  const slugs = await getAllPortfolioSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPortfolioBySlug(slug);

  if (!project) {
    return { title: "Project Not Found" };
  }

  return createPageMetadata({
    title: project.title,
    description:
      project.description ??
      `Case study: ${project.title} by ${siteConfig.name}.`,
    path: `/portfolio/${slug}`,
  });
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { slug } = await params;
  const project = await getPortfolioBySlug(slug);

  if (!project) {
    notFound();
  }

  const caseStudy = resolveCaseStudy(slug, project);

  return (
    <>
      <CreativeWorkStructuredData
        title={project.title}
        description={project.description}
        imageUrl={project.image_url}
        slug={slug}
        tags={project.tags ?? undefined}
        liveUrl={project.live_url}
      />

      <section className="px-4 pb-12 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <Link
              href="/portfolio"
              className="mb-8 inline-flex items-center gap-2 text-sm text-[#a3c9a8] transition-colors hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Portfolio
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10">
              <div className="relative aspect-[21/9] min-h-[240px]">
                <Image
                  src={project.image_url ?? siteConfig.assets.background}
                  alt={project.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1a17] via-[#0f1a17]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
                  {caseStudy?.industry && (
                    <p className="mb-2 text-sm font-medium uppercase tracking-wider text-[#a3c9a8]">
                      {caseStudy.industry}
                    </p>
                  )}
                  <h1 className="text-3xl font-bold text-white md:text-5xl">
                    {project.title}
                  </h1>
                  {project.description && (
                    <p className="mt-4 max-w-2xl text-lg text-white/70">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {caseStudy?.challenge && (
                <Reveal delay={0.15}>
                  <GlassCard hover={false}>
                    <h2 className="text-xl font-semibold text-white">
                      The Challenge
                    </h2>
                    <p className="mt-4 leading-relaxed text-white/70">
                      {caseStudy.challenge}
                    </p>
                  </GlassCard>
                </Reveal>
              )}

              {caseStudy?.solution && (
                <Reveal delay={0.2}>
                  <GlassCard hover={false}>
                    <h2 className="text-xl font-semibold text-white">
                      The Solution
                    </h2>
                    <p className="mt-4 leading-relaxed text-white/70">
                      {caseStudy.solution}
                    </p>
                  </GlassCard>
                </Reveal>
              )}

              {caseStudy?.content && (
                <Reveal delay={0.25}>
                  <GlassCard hover={false}>
                    <h2 className="text-xl font-semibold text-white">
                      Case Study
                    </h2>
                    <p className="mt-4 leading-relaxed text-white/70">
                      {caseStudy.content}
                    </p>
                  </GlassCard>
                </Reveal>
              )}

              {caseStudy?.results && caseStudy.results.length > 0 && (
                <Reveal delay={0.3}>
                  <GlassCard hover={false}>
                    <h2 className="text-xl font-semibold text-white">
                      Results
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {caseStudy.results.map((result) => (
                        <li
                          key={result}
                          className="flex items-start gap-3 text-white/70"
                        >
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#a3c9a8]" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </Reveal>
              )}

              {!caseStudy?.challenge &&
                !caseStudy?.solution &&
                !caseStudy?.content &&
                project.description && (
                  <Reveal delay={0.15}>
                    <GlassCard hover={false}>
                      <h2 className="text-xl font-semibold text-white">
                        Overview
                      </h2>
                      <p className="mt-4 leading-relaxed text-white/70">
                        {project.description}
                      </p>
                    </GlassCard>
                  </Reveal>
                )}
            </div>

            <aside className="space-y-6">
              <Reveal delay={0.2}>
                <GlassCard hover={false}>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">
                    Project Details
                  </h3>
                  <dl className="mt-4 space-y-4">
                    {caseStudy?.industry && (
                      <div>
                        <dt className="text-xs text-white/40">Industry</dt>
                        <dd className="text-sm text-white">{caseStudy.industry}</dd>
                      </div>
                    )}
                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <dt className="text-xs text-white/40">Technologies</dt>
                        <dd className="mt-2 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#6f8f72]/20 px-2.5 py-0.5 text-xs text-[#a3c9a8]"
                            >
                              {tag}
                            </span>
                          ))}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-6 flex flex-col gap-3">
                    {project.live_url && (
                      <Button href={project.live_url} variant="primary" external>
                        View Live Site
                      </Button>
                    )}
                    {project.github_url && (
                      <Button href={project.github_url} variant="secondary" external>
                        View on GitHub
                      </Button>
                    )}
                    <Button href="/contact" variant="ghost">
                      Start a Similar Project
                    </Button>
                  </div>
                </GlassCard>
              </Reveal>

              {caseStudy?.testimonial?.quote && (
                <Reveal delay={0.25}>
                  <GlassCard hover={false}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">
                      Client Testimonial
                    </h3>
                    <blockquote className="mt-4 text-sm leading-relaxed text-white/70">
                      &ldquo;{caseStudy.testimonial.quote}&rdquo;
                    </blockquote>
                    <footer className="mt-4 border-t border-white/10 pt-4">
                      <p className="font-medium text-white">
                        {caseStudy.testimonial.client_name}
                      </p>
                      <p className="text-sm text-[#a3c9a8]/80">
                        {caseStudy.testimonial.client_company}
                      </p>
                    </footer>
                  </GlassCard>
                </Reveal>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
