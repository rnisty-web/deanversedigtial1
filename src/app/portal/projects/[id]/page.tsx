import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { projectStatuses } from "@/lib/constants";
import { getProjectDetail } from "@/lib/portal/get-client-data";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function stageProgress(status: string) {
  const index = projectStatuses.indexOf(status as (typeof projectStatuses)[number]);
  if (index < 0) return 10;
  return Math.round(((index + 1) / projectStatuses.length) * 100);
}

export default async function PortalProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireAuth();
  const detail = await getProjectDetail(profile.id, id);

  if (!detail) notFound();

  const { project, files, messages, invoices } = detail;
  const progress = stageProgress(project.status);
  const currentIndex = projectStatuses.indexOf(
    project.status as (typeof projectStatuses)[number],
  );

  return (
    <PortalPageContent>
      <Link
        href="/portal/projects"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--accent)] transition-colors hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to my project
      </Link>

      <section className="relative mb-10 overflow-hidden rounded-3xl liquid-glass-strong px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_100%_0%,rgba(111,143,114,0.15),transparent_50%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/45 to-transparent"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              Project hub
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {project.title}
            </h1>
            {(project.description || project.request_summary) && (
              <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">
                {project.description ?? project.request_summary}
              </p>
            )}
            {"request_type" in project && project.request_type && (
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-white/40">
                Service · {project.request_type}
              </p>
            )}
          </div>
          <AdminStatusBadge
            status={project.status}
            className="self-start px-4 py-1.5 text-sm ring-1 ring-white/10"
          />
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Target delivery",
              value: project.deadline
                ? new Date(project.deadline).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "To be confirmed",
            },
            {
              label: "Commissioned",
              value: new Date(project.created_at).toLocaleDateString(undefined, {
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            },
            { label: "Progress", value: `${progress}% complete` },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-medium text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="relative mt-8">
          <div className="mb-2 flex justify-between text-xs text-white/40">
            <span className="uppercase tracking-[0.16em]">Stage</span>
            <span className="capitalize">{project.status.replace(/_/g, " ")}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06] ring-1 ring-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-amber-200/70"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex gap-1">
            {projectStatuses.slice(0, 5).map((step, index) => (
              <div
                key={step}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  currentIndex >= index ? "bg-[var(--primary)]/60" : "bg-white/[0.06]",
                )}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="liquid-glass-strong flex flex-col rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Deliverables</h2>
            <Button href={`/portal/files?project=${project.id}`} size="sm" variant="ghost">
              Manage files
            </Button>
          </div>
          {files.length === 0 ? (
            <p className="text-sm text-white/40">No files uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {files.slice(0, 6).map((file) => (
                <li
                  key={file.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
                >
                  <p className="truncate text-sm font-medium text-white">{file.name}</p>
                  <p className="mt-1 text-xs text-white/45">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="liquid-glass-strong flex flex-col rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Correspondence</h2>
            <Button href="/portal/messages" size="sm" variant="ghost">
              Open inbox
            </Button>
          </div>
          {messages.length === 0 ? (
            <p className="text-sm text-white/40">No project messages yet.</p>
          ) : (
            <ul className="space-y-2">
              {messages.slice(0, 5).map((msg) => (
                <li
                  key={msg.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
                >
                  <p className="truncate text-sm font-medium text-white">{msg.subject ?? "No subject"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/45">{msg.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="liquid-glass-strong flex flex-col rounded-3xl p-6">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Billing</h2>
            <Button href="/portal/invoices" size="sm" variant="ghost">
              View invoices
            </Button>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-white/40">No invoices for this project.</p>
          ) : (
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li
                  key={inv.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-white">{inv.invoice_number}</p>
                    <AdminStatusBadge status={inv.status} />
                  </div>
                  <p className="mt-1 text-xs text-white/45">
                    ${Number(inv.amount).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-white/[0.06] pt-8">
        <Button href="/portal/messages">Message the team</Button>
        <Button href={`/portal/files?project=${project.id}`} variant="secondary">
          Upload deliverable
        </Button>
      </div>
    </PortalPageContent>
  );
}
