import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { projectStatuses } from "@/lib/constants";
import { getProjectDetail } from "@/lib/portal/get-client-data";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalCard } from "@/components/portal/PortalCard";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
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
      <PortalPageHeader
        title={project.title}
        subtitle={project.description ?? project.request_summary ?? "Your private project hub — deliverables, messages, and billing in one place."}
        breadcrumb={[
          { label: "Dashboard", href: "/portal" },
          { label: "My Project", href: "/portal/projects" },
          { label: project.title },
        ]}
        actions={
          <>
            <Link href="/portal/messages" className="admin-btn-gold px-4 py-2 text-sm">
              Message team
            </Link>
            <Link
              href={`/portal/files?project=${project.id}`}
              className="admin-btn-ghost px-4 py-2 text-sm"
            >
              Upload file
            </Link>
          </>
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <AdminStatusBadge status={project.status} className="px-3 py-1 text-sm" />
        {"request_type" in project && project.request_type ? (
          <span className="rounded-full border border-[var(--admin-border-subtle)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">
            {project.request_type}
          </span>
        ) : null}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <PortalStatCard
          label="Target delivery"
          value={
            project.deadline
              ? new Date(project.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "TBD"
          }
          hint={project.deadline ? new Date(project.deadline).getFullYear().toString() : "To be confirmed"}
          accent="neutral"
        />
        <PortalStatCard
          label="Commissioned"
          value={new Date(project.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          hint={new Date(project.created_at).getFullYear().toString()}
          accent="primary"
        />
        <PortalStatCard label="Progress" value={`${progress}%`} hint="Project stage" accent="accent" />
      </div>

      <PortalCard padding="lg" className="mb-8">
        <div className="mb-2 flex justify-between text-xs text-[var(--admin-text-muted)]">
          <span className="uppercase tracking-[0.16em]">Stage</span>
          <span className="capitalize text-[var(--admin-gold-light)]">{project.status.replace(/_/g, " ")}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--admin-panel-hover)] ring-1 ring-[var(--admin-border-subtle)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--admin-emerald)] to-[var(--admin-gold)] transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1">
          {projectStatuses.slice(0, 5).map((step, index) => (
            <div
              key={step}
              className={cn(
                "h-1 flex-1 rounded-full",
                currentIndex >= index ? "bg-[var(--admin-emerald)]/70" : "bg-[var(--admin-panel-hover)]",
              )}
            />
          ))}
        </div>
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalCard padding="lg" className="flex flex-col">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--admin-border-subtle)] pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--admin-text)]">Deliverables</h2>
            <Link
              href={`/portal/files?project=${project.id}`}
              className="text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
            >
              Manage →
            </Link>
          </div>
          {files.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">No files uploaded yet.</p>
          ) : (
            <ul className="space-y-2">
              {files.slice(0, 6).map((file) => (
                <li key={file.id} className="portal-list-row">
                  <p className="truncate text-sm font-medium text-[var(--admin-text)]">{file.name}</p>
                  <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard padding="lg" className="flex flex-col">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--admin-border-subtle)] pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--admin-text)]">Correspondence</h2>
            <Link href="/portal/messages" className="text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]">
              Inbox →
            </Link>
          </div>
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">No project messages yet.</p>
          ) : (
            <ul className="space-y-2">
              {messages.slice(0, 5).map((msg) => (
                <li key={msg.id} className="portal-list-row">
                  <p className="truncate text-sm font-medium text-[var(--admin-text)]">{msg.subject ?? "No subject"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-[var(--admin-text-muted)]">{msg.content}</p>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard padding="lg" className="flex flex-col">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--admin-border-subtle)] pb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--admin-text)]">Billing</h2>
            <Link href="/portal/invoices" className="text-xs font-medium text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]">
              Invoices →
            </Link>
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-[var(--admin-text-muted)]">No invoices for this project.</p>
          ) : (
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <li key={inv.id} className="portal-list-row">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-[var(--admin-text)]">{inv.invoice_number}</p>
                    <AdminStatusBadge status={inv.status} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--admin-gold-light)]">
                    ${Number(inv.amount).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>
      </div>
    </PortalPageContent>
  );
}
