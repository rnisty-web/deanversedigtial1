import { NextResponse } from "next/server";
import { getOwnerEmail, isFounder, verifyAdminApi } from "@/lib/auth";
import { normalizeActivityStatus } from "@/lib/activity-status";
import { getPresenceStatus } from "@/lib/presence";
import {
  fetchCurrentProfilePresenceFields,
  fetchDashboardProfiles,
} from "@/lib/supabase/profile-queries";
import { getPrimaryRole, getRoleBadgeClass, getRoleLabel, isFounderRole, parseUserRoles } from "@/lib/roles";

type RecentInvoiceRow = {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
  clients: { name: string } | { name: string }[] | null;
};

type RecentProjectRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  deadline: string | null;
  clients: { name: string } | { name: string }[] | null;
};

type CalendarEventRow = {
  id: string;
  title: string;
  starts_at: string;
  event_type: string;
};

type RecentMessageRow = {
  id: string;
  subject: string;
  read: boolean;
  created_at: string;
  sender: { full_name: string | null; email: string } | { full_name: string | null; email: string }[] | null;
};

type ActivityItem = {
  type: "lead" | "invoice";
  message: string;
  timestamp: string;
};

function resolveClientName(clients: RecentInvoiceRow["clients"]): string {
  if (!clients) return "Unknown client";
  if (Array.isArray(clients)) return clients[0]?.name ?? "Unknown client";
  return clients.name ?? "Unknown client";
}

function buildViewerName(
  fullName: string | null | undefined,
  email: string | null | undefined,
): string {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;
  const prefix = email?.split("@")[0]?.trim();
  if (prefix) return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  return "Admin";
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = auth.supabase!;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const todayDateStr = startOfToday.toISOString().slice(0, 10);
  const ownerEmail = getOwnerEmail();

  const { data: currentProfile, presenceReady: profilePresenceReady } =
    await fetchCurrentProfilePresenceFields(supabase, auth.user!.id);

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", auth.user!.id)
    .single();

  const viewerIsFounder = isFounder(
    currentProfile,
    currentProfile?.email,
    auth.user!.email,
  );

  const viewerName = buildViewerName(
    viewerProfile?.full_name,
    viewerProfile?.email ?? currentProfile?.email ?? auth.user!.email,
  );

  const [
    { count: leadsCount, error: leadsError },
    { count: projectsCount },
    { count: activeProjectsCount },
    { count: clientsCount },
    { count: portfolioCount },
    { count: testimonialsCount },
    { data: recentLeads },
    { data: analytics },
    { data: allLeads },
    { count: unreadMessagesCount },
    { data: allInvoices },
    { data: recentInvoicesRaw },
    { data: recentProjects },
    { data: allProjects },
    { count: leadsThisMonth },
    { data: upcomingProjectsRaw },
    { data: recentPaymentsRaw },
    { data: recentMessagesRaw },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .not("status", "in", '("completed","cancelled")'),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("portfolio").select("*", { count: "exact", head: true }),
    supabase.from("testimonials").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("id, name, email, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("analytics")
      .select("event_type, created_at")
      .gte("created_at", thirtyDaysAgo),
    supabase.from("leads").select("status"),
    supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("read", false),
    supabase.from("invoices").select("amount, status"),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, status, created_at, clients(name)")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("projects")
      .select("id, title, status, created_at, deadline, clients(name)")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("projects").select("status"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("projects")
      .select("id, title, deadline, status, clients(name)")
      .not("deadline", "is", null)
      .gte("deadline", todayDateStr)
      .order("deadline", { ascending: true })
      .limit(6),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, created_at, clients(name)")
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("messages")
      .select(
        "id, subject, read, created_at, sender:profiles!messages_sender_id_fkey(full_name, email)",
      )
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const { data: todayEventsRaw } = await supabase
    .from("calendar_events")
    .select("id, title, starts_at, event_type")
    .gte("starts_at", startOfToday.toISOString())
    .lte("starts_at", endOfToday.toISOString())
    .order("starts_at", { ascending: true })
    .limit(8);

  if (leadsError) {
    return NextResponse.json({ error: leadsError.message }, { status: 500 });
  }

  const { data: profiles, error: profilesError, presenceReady } =
    await fetchDashboardProfiles(supabase);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const leadStatusCounts: Record<string, number> = {};
  allLeads?.forEach((l) => {
    leadStatusCounts[l.status] = (leadStatusCounts[l.status] ?? 0) + 1;
  });

  const projectStatusCounts: Record<string, number> = {};
  allProjects?.forEach((p) => {
    projectStatusCounts[p.status] = (projectStatusCounts[p.status] ?? 0) + 1;
  });

  const totalLeads = leadsCount ?? 0;
  const converted = leadStatusCounts["converted"] ?? 0;
  const conversionRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

  let totalPaidRevenue = 0;
  let pendingInvoiceAmount = 0;
  allInvoices?.forEach((inv) => {
    const amount = Number(inv.amount) || 0;
    if (inv.status === "paid") {
      totalPaidRevenue += amount;
    } else if (inv.status === "sent" || inv.status === "overdue") {
      pendingInvoiceAmount += amount;
    }
  });

  const recentInvoices =
    (recentInvoicesRaw as RecentInvoiceRow[] | null)?.map((inv) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      amount: Number(inv.amount) || 0,
      status: inv.status,
      created_at: inv.created_at,
      client_name: resolveClientName(inv.clients),
    })) ?? [];

  const recentProjectsNormalized =
    (recentProjects as RecentProjectRow[] | null)?.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
    })) ?? [];

  const upcomingDeadlines =
    (upcomingProjectsRaw as RecentProjectRow[] | null)?.map((p) => ({
      id: p.id,
      title: p.title,
      deadline: p.deadline!,
      status: p.status,
      client_name: resolveClientName(p.clients),
    })) ?? [];

  const recentPayments =
    (recentPaymentsRaw as RecentInvoiceRow[] | null)?.map((inv) => ({
      id: inv.id,
      invoice_number: inv.invoice_number,
      amount: Number(inv.amount) || 0,
      client_name: resolveClientName(inv.clients),
      created_at: inv.created_at,
    })) ?? [];

  const todayEvents =
    (todayEventsRaw as CalendarEventRow[] | null)?.map((event) => ({
      id: event.id,
      title: event.title,
      starts_at: event.starts_at,
      event_type: event.event_type,
    })) ?? [];

  const recentMessages =
    (recentMessagesRaw as RecentMessageRow[] | null)?.map((msg) => {
      const sender = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
      return {
        id: msg.id,
        subject: msg.subject,
        read: msg.read,
        created_at: msg.created_at,
        sender_name: sender?.full_name?.trim() || sender?.email?.split("@")[0] || "Unknown",
      };
    }) ?? [];

  const activityFromLeads: ActivityItem[] =
    recentLeads?.map((lead) => ({
      type: "lead" as const,
      message: `New lead from ${lead.name}`,
      timestamp: lead.created_at,
    })) ?? [];

  const activityFromInvoices: ActivityItem[] = recentInvoices.map((inv) => ({
    type: "invoice" as const,
    message: `Invoice ${inv.invoice_number} for ${inv.client_name} (${inv.status.replace(/_/g, " ")})`,
    timestamp: inv.created_at,
  }));

  const recentActivity = [...activityFromLeads, ...activityFromInvoices]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const pageViewsByDay: Record<string, number> = {};
  analytics?.forEach((a) => {
    if (a.event_type === "page_view") {
      const day = a.created_at.slice(0, 10);
      pageViewsByDay[day] = (pageViewsByDay[day] ?? 0) + 1;
    }
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const liveUsers =
    profiles?.map((profile) => {
      const roles = parseUserRoles(profile);
      const isFounderUser =
        isFounderRole(profile) ||
        (profile.email?.trim().toLowerCase() ?? "") === ownerEmail;
      const primaryRole = getPrimaryRole(profile);
      return {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: primaryRole,
        roles,
        roleLabel: roles.map((r) => getRoleLabel(r)).join(", "),
        roleBadgeClass: getRoleBadgeClass(primaryRole),
        isFounder: isFounderUser,
        last_seen_at: profile.last_seen_at,
        activityStatus: normalizeActivityStatus(profile.activity_status),
        presence: getPresenceStatus(profile.last_seen_at),
      };
    }) ?? [];

  liveUsers.sort((a, b) => {
    if (a.isFounder && !b.isFounder) return -1;
    if (!a.isFounder && b.isFounder) return 1;
    const order = { online: 0, away: 1, offline: 2 };
    return order[a.presence] - order[b.presence];
  });

  const newLeadsCount = leadStatusCounts["new"] ?? 0;

  return NextResponse.json({
    leadsCount: totalLeads,
    projectsCount: projectsCount ?? 0,
    activeProjectsCount: activeProjectsCount ?? 0,
    clientsCount: clientsCount ?? 0,
    portfolioCount: portfolioCount ?? 0,
    testimonialsCount: testimonialsCount ?? 0,
    conversionRate,
    recentLeads: recentLeads ?? [],
    leadStatusCounts,
    pageViewLabels: last7Days.map((d) =>
      new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    ),
    pageViewData: last7Days.map((d) => pageViewsByDay[d] ?? 0),
    liveUsers,
    activitySummary: {
      newLeadsCount,
      totalLeads,
      unreadMessagesCount: unreadMessagesCount ?? 0,
      activeProjectsCount: activeProjectsCount ?? 0,
      onlineCount: liveUsers.filter((u) => u.presence === "online").length,
      awayCount: liveUsers.filter((u) => u.presence === "away").length,
    },
    ownerEmail,
    viewerIsFounder,
    viewerId: auth.user!.id,
    presenceReady: presenceReady && profilePresenceReady,
    myActivityStatus: normalizeActivityStatus(currentProfile?.activity_status),
    viewerName,
    leadsThisMonth: leadsThisMonth ?? 0,
    totalPaidRevenue,
    pendingInvoiceAmount,
    recentInvoices,
    recentProjects: recentProjectsNormalized,
    projectStatusCounts,
    recentActivity,
    upcomingDeadlines,
    recentPayments,
    todayEvents,
    recentMessages,
  });
}
