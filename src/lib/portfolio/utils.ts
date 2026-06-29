import type { PortfolioCaseStudy } from "@/types";
import { formatRelativeTime, pct } from "@/lib/invoices/utils";

export { pct };

export type PortfolioRecord = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  tags: string[];
  industry: string | null;
  case_study: PortfolioCaseStudy | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PortfolioTab = "all" | "published" | "draft" | "featured";

export type PortfolioStats = {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  categories: number;
};

export type PortfolioCategoryCount = {
  name: string;
  count: number;
  pct: string;
};

export function computePortfolioStats(
  items: PortfolioRecord[],
  categoryCount: number,
): PortfolioStats {
  const total = items.length;
  const published = items.filter((i) => i.published).length;
  const drafts = items.filter((i) => !i.published).length;
  const featured = items.filter((i) => i.featured).length;
  return { total, published, drafts, featured, categories: categoryCount };
}

export function monthGrowthHint(items: PortfolioRecord[]) {
  const now = new Date();
  const thisMonth = items.filter((i) => {
    const d = new Date(i.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = items.filter((i) => {
    const d = new Date(i.created_at);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  }).length;
  if (lastMonth === 0) {
    return thisMonth > 0 ? `+ ${thisMonth} this month` : "No new projects this month";
  }
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const sign = growth >= 0 ? "+" : "";
  return `${sign} ${growth}% this month`;
}

export function countByIndustry(items: PortfolioRecord[], limit = 6): PortfolioCategoryCount[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = item.industry?.trim() || "Uncategorized";
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  const total = items.length;
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
      pct: pct(count, total),
    }));
}

export function buildPortfolioActivity(items: PortfolioRecord[], limit = 5) {
  return [...items]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      title: item.title,
      status: item.published ? ("Published" as const) : ("Draft" as const),
      featured: item.featured,
      when: formatRelativeTime(item.updated_at),
    }));
}

export function filterPortfolioItems(
  items: PortfolioRecord[],
  opts: {
    search: string;
    categoryFilter: string;
    tagFilter: string;
    statusFilter: PortfolioTab;
    timeFilter: string;
  },
) {
  const q = opts.search.trim().toLowerCase();
  const now = Date.now();

  return items.filter((item) => {
    if (opts.categoryFilter !== "all" && item.industry !== opts.categoryFilter) return false;
    if (opts.tagFilter !== "all" && !item.tags.includes(opts.tagFilter)) return false;
    if (opts.statusFilter === "published" && !item.published) return false;
    if (opts.statusFilter === "draft" && item.published) return false;
    if (opts.statusFilter === "featured" && !item.featured) return false;

    if (opts.timeFilter !== "all") {
      const updated = new Date(item.updated_at).getTime();
      const days =
        opts.timeFilter === "30d" ? 30 : opts.timeFilter === "90d" ? 90 : opts.timeFilter === "year" ? 365 : 0;
      if (days && now - updated > days * 86400000) return false;
    }

    if (!q) return true;
    return [item.title, item.description, item.industry, item.slug, ...item.tags]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });
}
