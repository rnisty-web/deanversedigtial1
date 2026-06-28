import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";
import { revalidateSite } from "@/lib/cms/revalidate";
import { getTestimonialSeedRows } from "@/lib/cms/seed-content";

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: items, error } = await auth.supabase!
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (body.action === "seed") {
    const { count } = await auth.supabase!
      .from("testimonials")
      .select("*", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Testimonials already exist. Delete them first if you want to re-import." },
        { status: 400 },
      );
    }

    const { data: items, error } = await auth.supabase!
      .from("testimonials")
      .insert(getTestimonialSeedRows())
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateSite();
    return NextResponse.json({ items, message: "Testimonials imported from site defaults" });
  }

  const { client_name, client_company, client_image, content, rating, featured, published } = body;

  if (!client_name || !content) {
    return NextResponse.json(
      { error: "Client name and content are required" },
      { status: 400 },
    );
  }

  const { data: item, error } = await auth.supabase!
    .from("testimonials")
    .insert({
      client_name,
      client_company: client_company ?? null,
      client_image: client_image ?? null,
      content,
      rating: rating ?? 5,
      featured: featured ?? false,
      published: published ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateSite();
  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const { data: item, error } = await auth.supabase!
    .from("testimonials")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateSite();
  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const { error } = await auth.supabase!.from("testimonials").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateSite();
  return NextResponse.json({ success: true });
}
