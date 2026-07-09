import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  fallbackCaseStudies,
  fallbackPortfolio,
  fallbackTestimonials,
} from "@/lib/data/fallbacks";
import type { PortfolioItem, Testimonial } from "@/types";

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

type FeaturedQueryOptions = {
  /** When false, return an empty list instead of demo fallback content. */
  useFallback?: boolean;
};

async function fetchFeaturedPortfolio(limit: number): Promise<PortfolioItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PortfolioItem[];
}

async function fetchFeaturedTestimonials(limit: number): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

async function fetchPortfolioItems(): Promise<PortfolioItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PortfolioItem[];
}

async function fetchPortfolioBySlug(slug: string): Promise<PortfolioItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) throw error;
  return (data as PortfolioItem | null) ?? null;
}

async function fetchTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Testimonial[];
}

const getCachedPortfolioItems = unstable_cache(
  fetchPortfolioItems,
  ["portfolio-items"],
  { tags: ["portfolio"], revalidate: 60 },
);

const getCachedTestimonials = unstable_cache(
  fetchTestimonials,
  ["testimonials-items"],
  { tags: ["testimonials"], revalidate: 60 },
);

export async function getFeaturedPortfolio(
  limit = 3,
  options: FeaturedQueryOptions = {},
): Promise<PortfolioItem[]> {
  const useFallback = options.useFallback ?? !hasSupabaseConfig();
  const featuredFallback = fallbackPortfolio
    .filter((item) => item.featured)
    .slice(0, limit);

  if (!hasSupabaseConfig()) {
    return useFallback ? featuredFallback : [];
  }

  try {
    const data = await fetchFeaturedPortfolio(limit);
    if (!data.length) {
      return useFallback ? featuredFallback : [];
    }
    return data;
  } catch {
    return useFallback ? featuredFallback : [];
  }
}

export async function getFeaturedTestimonials(
  limit = 3,
  options: FeaturedQueryOptions = {},
): Promise<Testimonial[]> {
  const useFallback = options.useFallback ?? !hasSupabaseConfig();
  const featuredFallback = fallbackTestimonials
    .filter((item) => item.featured)
    .slice(0, limit);

  if (!hasSupabaseConfig()) {
    return useFallback ? featuredFallback : [];
  }

  try {
    const data = await fetchFeaturedTestimonials(limit);
    if (!data.length) {
      return useFallback ? featuredFallback : [];
    }
    return data;
  } catch {
    return useFallback ? featuredFallback : [];
  }
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (!hasSupabaseConfig()) {
    return fallbackPortfolio;
  }

  try {
    return await getCachedPortfolioItems();
  } catch {
    return [];
  }
}

export async function getPortfolioBySlug(
  slug: string,
): Promise<PortfolioItem | null> {
  if (!hasSupabaseConfig()) {
    return fallbackPortfolio.find((item) => item.slug === slug) ?? null;
  }

  try {
    return await fetchPortfolioBySlug(slug);
  } catch {
    return null;
  }
}

export function getCaseStudyDetails(slug: string) {
  if (hasSupabaseConfig()) {
    return null;
  }
  return fallbackCaseStudies[slug] ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!hasSupabaseConfig()) {
    return fallbackTestimonials;
  }

  try {
    return await getCachedTestimonials();
  } catch {
    return [];
  }
}

export async function getAllPortfolioSlugs(): Promise<string[]> {
  if (!hasSupabaseConfig()) {
    return fallbackPortfolio.map((item) => item.slug);
  }

  try {
    const items = await fetchPortfolioItems();
    return items.map((item) => item.slug);
  } catch {
    return [];
  }
}
