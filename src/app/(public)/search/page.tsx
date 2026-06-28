import { Suspense } from "react";
import { SearchResults } from "@/components/search/SearchResults";
import { getPortfolioItems } from "@/lib/data/queries";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  title: "Search",
  description: "Search DeanVerse Digital pages and portfolio projects.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage() {
  const portfolio = await getPortfolioItems();

  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Suspense
          fallback={
            <div className="mt-8 h-14 animate-pulse rounded-2xl bg-white/5" />
          }
        >
          <SearchResults portfolio={portfolio} />
        </Suspense>
      </div>
    </section>
  );
}
