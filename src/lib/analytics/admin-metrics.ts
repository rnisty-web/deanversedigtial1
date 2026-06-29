export type AnalyticsPeriod = "7d" | "30d" | "90d" | "month";

export type AnalyticsRow = {
  event_type: string;
  page_path: string | null;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type LeadRow = {
  status: string;
  source: string | null;
  name?: string;
  created_at: string;
};

export type InvoiceRow = {
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
};

export type PeriodRange = {
  start: Date;
  end: Date;
  compareStart: Date;
  compareEnd: Date;
  label: string;
  compareLabel: string;
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  lost: "Lost",
};

export function parseAnalyticsPeriod(value: string | null): AnalyticsPeriod {
  if (value === "7d" || value === "30d" || value === "90d" || value === "month") {
    return value;
  }
  return "month";
}

export function getPeriodRange(period: AnalyticsPeriod, now = new Date()): PeriodRange {
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const compareMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const compareYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const compareStart = new Date(compareYear, compareMonth, 1);
    compareStart.setHours(0, 0, 0, 0);
    const compareEnd = new Date(compareYear, compareMonth + 1, 0);
    compareEnd.setHours(23, 59, 59, 999);

    return {
      start,
      end,
      compareStart,
      compareEnd,
      label: formatRangeLabel(start, end),
      compareLabel: formatRangeLabel(compareStart, compareEnd),
    };
  }

  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const compareEnd = new Date(start);
  compareEnd.setDate(compareEnd.getDate() - 1);
  compareEnd.setHours(23, 59, 59, 999);
  const compareStart = new Date(compareEnd);
  compareStart.setDate(compareStart.getDate() - (days - 1));
  compareStart.setHours(0, 0, 0, 0);

  return {
    start,
    end,
    compareStart,
    compareEnd,
    label: formatRangeLabel(start, end),
    compareLabel: formatRangeLabel(compareStart, compareEnd),
  };
}

export function formatRangeLabel(start: Date, end: Date) {
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

export function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function normalizeSource(source: string | null) {
  const value = source?.trim();
  if (!value) return "Website Form";
  return value;
}

export function getDaysInRange(start: Date, end: Date) {
  const days: string[] = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);

  while (cursor <= endDay) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function computeTrafficMetrics(events: AnalyticsRow[]) {
  const pageViews = events.filter((event) => event.event_type === "page_view");
  const sessions = new Map<string, number>();

  pageViews.forEach((event) => {
    if (!event.session_id) return;
    sessions.set(event.session_id, (sessions.get(event.session_id) ?? 0) + 1);
  });

  const sessionCounts = [...sessions.values()];
  const bounceSessions = sessionCounts.filter((count) => count === 1).length;
  const totalSessions = sessions.size;
  const avgPagesPerSession =
    totalSessions > 0 ? Math.round((pageViews.length / totalSessions) * 10) / 10 : 0;
  const bounceRate =
    totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 1000) / 10 : 0;

  return {
    totalVisitors: pageViews.length,
    uniqueVisitors: totalSessions,
    pageViews: pageViews.length,
    avgPagesPerSession,
    bounceRate,
  };
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

function buildHourlySeries(events: AnalyticsRow[]) {
  const hours = Array.from({ length: 24 }, (_, hour) => hour);
  const counts = new Array(24).fill(0);

  events.forEach((event) => {
    if (event.event_type !== "page_view") return;
    const hour = new Date(event.created_at).getHours();
    counts[hour] += 1;
  });

  return {
    labels: hours.map((hour) => {
      const date = new Date();
      date.setHours(hour, 0, 0, 0);
      return date.toLocaleTimeString("en-US", { hour: "numeric" });
    }),
    data: counts,
    peakHour: counts.indexOf(Math.max(...counts, 0)),
  };
}

function buildDeviceBreakdown(events: AnalyticsRow[]) {
  const counts: Record<string, number> = {
    Desktop: 0,
    Mobile: 0,
    Tablet: 0,
    Unknown: 0,
  };

  events.forEach((event) => {
    if (event.event_type !== "page_view") return;
    const device =
      typeof event.metadata?.device === "string" ? event.metadata.device : "Unknown";
    counts[device] = (counts[device] ?? 0) + 1;
  });

  const entries = Object.entries(counts).filter(([, count]) => count > 0);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return entries.map(([device, count]) => ({
    device,
    count,
    percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  }));
}

function buildEntryPages(events: AnalyticsRow[]) {
  const firstBySession = new Map<string, { path: string; at: string }>();

  events
    .filter((event) => event.event_type === "page_view" && event.page_path && event.session_id)
    .forEach((event) => {
      const existing = firstBySession.get(event.session_id!);
      if (!existing || event.created_at < existing.at) {
        firstBySession.set(event.session_id!, { path: event.page_path!, at: event.created_at });
      }
    });

  const counts: Record<string, number> = {};
  firstBySession.forEach(({ path }) => {
    counts[path] = (counts[path] ?? 0) + 1;
  });

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8);
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);

  return sorted.map(([path, count]) => ({
    path,
    views: count,
    percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  }));
}

function buildTopPages(events: AnalyticsRow[]) {
  const topPages: Record<string, number> = {};

  events.forEach((event) => {
    if (event.event_type !== "page_view" || !event.page_path) return;
    topPages[event.page_path] = (topPages[event.page_path] ?? 0) + 1;
  });

  const sorted = Object.entries(topPages).sort(([, a], [, b]) => b - a).slice(0, 8);
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);

  return sorted.map(([path, views]) => ({
    path,
    views,
    percentage: total > 0 ? Math.round((views / total) * 1000) / 10 : 0,
  }));
}

function buildLeadStatusBreakdown(leads: LeadRow[]) {
  const counts: Record<string, number> = {};
  leads.forEach((lead) => {
    counts[lead.status] = (counts[lead.status] ?? 0) + 1;
  });

  return Object.entries(counts).map(([status, count]) => ({
    status,
    label: LEAD_STATUS_LABELS[status] ?? status,
    count,
  }));
}

function sumPaidRevenue(invoices: InvoiceRow[], start: Date, end: Date) {
  return invoices
    .filter((invoice) => {
      if (invoice.status !== "paid" || !invoice.paid_at) return false;
      const paidAt = new Date(invoice.paid_at);
      return paidAt >= start && paidAt <= end;
    })
    .reduce((sum, invoice) => sum + Number(invoice.amount ?? 0), 0);
}

function buildRecentActivity(events: AnalyticsRow[], leads: LeadRow[]) {
  const activity = [
    ...events
      .filter((event) => event.event_type === "page_view" && event.page_path)
      .slice(-20)
      .map((event) => ({
        type: "page_view" as const,
        label: "Page view",
        detail: event.page_path ?? "/",
        timestamp: event.created_at,
      })),
    ...leads.slice(-20).map((lead) => ({
      type: "lead" as const,
      label: "New lead",
      detail: lead.name?.trim() || "Website inquiry",
      timestamp: lead.created_at,
    })),
  ];

  return activity
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 12);
}

function buildInsights(input: {
  trafficChange: number;
  leadsChange: number;
  conversionRate: number;
  topPage?: string;
  peakHour: number;
  deviceBreakdown: { device: string; percentage: number }[];
  revenue: number;
  revenueChange: number;
}) {
  const insights: string[] = [];

  if (input.trafficChange > 0) {
    insights.push(`Traffic is up ${input.trafficChange}% versus the previous period.`);
  } else if (input.trafficChange < 0) {
    insights.push(`Traffic is down ${Math.abs(input.trafficChange)}% versus the previous period.`);
  }

  if (input.leadsChange > 0) {
    insights.push(`Lead volume increased ${input.leadsChange}% compared to last period.`);
  }

  if (input.conversionRate > 0) {
    insights.push(`Visitor-to-lead conversion rate is ${input.conversionRate}%.`);
  }

  if (input.topPage) {
    insights.push(`Most viewed page: ${input.topPage}.`);
  }

  if (input.peakHour >= 0) {
    const date = new Date();
    date.setHours(input.peakHour, 0, 0, 0);
    insights.push(
      `Peak traffic hour: ${date.toLocaleTimeString("en-US", { hour: "numeric" })}.`,
    );
  }

  const topDevice = [...input.deviceBreakdown].sort((a, b) => b.percentage - a.percentage)[0];
  if (topDevice && topDevice.percentage > 0) {
    insights.push(`${topDevice.device} accounts for ${topDevice.percentage}% of page views.`);
  }

  if (input.revenue > 0) {
    insights.push(
      `Paid revenue this period: $${input.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${input.revenueChange !== 0 ? ` (${input.revenueChange >= 0 ? "+" : ""}${input.revenueChange}% vs prior)` : ""}.`,
    );
  }

  return insights.slice(0, 5);
}

export function buildAdminAnalyticsPayload(input: {
  period: AnalyticsPeriod;
  currentEvents: AnalyticsRow[];
  previousEvents: AnalyticsRow[];
  currentLeads: LeadRow[];
  previousLeads: LeadRow[];
  invoices: InvoiceRow[];
  range: PeriodRange;
}) {
  const { period, currentEvents, previousEvents, currentLeads, previousLeads, invoices, range } =
    input;

  const daysInPeriod = getDaysInRange(range.start, range.end);
  const currentTraffic = computeTrafficMetrics(currentEvents);
  const previousTraffic = computeTrafficMetrics(previousEvents);

  const leadsGenerated = currentLeads.length;
  const previousLeadsGenerated = previousLeads.length;

  const conversionRate =
    currentTraffic.uniqueVisitors > 0
      ? Math.round((leadsGenerated / currentTraffic.uniqueVisitors) * 10000) / 100
      : 0;
  const previousConversionRate =
    previousTraffic.uniqueVisitors > 0
      ? Math.round((previousLeadsGenerated / previousTraffic.uniqueVisitors) * 10000) / 100
      : 0;

  const dailyTraffic = buildDailySeries(currentEvents, daysInPeriod);
  const leadsOverTime = buildLeadDailySeries(currentLeads, daysInPeriod);
  const hourlyTraffic = buildHourlySeries(currentEvents);

  const leadsBySourceMap: Record<string, number> = {};
  currentLeads.forEach((lead) => {
    const source = normalizeSource(lead.source);
    leadsBySourceMap[source] = (leadsBySourceMap[source] ?? 0) + 1;
  });

  const qualifiedStatuses = new Set(["qualified", "converted"]);
  const qualifiedLeads = currentLeads.filter((lead) => qualifiedStatuses.has(lead.status)).length;
  const convertedLeads = currentLeads.filter((lead) => lead.status === "converted").length;

  const conversionFunnel = [
    { stage: "Visitors", count: currentTraffic.uniqueVisitors },
    { stage: "Leads", count: leadsGenerated },
    { stage: "Qualified", count: qualifiedLeads },
    { stage: "Clients", count: convertedLeads },
  ];

  const eventCounts: Record<string, number> = {};
  currentEvents.forEach((event) => {
    eventCounts[event.event_type] = (eventCounts[event.event_type] ?? 0) + 1;
  });

  const last14Days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(range.end);
    date.setDate(date.getDate() - (13 - index));
    return date.toISOString().slice(0, 10);
  });

  const pageViewsByDay: Record<string, number> = {};
  currentEvents.forEach((event) => {
    if (event.event_type !== "page_view") return;
    const day = dayKey(event.created_at);
    pageViewsByDay[day] = (pageViewsByDay[day] ?? 0) + 1;
  });

  const revenue = sumPaidRevenue(invoices, range.start, range.end);
  const previousRevenue = sumPaidRevenue(invoices, range.compareStart, range.compareEnd);

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
    {
      key: "revenue",
      label: "Paid Revenue",
      thisPeriod: Math.round(revenue),
      previousPeriod: Math.round(previousRevenue),
      change: percentChange(revenue, previousRevenue),
      trend: leadsOverTime.slice(-7),
      suffix: "$",
      prefix: true,
    },
    {
      key: "avgPagesPerSession",
      label: "Pages / Session",
      thisPeriod: currentTraffic.avgPagesPerSession,
      previousPeriod: previousTraffic.avgPagesPerSession,
      change: percentChange(currentTraffic.avgPagesPerSession, previousTraffic.avgPagesPerSession),
      trend: dailyTraffic.visitors.slice(-7),
    },
    {
      key: "bounceRate",
      label: "Bounce Rate",
      thisPeriod: currentTraffic.bounceRate,
      previousPeriod: previousTraffic.bounceRate,
      change: percentChange(currentTraffic.bounceRate, previousTraffic.bounceRate),
      trend: dailyTraffic.uniqueVisitors.slice(-7),
      suffix: "%",
      invertTrend: true,
    },
  ];

  const topPages = buildTopPages(currentEvents);
  const entryPages = buildEntryPages(currentEvents);
  const deviceBreakdown = buildDeviceBreakdown(currentEvents);
  const leadStatusBreakdown = buildLeadStatusBreakdown(currentLeads);
  const recentActivity = buildRecentActivity(currentEvents, currentLeads);

  const insights = buildInsights({
    trafficChange: percentChange(currentTraffic.pageViews, previousTraffic.pageViews),
    leadsChange: percentChange(leadsGenerated, previousLeadsGenerated),
    conversionRate,
    topPage: topPages[0]?.path,
    peakHour: hourlyTraffic.peakHour,
    deviceBreakdown,
    revenue,
    revenueChange: percentChange(revenue, previousRevenue),
  });

  return {
    period,
    totalEvents: currentEvents.length,
    pageViewLabels: last14Days.map((day) =>
      new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    pageViewData: last14Days.map((day) => pageViewsByDay[day] ?? 0),
    eventLabels: Object.keys(eventCounts),
    eventData: Object.values(eventCounts),
    periodLabel: range.label,
    comparePeriodLabel: range.compareLabel,
    totalVisitors: currentTraffic.totalVisitors,
    uniqueVisitors: currentTraffic.uniqueVisitors,
    pageViews: currentTraffic.pageViews,
    leadsGenerated,
    conversionRate,
    revenue,
    avgPagesPerSession: currentTraffic.avgPagesPerSession,
    bounceRate: currentTraffic.bounceRate,
    changes: {
      totalVisitors: percentChange(currentTraffic.totalVisitors, previousTraffic.totalVisitors),
      uniqueVisitors: percentChange(currentTraffic.uniqueVisitors, previousTraffic.uniqueVisitors),
      pageViews: percentChange(currentTraffic.pageViews, previousTraffic.pageViews),
      leadsGenerated: percentChange(leadsGenerated, previousLeadsGenerated),
      conversionRate: percentChange(conversionRate, previousConversionRate),
      revenue: percentChange(revenue, previousRevenue),
      avgPagesPerSession: percentChange(
        currentTraffic.avgPagesPerSession,
        previousTraffic.avgPagesPerSession,
      ),
      bounceRate: percentChange(currentTraffic.bounceRate, previousTraffic.bounceRate),
    },
    trafficLabels: daysInPeriod.map((day) =>
      new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    trafficVisitors: dailyTraffic.visitors,
    trafficUniqueVisitors: dailyTraffic.uniqueVisitors,
    leadsOverTimeLabels: daysInPeriod.map((day) =>
      new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    leadsOverTime,
    leadsBySourceLabels: Object.keys(leadsBySourceMap),
    leadsBySourceData: Object.values(leadsBySourceMap),
    leadStatusLabels: leadStatusBreakdown.map((item) => item.label),
    leadStatusData: leadStatusBreakdown.map((item) => item.count),
    conversionFunnel,
    performanceMetrics,
    topPages,
    entryPages,
    deviceBreakdown,
    hourlyTrafficLabels: hourlyTraffic.labels,
    hourlyTrafficData: hourlyTraffic.data,
    recentActivity,
    insights,
  };
}
