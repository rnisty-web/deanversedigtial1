import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";
import { inferIndustry, isVipClient } from "@/lib/clients/utils";

const CLIENT_STATUSES = ["active", "inactive", "archived"] as const;
const PATCHABLE_FIELDS = ["name", "email", "phone", "company", "notes", "status", "profile_id"] as const;
const IN_PROGRESS = new Set(["planning", "in_progress", "review"]);
const OUTSTANDING = new Set(["sent", "overdue"]);

function pickUpdates(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  for (const key of PATCHABLE_FIELDS) {
    if (key in body) updates[key] = body[key];
  }
  if (typeof updates.status === "string" && !CLIENT_STATUSES.includes(updates.status as (typeof CLIENT_STATUSES)[number])) {
    return { error: "Invalid client status" };
  }
  if (typeof updates.email === "string" && !updates.email.trim()) {
    return { error: "Email cannot be empty" };
  }
  if (typeof updates.name === "string" && !updates.name.trim()) {
    return { error: "Name cannot be empty" };
  }
  return { updates };
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [{ data: clients, error: clientError }, { data: projects }, { data: invoices }] = await Promise.all([
    auth.supabase!.from("clients").select("*").order("created_at", { ascending: false }),
    auth.supabase!.from("projects").select("id, client_id, status, budget, title"),
    auth.supabase!.from("invoices").select("id, client_id, amount, status"),
  ]);

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  const projectsByClient = new Map<string, typeof projects>();
  (projects ?? []).forEach((p) => {
    const list = projectsByClient.get(p.client_id) ?? [];
    list.push(p);
    projectsByClient.set(p.client_id, list);
  });

  const invoicesByClient = new Map<string, typeof invoices>();
  (invoices ?? []).forEach((inv) => {
    const list = invoicesByClient.get(inv.client_id) ?? [];
    list.push(inv);
    invoicesByClient.set(inv.client_id, list);
  });

  let projectsInProgress = 0;
  let outstandingInvoices = 0;
  let outstandingTotal = 0;
  let totalRevenue = 0;

  const enriched = (clients ?? []).map((client) => {
    const clientProjects = projectsByClient.get(client.id) ?? [];
    const clientInvoices = invoicesByClient.get(client.id) ?? [];

    const project_count = clientProjects.length;
    const projects_in_progress = clientProjects.filter((p) => IN_PROGRESS.has(p.status)).length;
    projectsInProgress += projects_in_progress;

    let revenue = clientInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + Number(inv.amount ?? 0), 0);

    if (revenue === 0) {
      revenue = clientProjects.reduce((sum, p) => sum + Number(p.budget ?? 0), 0);
    }
    totalRevenue += revenue;

    const outstanding = clientInvoices
      .filter((inv) => OUTSTANDING.has(inv.status))
      .reduce((sum, inv) => sum + Number(inv.amount ?? 0), 0);

    outstandingTotal += outstanding;
    outstandingInvoices += clientInvoices.filter((inv) => OUTSTANDING.has(inv.status)).length;

    const industry = inferIndustry(
      client.company,
      clientProjects.map((p) => p.title ?? ""),
    );

    return {
      ...client,
      project_count,
      projects_in_progress,
      revenue,
      outstanding,
      industry,
      is_vip: isVipClient(revenue, client.notes),
    };
  });

  const stats = {
    totalClients: enriched.length,
    activeClients: enriched.filter((c) => c.status === "active").length,
    projectsInProgress,
    outstandingInvoices,
    outstandingTotal,
    totalRevenue,
  };

  return NextResponse.json({ clients: enriched, stats });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { name, email, phone, company, notes, status, profile_id } = body;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const nextStatus = status ?? "active";
  if (!CLIENT_STATUSES.includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid client status" }, { status: 400 });
  }

  const { data: client, error } = await auth.supabase!
    .from("clients")
    .insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
      status: nextStatus,
      profile_id: profile_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
  }

  const picked = pickUpdates(rest as Record<string, unknown>);
  if ("error" in picked) {
    return NextResponse.json({ error: picked.error }, { status: 400 });
  }

  const { data: client, error } = await auth.supabase!
    .from("clients")
    .update(picked.updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ client });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
  }

  const { error } = await auth.supabase!.from("clients").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
