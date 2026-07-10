import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/constants";
import type { PortfolioCaseStudy } from "@/types";

interface AdminPortfolioPreviewPageProps {
  params: Promise<{ slug: string }>;
}

function hasCaseStudyContent(caseStudy: PortfolioCaseStudy | null | undefined) {
  if (!caseStudy) return false;
  return Boolean(
    caseStudy.challenge ||
      caseStudy.solution ||
      caseStudy.content ||
      (caseStudy.results && caseStudy.results.length > 0),
  );
}

export default async function AdminPortfolioPreviewPage({ params }: AdminPortfolioPreviewPageProps) {
  await requireAdmin();
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("portfolio")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const caseStudy = project.case_study as PortfolioCaseStudy | null;

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white">
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
        Admin preview
        {!project.published ? " — this draft is not visible on the live site" : " — published project"}
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/admin/portfolio" className="text-sm text-[#a3c9a8] hover:text-white">
            ← Back to Portfolio
          </Link>
          <div className="flex flex-wrap gap-2">
            {project.published ? (
              <Link
                href={`/portfolio/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#6f8f72]/40 px-3 py-1.5 text-xs text-[#a3c9a8]"
              >
                View live page
              </Link>
            ) : null}
            <Link
              href="/admin/portfolio"
              className="rounded-lg bg-[#6f8f72] px-3 py-1.5 text-xs font-medium text-white"
            >
              Edit in admin
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative aspect-[16/9] bg-[#0f1a17]">
            {project.image_url ? (
              <Image
                src={project.image_url}
                alt={project.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/40">No cover image</div>
            )}
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                {project.published ? "Published" : "Draft"}
              </span>
              {project.featured ? (
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs text-amber-200">
                  Featured on homepage
                </span>
              ) : null}
              {project.industry ? (
                <span className="rounded-full border border-[#6f8f72]/30 px-3 py-1 text-xs text-[#a3c9a8]">
                  {project.industry}
                </span>
              ) : null}
            </div>

            <div>
              <h1 className="text-3xl font-semibold">{project.title}</h1>
              {project.description ? (
                <p className="mt-3 text-base leading-relaxed text-white/65">{project.description}</p>
              ) : null}
            </div>

            {project.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#6f8f72]/20 px-2.5 py-1 text-xs text-[#a3c9a8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {hasCaseStudyContent(caseStudy) ? (
              <div className="space-y-4 border-t border-white/10 pt-6">
                {caseStudy?.challenge ? (
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">Challenge</h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{caseStudy.challenge}</p>
                  </div>
                ) : null}
                {caseStudy?.solution ? (
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">Solution</h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{caseStudy.solution}</p>
                  </div>
                ) : null}
                {caseStudy?.content ? (
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">Overview</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                      {caseStudy.content}
                    </p>
                  </div>
                ) : null}
                {caseStudy?.results?.length ? (
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">Results</h2>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/70">
                      {caseStudy.results.map((result) => (
                        <li key={result}>{result}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="border-t border-white/10 pt-6 text-sm text-white/45">
                No case study content yet. Add challenge, solution, and results in the admin editor.
              </p>
            )}

            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
              {project.live_url ? (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
                >
                  Live site
                </a>
              ) : null}
              {project.github_url ? (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
                >
                  GitHub
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/35">
          Previewing as {siteConfig.name} admin — homepage shows up to 3 featured, published projects.
        </p>
      </div>
    </div>
  );
}
