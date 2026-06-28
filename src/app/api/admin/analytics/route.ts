import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: events, error } = await auth.supabase!
    .from("analytics")
    .select("event_type, page_path, created_at")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const pageViews: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const topPages: Record<string, number> = {};

  events?.forEach((e) => {
    eventCounts[e.event_type] = (eventCounts[e.event_type] ?? 0) + 1;
    if (e.event_type === "page_view" && e.page_path) {
      const day = e.created_at.slice(0, 10);
      pageViews[day] = (pageViews[day] ?? 0) + 1;
      topPages[e.page_path] = (topPages[e.page_path] ?? 0) + 1;
    }
  });

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  const sortedPages = Object.entries(topPages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return NextResponse.json({
    totalEvents: events?.length ?? 0,
    pageViewLabels: last14Days.map((d) =>
      new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    pageViewData: last14Days.map((d) => pageViews[d] ?? 0),
    eventLabels: Object.keys(eventCounts),
    eventData: Object.values(eventCounts),
    topPageLabels: sortedPages.map(([p]) => p),
    topPageData: sortedPages.map(([, c]) => c),
  });
}
