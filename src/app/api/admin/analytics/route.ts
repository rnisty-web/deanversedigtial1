import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";
import {
  buildAdminAnalyticsPayload,
  getPeriodRange,
  parseAnalyticsPeriod,
  type AnalyticsRow,
  type InvoiceRow,
  type LeadRow,
} from "@/lib/analytics/admin-metrics";

export async function GET(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const period = parseAnalyticsPeriod(searchParams.get("period"));
  const range = getPeriodRange(period);

  const [
    { data: currentEvents, error: eventsError },
    { data: previousEvents },
    { data: currentLeads },
    { data: previousLeads },
    { data: invoices },
  ] = await Promise.all([
    auth.supabase!
      .from("analytics")
      .select("event_type, page_path, session_id, metadata, created_at")
      .gte("created_at", range.start.toISOString())
      .lte("created_at", range.end.toISOString())
      .order("created_at", { ascending: true }),
    auth.supabase!
      .from("analytics")
      .select("event_type, page_path, session_id, metadata, created_at")
      .gte("created_at", range.compareStart.toISOString())
      .lte("created_at", range.compareEnd.toISOString()),
    auth.supabase!
      .from("leads")
      .select("status, source, name, created_at")
      .gte("created_at", range.start.toISOString())
      .lte("created_at", range.end.toISOString())
      .order("created_at", { ascending: true }),
    auth.supabase!
      .from("leads")
      .select("status, source, name, created_at")
      .gte("created_at", range.compareStart.toISOString())
      .lte("created_at", range.compareEnd.toISOString()),
    auth.supabase!
      .from("invoices")
      .select("amount, status, paid_at, created_at")
      .eq("status", "paid")
      .not("paid_at", "is", null)
      .gte("paid_at", range.compareStart.toISOString())
      .lte("paid_at", range.end.toISOString()),
  ]);

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  const payload = buildAdminAnalyticsPayload({
    period,
    currentEvents: (currentEvents ?? []) as AnalyticsRow[],
    previousEvents: (previousEvents ?? []) as AnalyticsRow[],
    currentLeads: (currentLeads ?? []) as LeadRow[],
    previousLeads: (previousLeads ?? []) as LeadRow[],
    invoices: (invoices ?? []) as InvoiceRow[],
    range,
  });

  return NextResponse.json(payload);
}
