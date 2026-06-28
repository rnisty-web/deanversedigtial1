import { requireAuth } from "@/lib/auth";
import { getClientProjects } from "@/lib/portal/get-client-projects";
import { getPendingInquiryState } from "@/lib/portal/pending-inquiry";
import { ProjectList } from "@/components/portal/ProjectList";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PendingInquiryNotice } from "@/components/portal/PendingInquiryNotice";
import { Button } from "@/components/ui/Button";

export default async function PortalProjectsPage() {
  const profile = await requireAuth();
  const [{ projects, stats, client }, inquiryState] = await Promise.all([
    getClientProjects(profile.id, profile.email),
    getPendingInquiryState(profile.id, profile.email),
  ]);

  return (
    <PortalPageContent>
      <section className="relative mb-10 overflow-hidden rounded-3xl liquid-glass-strong px-6 py-8 sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(163,201,168,0.14),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/40 to-transparent"
          aria-hidden
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              Client Portal · My Project
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Your bespoke workspace
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/50 sm:text-base">
              {client
                ? `A private view of work commissioned for ${client.name}. Every detail here belongs to you alone.`
                : "Your project appears here once your contact request is linked to this account."}
            </p>
          </div>
          <Button href="/contact" size="sm" variant="secondary" className="shrink-0">
            New request
          </Button>
        </div>

        {stats.total > 0 && (
          <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Active", value: stats.active },
              { label: "Completed", value: stats.completed },
              { label: "Total", value: stats.total },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-white">{item.value}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <PendingInquiryNotice state={inquiryState} />

      <ProjectList projects={projects} inquiryState={inquiryState} />
    </PortalPageContent>
  );
}
