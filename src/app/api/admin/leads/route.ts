import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";

const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "lost"] as const;
const PATCHABLE_FIELDS = [
  "status",
  "notes",
  "name",
  "email",
  "phone",
  "company",
  "message",
  "service_interest",
  "budget",
  "project_type",
  "source",
] as const;

function pickLeadUpdates(body: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  for (const key of PATCHABLE_FIELDS) {
    if (key in body) updates[key] = body[key];
  }
  if (typeof updates.status === "string" && !LEAD_STATUSES.includes(updates.status as (typeof LEAD_STATUSES)[number])) {
    return { error: "Invalid lead status" };
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

  const { data: leads, error } = await auth.supabase!
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ leads });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  const picked = pickLeadUpdates(rest as Record<string, unknown>);
  if ("error" in picked) {
    return NextResponse.json({ error: picked.error }, { status: 400 });
  }

  const { data: lead, error } = await auth.supabase!
    .from("leads")
    .update(picked.updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (body.action === "convert") {
    return handleConvert(auth, body);
  }

  const {
    name,
    email,
    phone,
    company,
    message,
    service_interest,
    source,
    status,
    budget,
    project_type,
  } = body as {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    message?: string;
    service_interest?: string;
    source?: string;
    status?: string;
    budget?: string;
    project_type?: string;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const nextStatus = status ?? "new";
  if (!LEAD_STATUSES.includes(nextStatus as (typeof LEAD_STATUSES)[number])) {
    return NextResponse.json({ error: "Invalid lead status" }, { status: 400 });
  }

  const { data: lead, error } = await auth.supabase!
    .from("leads")
    .insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      message: message?.trim() || null,
      service_interest: service_interest?.trim() || null,
      budget: budget?.trim() || null,
      project_type: project_type?.trim() || null,
      source: source?.trim() || "website",
      status: nextStatus,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ lead }, { status: 201 });
}

async function handleConvert(
  auth: Awaited<ReturnType<typeof verifyAdminApi>>,
  body: {
    lead_id?: string;
    client?: { name?: string; email?: string; phone?: string; company?: string; notes?: string };
    project?: { title?: string; description?: string; status?: string; budget?: string | number | null };
  },
) {
  const { lead_id, client, project } = body;

  if (!lead_id) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  if (!client?.name || !client?.email) {
    return NextResponse.json({ error: "Client name and email are required" }, { status: 400 });
  }

  const { data: lead, error: leadError } = await auth.supabase!
    .from("leads")
    .select("*")
    .eq("id", lead_id)
    .maybeSingle();

  if (leadError) {
    return NextResponse.json({ error: leadError.message }, { status: 500 });
  }

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { data: newClient, error: clientError } = await auth.supabase!
    .from("clients")
    .insert({
      name: client.name,
      email: client.email,
      phone: client.phone ?? null,
      company: client.company ?? null,
      notes: client.notes ?? lead.notes ?? null,
      status: "active",
    })
    .select()
    .single();

  if (clientError) {
    return NextResponse.json({ error: clientError.message }, { status: 500 });
  }

  let newProject = null;

  if (project?.title) {
    const budgetValue =
      project.budget !== undefined && project.budget !== null && project.budget !== ""
        ? parseFloat(String(project.budget).replace(/[^0-9.]/g, ""))
        : null;

    const { data: createdProject, error: projectError } = await auth.supabase!
      .from("projects")
      .insert({
        client_id: newClient.id,
        title: project.title,
        description: project.description ?? null,
        status: project.status ?? "planning",
        budget: budgetValue && !Number.isNaN(budgetValue) ? budgetValue : null,
        lead_id,
      })
      .select()
      .single();

    if (projectError) {
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    newProject = createdProject;
  }

  const { data: updatedLead, error: updateError } = await auth.supabase!
    .from("leads")
    .update({ status: "converted" })
    .eq("id", lead_id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(
    { client: newClient, project: newProject, lead: updatedLead },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
  }

  const { error } = await auth.supabase!.from("leads").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
