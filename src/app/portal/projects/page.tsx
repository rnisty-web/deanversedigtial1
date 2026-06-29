import { requireAuth } from "@/lib/auth";
import { getClientProjects } from "@/lib/portal/get-client-projects";
import { getPendingInquiryState } from "@/lib/portal/pending-inquiry";
import { ProjectList } from "@/components/portal/ProjectList";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PendingInquiryNotice } from "@/components/portal/PendingInquiryNotice";
import Link from "next/link";

export default async function PortalProjectsPage() {
  const profile = await requireAuth();
  const [{ projects, stats, client }, inquiryState] = await Promise.all([
    getClientProjects(profile.id, profile.email),
    getPendingInquiryState(profile.id, profile.email),
  ]);

  return (
    <PortalPageContent>
      <PortalPageHeader
        title="My project"
        subtitle={
          client
            ? `A private view of work commissioned for ${client.name}. Every detail here belongs to you alone.`
            : "Your project appears here once your contact request is linked to this account."
        }
        actions={
          <Link href="/contact" className="admin-btn-ghost whitespace-nowrap px-4 py-2 text-sm">
            New request
          </Link>
        }
        breadcrumb={[
          { label: "Dashboard", href: "/portal" },
          { label: "My Project" },
        ]}
      />

      {stats.total > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <PortalStatCard label="Active" value={stats.active} accent="primary" />
          <PortalStatCard label="Completed" value={stats.completed} accent="accent" />
          <PortalStatCard label="Total" value={stats.total} accent="neutral" />
        </div>
      )}

      <PendingInquiryNotice state={inquiryState} />

      <ProjectList projects={projects} inquiryState={inquiryState} />
    </PortalPageContent>
  );
}
