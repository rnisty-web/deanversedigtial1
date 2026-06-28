import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { siteConfig } from "@/lib/constants";

export const revalidate = 3600;

const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/portfolio", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/testimonials", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/experience", changeFrequency: "monthly", priority: 0.7 },
  { path: "/education", changeFrequency: "monthly", priority: 0.6 },
  { path: "/hire-me", changeFrequency: "monthly", priority: 0.8 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

function getBaseUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}

async function getPublishedPortfolioSlugs(): Promise<
  Array<{ slug: string; updated_at: string }>
> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase
    .from("portfolio")
    .select("slug, updated_at")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  const portfolio = await getPublishedPortfolioSlugs();

  const portfolioEntries: MetadataRoute.Sitemap = portfolio.map((item) => ({
    url: `${baseUrl}/portfolio/${item.slug}`,
    lastModified: item.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...portfolioEntries];
}
