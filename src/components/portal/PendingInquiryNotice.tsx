import Link from "next/link";
import type { PendingInquiryState } from "@/lib/portal/pending-inquiry";
import { PortalCard } from "@/components/portal/PortalCard";

export function PendingInquiryNotice({ state }: { state: PendingInquiryState }) {
  if (!state.isPending) return null;

  const title = state.hasLead || state.hasClient ? "We received your inquiry" : "Welcome to your portal";

  const description =
    state.hasLead || state.hasClient
      ? "Thank you for reaching out. Andrey is reviewing your request and will set up your private project workspace soon. You'll see your project details here once work begins."
      : "Your client portal is ready. Submit a project request or send us a message to get started.";

  return (
    <PortalCard
      padding="lg"
      className="mb-8 border-[color-mix(in_srgb,var(--admin-gold)_25%,transparent)] bg-[color-mix(in_srgb,var(--admin-gold)_6%,transparent)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold)]">
            Inquiry received
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--admin-text)]">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--admin-text-muted)]">{description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/portal/messages" className="admin-btn-gold px-4 py-2 text-sm">
            Message us
          </Link>
          <Link href="/contact" className="admin-btn-ghost px-4 py-2 text-sm">
            Contact page
          </Link>
        </div>
      </div>
    </PortalCard>
  );
}
