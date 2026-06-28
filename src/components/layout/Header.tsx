"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteConfig } from "@/components/providers/CMSProvider";
import { navLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Header() {
  const siteConfig = useSiteConfig();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-[#0f1a17]/70 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" className="group shrink-0 transition-opacity hover:opacity-90">
          <BrandLogo
            src={siteConfig.assets.logo}
            alt={siteConfig.name}
            width={240}
            height={320}
            className="h-14 w-auto max-w-[180px] transition-transform duration-300 group-hover:scale-[1.02] sm:h-16 sm:max-w-[220px] lg:h-20 lg:max-w-[260px]"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-2 text-sm font-medium transition-colors duration-300",
                  isActive
                    ? "bg-[#6f8f72]/20 text-[#a3c9a8]"
                    : "text-white/70 hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:text-[#a3c9a8]"
          >
            Client Login
          </Link>
          <Button href="/contact" variant="primary" size="sm">
            Start a Project
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="sr-only">{mobileOpen ? "Close" : "Menu"}</span>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div
        className={cn(
          "fixed inset-0 top-16 z-40 sm:top-20 lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        <button
          type="button"
          className="absolute inset-0 bg-[#0f1a17]/95 backdrop-blur-xl"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
        <nav
          className="relative z-10 flex flex-col gap-1 px-4 py-6"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-3.5 text-base font-medium transition-colors min-h-[44px] flex items-center",
                  isActive
                    ? "bg-[#6f8f72]/20 text-[#a3c9a8]"
                    : "text-white/80 hover:bg-white/5 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-4 border-t border-white/10 pt-4">
            <Link
              href="/login"
              className="mb-4 block rounded-xl px-4 py-3 text-base font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-[#a3c9a8]"
            >
              Client Login
            </Link>
            <Button href="/contact" variant="primary" className="w-full">
              Start a Project
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
