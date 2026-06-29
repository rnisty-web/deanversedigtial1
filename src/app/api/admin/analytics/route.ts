import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";

type AnalyticsRow = {
  event_type: string;
  page_path: string | null;
  session_id: string | null;
  created_at: string;
};

type LeadRow = {
  status: string;
  source: string | null;
  created_at: string;
};

function monthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, month + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatRangeLabel(start: Date, end: Date) {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startFmt = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  const endFmt = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startFmt} – ${endFmt}`;
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function computeTrafficMetrics(events: AnalyticsRow[]) {
  const pageViews = events.filter((e) => e.event_type === "page_view");
  const sessions = new Set(pageViews.map((e) => e.session_id).filter(Boolean));

  return {
    totalVisitors: pageViews.length,
    uniqueVisitors: sessions.size,
    pageViews: pageViews.length,
  };
}

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function normalizeSource(source: string | null) {
  const value = source?.trim();
  if (!value) return "Website Form";
  return value;
}

function buildDailySeries(events: AnalyticsRow[], days: string[]) {
  const visitorsByDay: Record<string, number> = {};
  const uniqueByDay: Record<string, Set<string>> = {};

  days.forEach((day) => {
    visitorsByDay[day] = 0;
    uniqueByDay[day] = new Set();
  });

  events.forEach((event) => {
    if (event.event_type !== "page_view") return;
    const day = dayKey(event.created_at);
    if (!(day in visitorsByDay)) return;
    visitorsByDay[day] += 1;
    if (event.session_id) uniqueByDay[day].add(event.session_id);
  });

  return {
    visitors: days.map((day) => visitorsByDay[day] ?? 0),
    uniqueVisitors: days.map((day) => uniqueByDay[day]?.size ?? 0),
  };
}

function buildLeadDailySeries(leads: LeadRow[], days: string[]) {
  const counts: Record<string, number> = {};
  days.forEach((day) => {
    counts[day] = 0;
  });
  leads.forEach((lead) => {
    const day = dayKey(lead.created_at);
    if (day in counts) counts[day] += 1;
  });
  return days.map((day) => counts[day] ?? 0);
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const now = new Date();
  const current = monthRange(now.getFullYear(), now.getMonth());
  const previous = monthRange(
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
    now.getMonth() === 0 ? 11 : now.getMonth() - 1,
  );

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const [
    { data: currentEvents, error: eventsError },
    { data: previousEvents },
    { data: currentLeads },
    { data: previousLeads },
    { data: allTimeEvents },
  ] = await Promise.all([
    auth.supabase!
      .from("analytics")
      .select("event_type, page_path, session_id, created_at")
      .gte("created_at", current.start.toISOString())
      .lte("created_at", current.end.toISOString())
      .order("created_at", { ascending: true }),
    auth.supabase!
      .from("analytics")
      .select("event_type, page_path, session_id, created_at")
      .gte("created_at", previous.start.toISOString())
      .lte("created_at", previous.end.toISOString()),
    auth.supabase!
      .from("leads")
      .select("status, source, created_at")
      .gte("created_at", current.start.toISOString())
      .lte("created_at", current.end.toISOString()),
    auth.supabase!
      .from("leads")
      .select("status, source, created_at")
      .gte("created_at", previous.start.toISOString())
      .lte("created_at", previous.end.toISOString()),
    auth.supabase!
      .from("analytics")
      .select("event_type, page_path, created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true }),
  ]);

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  const currentEventRows = (currentEvents ?? []) as AnalyticsRow[];
  const previousEventRows = (previousEvents ?? []) as AnalyticsRow[];
  const currentLeadRows = (currentLeads ?? []) as LeadRow[];
  const previousLeadRows = (previousLeads ?? []) as LeadRow[];
  const legacyEvents = allTimeEvents ?? [];

  const currentTraffic = computeTrafficMetrics(currentEventRows);
  const previousTraffic = computeTrafficMetrics(previousEventRows);

  const leadsGenerated = currentLeadRows.length;
  const previousLeadsGenerated = previousLeadRows.length;

  const conversionRate =
    currentTraffic.uniqueVisitors > 0
      ? Math.round((leadsGenerated / currentTraffic.uniqueVisitors) * 10000) / 100
      : 0;
  const previousConversionRate =
    previousTraffic.uniqueVisitors > 0
      ? Math.round((previousLeadsGenerated / previousTraffic.uniqueVisitors) * 10000) / 100
      : 0;

  const daysInMonth = Array.from({ length: now.getDate() }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
    return d.toISOString().slice(0, 10);
  });

  const dailyTraffic = buildDailySeries(currentEventRows, daysInMonth);
  const leadsOverTime = buildLeadDailySeries(currentLeadRows, daysInMonth);

  const leadsBySourceMap: Record<string, number> = {};
  currentLeadRows.forEach((lead) => {
    const source = normalizeSource(lead.source);
    leadsBySourceMap[source] = (leadsBySourceMap[source] ?? 0) + 1;
  });

  const qualifiedStatuses = new Set(["qualified", "converted"]);
  const qualifiedLeads = currentLeadRows.filter((l) => qualifiedStatuses.has(l.status)).length;
  const convertedLeads = currentLeadRows.filter((l) => l.status === "converted").length;

  const conversionFunnel = [
    { stage: "Visitors", count: currentTraffic.uniqueVisitors },
    { stage: "Leads", count: leadsGenerated },
    { stage: "Qualified", count: qualifiedLeads },
    { stage: "Clients", count: convertedLeads },
  ];

  const pageViews: Record<string, number> = {};
  const eventCounts: Record<string, number> = {};
  const topPages: Record<string, number> = {};

  legacyEvents.forEach((e) => {
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

  const totalTopPageViews = sortedPages.reduce((sum, [, count]) => sum + count, 0);

  const performanceMetrics = [
    {
      key: "totalVisitors",
      label: "Total Visitors",
      thisPeriod: currentTraffic.totalVisitors,
      previousPeriod: previousTraffic.totalVisitors,
      change: percentChange(currentTraffic.totalVisitors, previousTraffic.totalVisitors),
      trend: dailyTraffic.visitors.slice(-7),
    },
    {
      key: "uniqueVisitors",
      label: "Unique Visitors",
      thisPeriod: currentTraffic.uniqueVisitors,
      previousPeriod: previousTraffic.uniqueVisitors,
      change: percentChange(currentTraffic.uniqueVisitors, previousTraffic.uniqueVisitors),
      trend: dailyTraffic.uniqueVisitors.slice(-7),
    },
    {
      key: "pageViews",
      label: "Page Views",
      thisPeriod: currentTraffic.pageViews,
      previousPeriod: previousTraffic.pageViews,
      change: percentChange(currentTraffic.pageViews, previousTraffic.pageViews),
      trend: dailyTraffic.visitors.slice(-7),
    },
    {
      key: "leadsGenerated",
      label: "Leads Generated",
      thisPeriod: leadsGenerated,
      previousPeriod: previousLeadsGenerated,
      change: percentChange(leadsGenerated, previousLeadsGenerated),
      trend: leadsOverTime.slice(-7),
    },
    {
      key: "conversionRate",
      label: "Conversion Rate",
      thisPeriod: conversionRate,
      previousPeriod: previousConversionRate,
      change: percentChange(conversionRate, previousConversionRate),
      trend: leadsOverTime.slice(-7),
      suffix: "%",
    },
  ];

  return NextResponse.json({
    totalEvents: legacyEvents.length,
    pageViewLabels: last14Days.map((d) =>
      new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    pageViewData: last14Days.map((d) => pageViews[d] ?? 0),
    eventLabels: Object.keys(eventCounts),
    eventData: Object.values(eventCounts),
    topPageLabels: sortedPages.map(([p]) => p),
    topPageData: sortedPages.map(([, c]) => c),
    periodLabel: formatRangeLabel(current.start, current.end),
    comparePeriodLabel: formatRangeLabel(previous.start, previous.end),
    totalVisitors: currentTraffic.totalVisitors,
    uniqueVisitors: currentTraffic.uniqueVisitors,
    pageViews: currentTraffic.pageViews,
    leadsGenerated,
    conversionRate,
    changes: {
      totalVisitors: percentChange(currentTraffic.totalVisitors, previousTraffic.totalVisitors),
      uniqueVisitors: percentChange(currentTraffic.uniqueVisitors, previousTraffic.uniqueVisitors),
      pageViews: percentChange(currentTraffic.pageViews, previousTraffic.pageViews),
      leadsGenerated: percentChange(leadsGenerated, previousLeadsGenerated),
      conversionRate: percentChange(conversionRate, previousConversionRate),
    },
    trafficLabels: daysInMonth.map((d) =>
      new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    trafficVisitors: dailyTraffic.visitors,
    trafficUniqueVisitors: dailyTraffic.uniqueVisitors,
    leadsOverTimeLabels: daysInMonth.map((d) =>
      new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    leadsOverTime,
    leadsBySourceLabels: Object.keys(leadsBySourceMap),
    leadsBySourceData: Object.values(leadsBySourceMap),
    conversionFunnel,
    performanceMetrics,
    topPages: sortedPages.map(([path, views]) => ({
      path,
      views,
      percentage: totalTopPageViews > 0 ? Math.round((views / totalTopPageViews) * 1000) / 10 : 0,
    })),
    trafficBySourceLabels: Object.keys(leadsBySourceMap),
    trafficBySourceData: Object.values(leadsBySourceMap),
    deviceBreakdown: [],
    topLocations: [],
  });
}
