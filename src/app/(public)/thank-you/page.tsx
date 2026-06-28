import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { getPublicSiteConfig } from "@/lib/cms/get-content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Your message has been received.",
  robots: { index: false, follow: false },
};

type ThankYouPageProps = {
  searchParams: Promise<{ source?: string }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { source } = await searchParams;
  const site = await getPublicSiteConfig();

  const headline =
    source === "contact"
      ? "Message received!"
      : source === "register"
        ? "Welcome aboard!"
        : "Thank you!";

  const subtitle =
    source === "contact"
      ? `Thanks for reaching out to ${site.name}. I'll review your project details and get back to you within 24 hours.`
      : source === "register"
        ? "Your account is set up. Check your email if confirmation is required, then sign in to the client portal."
        : `We appreciate you connecting with ${site.name}.`;

  return (
    <section className="flex min-h-[60vh] items-center px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <Reveal>
          <GlassCard hover={false} padding="lg" className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#6f8f72]/20 text-[#a3c9a8]">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold text-white md:text-3xl">{headline}</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">{subtitle}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button href="/" variant="primary">
                Back to Home
              </Button>
              {source === "contact" && (
                <Button href="/portfolio" variant="secondary">
                  View Portfolio
                </Button>
              )}
              {source === "register" && (
                <Button href="/login" variant="secondary">
                  Sign In
                </Button>
              )}
            </div>

            <p className="mt-8 text-xs text-white/40">
              Need immediate help?{" "}
              <Link href="/contact" className="text-[#a3c9a8] hover:text-[#6f8f72]">
                Contact us
              </Link>{" "}
              or email{" "}
              <a
                href={`mailto:${site.email}`}
                className="text-[#a3c9a8] hover:text-[#6f8f72]"
              >
                {site.email}
              </a>
              .
            </p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
