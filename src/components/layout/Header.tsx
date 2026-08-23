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
        "site-header sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-[#0f1a17]/70 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <div className="site-header-bar mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="group min-w-0 shrink transition-opacity hover:opacity-90">
          <BrandLogo
            src={siteConfig.assets.logo}
            alt={siteConfig.name}
            width={240}
            height={320}
            className="h-9 w-auto max-w-[130px] transition-transform duration-300 group-hover:scale-[1.02] sm:h-11 sm:max-w-[160px] lg:h-16 lg:max-w-[220px] xl:h-20 xl:max-w-[260px]"
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
            href="/workspace"
            className="rounded-full px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:text-[#a3c9a8]"
          >
            Client Workspace
          </Link>
          <Button href="/contact" variant="primary" size="sm">
            Start a Project
          </Button>
        </div>

        <button
          type="button"
          className={cn(
            "site-header-menu-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors lg:hidden",
            mobileOpen && "border-[#6f8f72]/40 bg-[#6f8f72]/15 text-[#a3c9a8]",
          )}
          aria-expanded={mobileOpen}
          aria-controls="site-mobile-nav"
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
            aria-hidden
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
        id="site-mobile-nav"
        className={cn(
          "site-mobile-nav fixed inset-0 z-40 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className={cn(
            "site-mobile-nav-backdrop absolute inset-0 bg-[#0a1210]/90 backdrop-blur-md transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "site-mobile-nav-panel absolute inset-x-0 bottom-0 top-14 flex max-h-[calc(100dvh-3.5rem)] flex-col transition-transform duration-300 ease-out sm:top-16",
            mobileOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <nav
            className="site-mobile-nav-links flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-5"
            aria-label="Mobile navigation"
          >
            <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
              Explore
            </p>
            <div className="site-mobile-nav-grid">
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
                      "site-mobile-nav-link",
                      isActive && "site-mobile-nav-link-active",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="site-mobile-nav-footer shrink-0 border-t border-white/10 px-4 py-4">
            <Link
              href="/workspace"
              className="mb-3 flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-[#a3c9a8]"
            >
              Client Workspace
            </Link>
            <Button href="/contact" variant="primary" className="w-full min-h-[48px]">
              Start a Project
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

}
