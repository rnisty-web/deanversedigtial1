import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [{ data: projects, error: projError }, { data: clients }] =
    await Promise.all([
      auth.supabase!
        .from("projects")
        .select("*, clients(name, email, company)")
        .order("created_at", { ascending: false }),
      auth.supabase!.from("clients").select("id, name, email").order("name"),
    ]);

  if (projError) {
    return NextResponse.json({ error: projError.message }, { status: 500 });
  }

  return NextResponse.json({ projects, clients: clients ?? [] });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { client_id, title, description, status, budget, deadline, lead_id } = body;

  if (!client_id || !title) {
    return NextResponse.json(
      { error: "Client and title are required" },
      { status: 400 },
    );
  }

  const { data: project, error } = await auth.supabase!
    .from("projects")
    .insert({
      client_id,
      title,
      description: description ?? null,
      status: status ?? "draft",
      budget: budget ? parseFloat(budget) : null,
      deadline: deadline || null,
      lead_id: lead_id ?? null,
    })
    .select("*, clients(name, email, company)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, budget, ...rest } = body;

  if (!id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  const updates = {
    ...rest,
    ...(budget !== undefined && budget !== "" ? { budget: parseFloat(budget) } : {}),
  };

  const { data: project, error } = await auth.supabase!
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select("*, clients(name, email, company)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  const { error } = await auth.supabase!.from("projects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
