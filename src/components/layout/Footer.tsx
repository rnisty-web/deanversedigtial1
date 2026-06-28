"use client";

import Link from "next/link";
import { useSiteConfig } from "@/components/providers/CMSProvider";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";

const staticColumns = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/education", label: "Education" },
      { href: "/services", label: "Services" },
      { href: "/portfolio", label: "Portfolio" },
      { href: "/testimonials", label: "Testimonials" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/experience", label: "Experience" },
      { href: "/hire-me", label: "Hire Me" },
      { href: "/pricing", label: "Pricing" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Get a Quote" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
] as const;

export function Footer() {
  const siteConfig = useSiteConfig();
  const year = new Date().getFullYear();

  const footerColumns = [
    ...staticColumns,
    {
      title: "Contact",
      links: [
        {
          href: `mailto:${siteConfig.email}`,
          label: siteConfig.email,
          external: true as const,
        },
        {
          href: `tel:${siteConfig.phone.replace(/\D/g, "")}`,
          label: siteConfig.phone,
          external: true as const,
        },
        { href: "/contact", label: siteConfig.location },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-[#0f1a17]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block transition-opacity hover:opacity-90">
              <BrandLogo
                src={siteConfig.assets.logo}
                alt={siteConfig.name}
                width={280}
                height={360}
                className="h-20 w-auto max-w-[280px]"
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              {siteConfig.description}
            </p>
            <div className="mt-6">
              <Button href="/contact" variant="secondary" size="sm">
                Work With Me
              </Button>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        className="break-words text-sm text-white/60 transition-colors hover:text-[#a3c9a8]"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="break-words text-sm text-white/60 transition-colors hover:text-[#a3c9a8]"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/40">
            <Link href="/privacy" className="transition-colors hover:text-[#a3c9a8]">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[#a3c9a8]">
              Terms
            </Link>
            <span aria-hidden="true">·</span>
            <span>Crafted with care by {siteConfig.creator}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
