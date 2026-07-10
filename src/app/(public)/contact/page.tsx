import { Suspense } from "react";
import { LeadForm } from "@/components/contact/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCMSContent, getPublicSiteConfig } from "@/lib/cms/get-content";
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
  const [site, cms] = await Promise.all([getPublicSiteConfig(), getCMSContent()]);
  const { contact } = cms;

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={contact.intro.eyebrow}
          title={contact.intro.title}
          subtitle={contact.intro.subtitle}
          level={1}
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
                  {contact.directContactLabel}
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
                  {contact.nextStepsLabel}
                </h2>
                <ol className="mt-4 space-y-3 text-sm text-white/60">
                  {contact.nextSteps.map((step, index) => (
                    <li key={step} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6f8f72]/20 text-xs font-bold text-[#a3c9a8]">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
