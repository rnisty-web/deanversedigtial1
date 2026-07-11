import { NextResponse } from "next/server";
import { verifyAdminApi, verifyAdminPermissionApi } from "@/lib/auth";
import { revalidatePortfolioContent } from "@/lib/cms/revalidate";
import { getPortfolioSeedRows } from "@/lib/cms/seed-content";

function normalizePortfolioItem<T extends { tags?: string[] | null }>(item: T) {
  return { ...item, tags: item.tags ?? [] };
}

function formatPortfolioError(error: { code?: string; message: string }) {
  if (error.code === "23505" && error.message.toLowerCase().includes("slug")) {
    return "This slug is already in use. Choose a different one.";
  }
  if (error.message.includes("case_study") || error.message.includes("industry")) {
    return "Portfolio table is missing CMS columns. Run supabase/cms-upgrade.sql in the Supabase SQL Editor.";
  }
  return error.message;
}

async function slugTaken(
  supabase: NonNullable<Awaited<ReturnType<typeof verifyAdminApi>>["supabase"]>,
  slug: string,
  excludeId?: string,
) {
  let query = supabase.from("portfolio").select("id").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data } = await query.maybeSingle();
  return Boolean(data);
}

function revalidateAfterPortfolioChange(slugs: string[] = []) {
  revalidatePortfolioContent(slugs);
}

export async function GET(request: Request) {
  const auth = await verifyAdminPermissionApi("portfolio");
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (slug) {
    const { data: item, error } = await auth.supabase!
      .from("portfolio")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: formatPortfolioError(error) }, { status: 500 });
    }

    if (!item) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ item: normalizePortfolioItem(item) });
  }

  const { data: items, error } = await auth.supabase!
    .from("portfolio")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: formatPortfolioError(error) }, { status: 500 });
  }

  return NextResponse.json({ items: (items ?? []).map(normalizePortfolioItem) });
}

export async function POST(request: Request) {
  const auth = await verifyAdminPermissionApi("portfolio");
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (body.action === "seed") {
    const { count } = await auth.supabase!
      .from("portfolio")
      .select("*", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Portfolio already has items. Delete them first if you want to re-import." },
        { status: 400 },
      );
    }

    const { data: items, error } = await auth.supabase!
      .from("portfolio")
      .insert(getPortfolioSeedRows())
      .select();

    if (error) {
      return NextResponse.json({ error: formatPortfolioError(error) }, { status: 500 });
    }

    revalidateAfterPortfolioChange((items ?? []).map((item) => item.slug));
    return NextResponse.json({
      items: (items ?? []).map(normalizePortfolioItem),
      message: "Portfolio imported from site defaults",
    });
  }

  const {
    title,
    slug,
    description,
    image_url,
    live_url,
    github_url,
    tags,
    industry,
    case_study,
    featured,
    published,
    sort_order,
  } = body;

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }

  if (await slugTaken(auth.supabase!, slug)) {
    return NextResponse.json({ error: "This slug is already in use. Choose a different one." }, { status: 400 });
  }

  const { data: item, error } = await auth.supabase!
    .from("portfolio")
    .insert({
      title,
      slug,
      description: description ?? null,
      image_url: image_url ?? null,
      live_url: live_url ?? null,
      github_url: github_url ?? null,
      tags: tags ?? [],
      industry: industry ?? null,
      case_study: case_study ?? {},
      featured: featured ?? false,
      published: published ?? false,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: formatPortfolioError(error) }, { status: 500 });
  }

  revalidateAfterPortfolioChange([item.slug]);
  return NextResponse.json({ item: normalizePortfolioItem(item) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminPermissionApi("portfolio");
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const { data: previous } = await auth.supabase!
    .from("portfolio")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (typeof updates.slug === "string" && updates.slug !== previous?.slug) {
    if (await slugTaken(auth.supabase!, updates.slug, id)) {
      return NextResponse.json({ error: "This slug is already in use. Choose a different one." }, { status: 400 });
    }
  }

  const { data: item, error } = await auth.supabase!
    .from("portfolio")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: formatPortfolioError(error) }, { status: 500 });
  }

  revalidateAfterPortfolioChange(
    [previous?.slug, item.slug].filter((value): value is string => Boolean(value)),
  );
  return NextResponse.json({ item: normalizePortfolioItem(item) });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminPermissionApi("portfolio");
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  const { data: previous } = await auth.supabase!
    .from("portfolio")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await auth.supabase!.from("portfolio").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: formatPortfolioError(error) }, { status: 500 });
  }

  revalidateAfterPortfolioChange(previous?.slug ? [previous.slug] : []);
  return NextResponse.json({ success: true });
}
