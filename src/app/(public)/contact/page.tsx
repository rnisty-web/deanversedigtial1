import { Suspense } from "react";
import { LeadForm } from "@/components/contact/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicSiteConfig } from "@/lib/cms/get-content";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSiteConfig();
  return createPageMetadata({
    title: "Contact",
    description: `Get in touch with ${site.creator} at ${site.name}. Start your web design project today.`,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const site = await getPublicSiteConfig();

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Contact"
          title="Let's build something great together"
          subtitle="Fill out the form below and I'll respond within 24 hours. Or reach out directly — I'd love to hear about your project."
        />

        <div className="grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/5" />}>
              <LeadForm />
            </Suspense>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">
                  Direct Contact
                </h2>
                <ul className="mt-4 space-y-4">
                  <li>
                    <a
                      href={`mailto:${site.email}`}
                      className="break-all text-white/70 transition-colors hover:text-[#a3c9a8]"
                    >
                      {site.email}
                    </a>
                  </li>
                  <li>
                    <a
                      href={`tel:${site.phone.replace(/\D/g, "")}`}
                      className="text-white/70 transition-colors hover:text-[#a3c9a8]"
                    >
                      {site.phone}
                    </a>
                  </li>
                  <li className="text-white/70">{site.location}</li>
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">
                  What happens next?
                </h2>
                <ol className="mt-4 space-y-3 text-sm text-white/60">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6f8f72]/20 text-xs font-bold text-[#a3c9a8]">
                      1
                    </span>
                    I review your project details within 24 hours.
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6f8f72]/20 text-xs font-bold text-[#a3c9a8]">
                      2
                    </span>
                    We schedule a free discovery call to discuss goals and scope.
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6f8f72]/20 text-xs font-bold text-[#a3c9a8]">
                      3
                    </span>
                    You receive a tailored proposal with timeline and pricing.
                  </li>
                </ol>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
