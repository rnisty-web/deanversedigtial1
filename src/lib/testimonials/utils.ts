import { formatRelativeTime, pct } from "@/lib/invoices/utils";

export { pct };

export type TestimonialRecord = {
  id: string;
  client_name: string;
  client_company: string | null;
  client_image: string | null;
  content: string;
  rating: number | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type TestimonialTab = "all" | "published" | "draft" | "featured";

export type TestimonialStats = {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  avgRating: string;
};

export type RatingBucket = {
  stars: number;
  count: number;
  pct: string;
};

export function averageRating(items: TestimonialRecord[]) {
  if (items.length === 0) return "—";
  const sum = items.reduce((acc, i) => acc + (i.rating ?? 5), 0);
  return (sum / items.length).toFixed(1);
}

export function computeTestimonialStats(items: TestimonialRecord[]): TestimonialStats {
  const total = items.length;
  const published = items.filter((i) => i.published).length;
  const drafts = items.filter((i) => !i.published).length;
  const featured = items.filter((i) => i.featured).length;
  return { total, published, drafts, featured, avgRating: averageRating(items) };
}

export function monthGrowthHint(items: TestimonialRecord[]) {
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
    return thisMonth > 0 ? `+ ${thisMonth} this month` : "No new reviews this month";
  }
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const sign = growth >= 0 ? "+" : "";
  return `${sign} ${growth}% this month`;
}

export function countByRating(items: TestimonialRecord[]): RatingBucket[] {
  const total = items.length;
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = items.filter((i) => (i.rating ?? 5) === stars).length;
    return { stars, count, pct: pct(count, total) };
  });
}

export function buildTestimonialActivity(items: TestimonialRecord[], limit = 5) {
  return [...items]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      name: item.client_name,
      company: item.client_company,
      rating: item.rating ?? 5,
      status: item.published ? ("Published" as const) : ("Draft" as const),
      featured: item.featured,
      when: formatRelativeTime(item.updated_at),
    }));
}

export function filterTestimonials(
  items: TestimonialRecord[],
  opts: {
    search: string;
    statusFilter: TestimonialTab;
    ratingFilter: string;
    timeFilter: string;
  },
) {
  const q = opts.search.trim().toLowerCase();
  const now = Date.now();

  return items.filter((item) => {
    if (opts.statusFilter === "published" && !item.published) return false;
    if (opts.statusFilter === "draft" && item.published) return false;
    if (opts.statusFilter === "featured" && !item.featured) return false;

    if (opts.ratingFilter !== "all") {
      const r = parseInt(opts.ratingFilter, 10);
      if ((item.rating ?? 5) !== r) return false;
    }

    if (opts.timeFilter !== "all") {
      const updated = new Date(item.updated_at ?? item.created_at).getTime();
      const days =
        opts.timeFilter === "30d" ? 30 : opts.timeFilter === "90d" ? 90 : opts.timeFilter === "year" ? 365 : 0;
      if (days && now - updated > days * 86400000) return false;
    }

    if (!q) return true;
    return [item.client_name, item.client_company, item.content]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });
}
