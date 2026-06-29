import { requireAuth } from "@/lib/auth";
import { getClientInvoices } from "@/lib/portal/get-client-data";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalInvoiceList } from "@/components/portal/PortalInvoiceList";
import { isStripeConfigured } from "@/lib/stripe";

export default async function PortalInvoicesPage() {
  const profile = await requireAuth();
  const { invoices, stats } = await getClientInvoices(profile.id);
  const stripeEnabled = isStripeConfigured();

  return (
    <PortalPageContent>
      <PortalPageHeader
        title="Invoices & billing"
        subtitle="Track project invoices, payment status, and due dates in one place."
        breadcrumb={[
          { label: "Dashboard", href: "/portal" },
          { label: "Invoices" },
        ]}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PortalStatCard label="Total invoices" value={stats.total} accent="neutral" />
        <PortalStatCard label="Unpaid" value={stats.unpaid} accent={stats.unpaid > 0 ? "warning" : "primary"} />
        <PortalStatCard label="Paid" value={stats.paid} accent="accent" />
        <PortalStatCard label="Overdue" value={stats.overdue} accent={stats.overdue > 0 ? "warning" : "neutral"} />
      </div>

      <PortalInvoiceList invoices={invoices} stripeEnabled={stripeEnabled} />
    </PortalPageContent>
  );
}
