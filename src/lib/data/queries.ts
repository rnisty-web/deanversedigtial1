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

export async function getFeaturedPortfolio(limit = 3): Promise<PortfolioItem[]> {
  const featuredFallback = fallbackPortfolio
    .filter((item) => item.featured)
    .slice(0, limit);

  if (!hasSupabaseConfig()) {
    return featuredFallback;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error || !data?.length) {
      return featuredFallback;
    }

    return data as PortfolioItem[];
  } catch {
    return featuredFallback;
  }
}

export async function getFeaturedTestimonials(limit = 3): Promise<Testimonial[]> {
  const featuredFallback = fallbackTestimonials
    .filter((item) => item.featured)
    .slice(0, limit);

  if (!hasSupabaseConfig()) {
    return featuredFallback;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data?.length) {
      return featuredFallback;
    }

    return data as Testimonial[];
  } catch {
    return featuredFallback;
  }
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  if (!hasSupabaseConfig()) {
    return fallbackPortfolio;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return fallbackPortfolio;
    }

    return data as PortfolioItem[];
  } catch {
    return fallbackPortfolio;
  }
}

export async function getPortfolioBySlug(
  slug: string,
): Promise<PortfolioItem | null> {
  if (!hasSupabaseConfig()) {
    return fallbackPortfolio.find((item) => item.slug === slug) ?? null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (error || !data) {
      return fallbackPortfolio.find((item) => item.slug === slug) ?? null;
    }

    return data as PortfolioItem;
  } catch {
    return fallbackPortfolio.find((item) => item.slug === slug) ?? null;
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return fallbackTestimonials;
    }

    return data as Testimonial[];
  } catch {
    return fallbackTestimonials;
  }
}

export async function getAllPortfolioSlugs(): Promise<string[]> {
  const items = await getPortfolioItems();
  return items.map((item) => item.slug);
}
