"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { searchPages } from "@/lib/search/pages";
import type { PortfolioItem } from "@/types";

type SearchResultsProps = {
  portfolio: PortfolioItem[];
};

export function SearchResults({ portfolio }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const trimmed = query.trim();
  const pageResults = useMemo(() => searchPages(trimmed), [trimmed]);

  const portfolioResults = useMemo(() => {
    if (!trimmed) return [];
    const q = trimmed.toLowerCase();
    return portfolio.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false) ||
        (item.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false),
    );
  }, [portfolio, trimmed]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    router.replace(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const hasQuery = trimmed.length > 0;
  const hasResults = pageResults.length > 0 || portfolioResults.length > 0;

  return (
    <>
      <SectionHeading
        eyebrow="Search"
        title="Find pages and projects"
        subtitle="Search across site pages and portfolio work."
      />

      <Reveal className="mt-8">
        <form onSubmit={handleSubmit}>
          <GlassCard hover={false} padding="sm" className="flex gap-3 p-2">
            <label htmlFor="site-search" className="sr-only">
              Search
            </label>
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, portfolio, tags…"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#a3c9a8]/50 focus:outline-none focus:ring-2 focus:ring-[#a3c9a8]/20"
              autoComplete="off"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#6f8f72] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#5a7560]"
            >
              Search
            </button>
          </GlassCard>
        </form>
      </Reveal>

      {hasQuery && !hasResults && (
        <Reveal className="mt-10">
          <p className="text-center text-white/50">
            No results for &ldquo;{trimmed}&rdquo;. Try different keywords.
          </p>
        </Reveal>
      )}

      {pageResults.length > 0 && (
        <Reveal className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">
            Pages
          </h2>
          <ul className="space-y-3">
            {pageResults.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="block rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl transition-colors hover:border-[#6f8f72]/30 hover:bg-white/[0.06]"
                >
                  <p className="font-medium text-white">{page.label}</p>
                  {page.description && (
                    <p className="mt-1 text-sm text-white/50">{page.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}

      {portfolioResults.length > 0 && (
        <Reveal className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#a3c9a8]">
            Portfolio
          </h2>
          <ul className="space-y-3">
            {portfolioResults.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="block rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl transition-colors hover:border-[#6f8f72]/30 hover:bg-white/[0.06]"
                >
                  <p className="font-medium text-white">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-sm text-white/50">{item.description}</p>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#6f8f72]/20 px-2 py-0.5 text-xs text-[#a3c9a8]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </>
  );
}
