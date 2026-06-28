import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getTestimonials } from "@/lib/data/queries";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Testimonials",
    description: `Read what clients say about working with ${siteConfig.creator} and ${siteConfig.name}.`,
    path: "/testimonials",
  });
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4 text-[#a3c9a8]"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function TestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by clients who value quality"
          subtitle={`Real feedback from businesses who partnered with ${siteConfig.creator} to build their online presence.`}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 0.05}>
              <GlassCard className="flex h-full flex-col">
                {testimonial.rating && (
                  <StarRating count={testimonial.rating} />
                )}
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
                  &ldquo;{testimonial.content}&rdquo;
                </blockquote>
                <footer className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-semibold text-white">
                    {testimonial.client_name}
                  </p>
                  {testimonial.client_company && (
                    <p className="text-sm text-[#a3c9a8]/80">
                      {testimonial.client_company}
                    </p>
                  )}
                </footer>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
