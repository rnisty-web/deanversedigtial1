import Link from "next/link";
import { projectStatuses } from "@/lib/constants";
import type { ClientProject } from "@/lib/portal/get-client-projects";
import type { PendingInquiryState } from "@/lib/portal/pending-inquiry";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { cn } from "@/lib/utils";

function stageProgress(status: string) {
  const index = projectStatuses.indexOf(status as (typeof projectStatuses)[number]);
  if (index < 0) return 10;
  return Math.round(((index + 1) / projectStatuses.length) * 100);
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function ProjectStageTrack({ status }: { status: string }) {
  const currentIndex = projectStatuses.indexOf(status as (typeof projectStatuses)[number]);
  const progress = stageProgress(status);

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">
            Project journey
          </p>
          <p className="mt-1 text-sm font-medium capitalize text-[var(--admin-gold-light)]">
            {formatStatusLabel(status)}
          </p>
        </div>
        <span className="text-xs tabular-nums text-[var(--admin-text-muted)]">{progress}%</span>
      </div>

      <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--admin-panel-hover)] ring-1 ring-[var(--admin-border-subtle)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--admin-emerald)] to-[var(--admin-gold)] transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 hidden gap-1 sm:flex">
        {projectStatuses.slice(0, 5).map((step, index) => {
          const isComplete = currentIndex >= index;
          const isCurrent = currentIndex === index;
          return (
            <div key={step} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "h-2 w-2 rounded-full ring-2 ring-offset-2 ring-offset-transparent transition-all",
                  isCurrent &&
                    "scale-125 bg-[var(--admin-gold)] shadow-[0_0_12px_var(--admin-gold-glow)] ring-[var(--admin-gold)]/40",
                  isComplete && !isCurrent && "bg-[var(--admin-emerald)] ring-[var(--admin-emerald)]/30",
                  !isComplete && "bg-white/10 ring-white/10",
                )}
              />
              <span
                className={cn(
                  "truncate text-[9px] uppercase tracking-wider",
                  isCurrent ? "text-[var(--admin-gold-light)]" : "text-[var(--admin-text-muted)]",
                )}
              >
                {step.split("_")[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectList({
  projects,
  linkToDetail = true,
  inquiryState,
}: {
  projects: ClientProject[];
  linkToDetail?: boolean;
  inquiryState?: PendingInquiryState;
}) {
  if (projects.length === 0) {
    const fromInquiry = inquiryState?.hasLead || inquiryState?.hasClient;

    return (
      <div className="admin-luxury-card relative overflow-hidden px-8 py-16 text-center">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,169,98,0.08),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-gold-soft)]">
            <svg
              className="h-8 w-8 text-[var(--admin-gold-light)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.25}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-[var(--admin-text)]">
            {fromInquiry ? "We received your inquiry" : "Your project awaits"}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--admin-text-muted)]">
            {fromInquiry
              ? "Your request is in review. Once your project workspace is ready, full details and progress will appear here — private to you alone."
              : "Once you submit a request through our contact form, your bespoke project workspace appears here — private to you, never shared with other clients."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/portal/messages" className="admin-btn-gold px-5 py-2.5 text-sm">
              Message us →
            </Link>
            <Link href="/contact" className="admin-btn-ghost px-5 py-2.5 text-sm">
              Contact page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {projects.map((project) => {
        const card = (
          <article
            className={cn(
              "admin-luxury-card group relative h-full overflow-hidden p-6 sm:p-8",
              linkToDetail && "admin-luxury-card-hover cursor-pointer",
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--admin-gold)]/40 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[var(--admin-gold)]/10 blur-3xl opacity-60 transition-opacity group-hover:opacity-100"
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-gold)]">
                  Your commission
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--admin-text)] sm:text-2xl">
                  {project.title}
                </h2>
                {project.request_type && (
                  <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                    {project.request_type}
                  </p>
                )}
              </div>
              <AdminStatusBadge
                status={project.status}
                className="shrink-0 px-3 py-1 text-[11px] ring-1 ring-[var(--admin-border-subtle)]"
              />
            </div>

            {(project.description || project.request_summary) && (
              <p className="relative mt-4 line-clamp-3 text-sm leading-relaxed text-[var(--admin-text-muted)]">
                {project.description ?? project.request_summary}
              </p>
            )}

            <div className="relative mt-5 flex flex-wrap gap-3">
              {project.deadline && (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--admin-text-muted)]">
                  <svg className="h-3.5 w-3.5 text-[var(--admin-gold-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Due {new Date(project.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.03] px-3 py-1.5 text-xs text-[var(--admin-text-muted)]">
                Requested {new Date(project.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>
            </div>

            <ProjectStageTrack status={project.status} />

            {linkToDetail && (
              <p className="relative mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-gold-light)] transition-colors group-hover:text-[var(--admin-text)]">
                Enter project hub
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </p>
            )}
          </article>
        );

        return linkToDetail ? (
          <Link key={project.id} href={`/portal/projects/${project.id}`} className="block">
            {card}
          </Link>
        ) : (
          <div key={project.id}>{card}</div>
        );
      })}
    </div>
  );
}
