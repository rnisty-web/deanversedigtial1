import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicSiteConfig } from "@/lib/cms/get-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSiteConfig();
  return {
    title: "Privacy Policy",
    description: `How ${site.name} collects, uses, and protects your personal information.`,
  };
}

export default async function PrivacyPage() {
  const site = await getPublicSiteConfig();
  const effectiveDate = "June 26, 2026";

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Legal"
          title="Privacy Policy"
          subtitle={`Your privacy matters. This policy explains how ${site.name} handles your information.`}
          align="left"
        />

        <Reveal>
          <GlassCard hover={false} padding="lg" className="prose-dvd space-y-6 text-sm leading-relaxed text-white/70 md:text-base">
            <p className="text-white/50">Effective date: {effectiveDate}</p>

            <div>
              <h2 className="text-lg font-semibold text-white">Information we collect</h2>
              <p className="mt-2">
                When you contact us, create an account, or use the client portal, we may collect
                your name, email address, phone number, company name, project details, and any
                messages you send through our forms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">How we use your information</h2>
              <p className="mt-2">
                We use your information to respond to inquiries, deliver services, manage client
                projects, send account-related communications, and improve our website. We do not
                sell your personal information.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Analytics</h2>
              <p className="mt-2">
                We collect anonymous page-view analytics to understand how visitors use our site.
                This data is stored securely and is not used to identify you personally.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Data storage & security</h2>
              <p className="mt-2">
                Your data is stored using industry-standard providers with encryption in transit
                and at rest. Access is limited to authorized personnel who need it to perform
                their work.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Your rights</h2>
              <p className="mt-2">
                You may request access to, correction of, or deletion of your personal data by
                contacting us at{" "}
                <a href={`mailto:${site.email}`} className="text-[#a3c9a8] hover:text-[#6f8f72]">
                  {site.email}
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Contact</h2>
              <p className="mt-2">
                Questions about this policy? Reach out to {site.creator} at{" "}
                <a href={`mailto:${site.email}`} className="text-[#a3c9a8] hover:text-[#6f8f72]">
                  {site.email}
                </a>
                .
              </p>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
