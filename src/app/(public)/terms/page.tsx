import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicSiteConfig } from "@/lib/cms/get-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSiteConfig();
  return {
    title: "Terms of Service",
    description: `Terms and conditions for using ${site.name} and the client portal.`,
  };
}

export default async function TermsPage() {
  const site = await getPublicSiteConfig();
  const effectiveDate = "June 26, 2026";

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Legal"
          title="Terms of Service"
          subtitle={`Please read these terms before using ${site.name} or the client portal.`}
          align="left"
        />

        <Reveal>
          <GlassCard hover={false} padding="lg" className="prose-dvd space-y-6 text-sm leading-relaxed text-white/70 md:text-base">
            <p className="text-white/50">Effective date: {effectiveDate}</p>

            <div>
              <h2 className="text-lg font-semibold text-white">Acceptance of terms</h2>
              <p className="mt-2">
                By accessing this website, submitting a contact form, or creating a client portal
                account, you agree to these Terms of Service. If you do not agree, please do not
                use our services.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Services</h2>
              <p className="mt-2">
                {site.name} provides freelance web design and development services. Specific
                project scope, deliverables, timelines, and pricing are defined in individual
                proposals or agreements — not on this website.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Client portal</h2>
              <p className="mt-2">
                Portal accounts are provided to active clients. You are responsible for keeping
                your login credentials secure and for all activity under your account. Do not
                share access with unauthorized parties.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Intellectual property</h2>
              <p className="mt-2">
                Website content, branding, and portfolio work displayed here remain the property
                of {site.name} or respective clients unless otherwise agreed in writing. Final
                project ownership terms are outlined in your project agreement.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Limitation of liability</h2>
              <p className="mt-2">
                This website and portal are provided &ldquo;as is.&rdquo; {site.name} is not
                liable for indirect, incidental, or consequential damages arising from use of
                this site, to the fullest extent permitted by law.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Changes</h2>
              <p className="mt-2">
                We may update these terms from time to time. Continued use of the site after
                changes constitutes acceptance of the revised terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Contact</h2>
              <p className="mt-2">
                Questions about these terms? Contact {site.creator} at{" "}
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
