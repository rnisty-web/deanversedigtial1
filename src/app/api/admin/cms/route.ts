import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { verifyAdminApi } from "@/lib/auth";
import { cmsDefaults, cmsKeys } from "@/lib/cms/defaults";
import { defaultCMSLayout, mergeLayout, touchLayoutMeta, type CMSLayout } from "@/lib/cms/layout";
import { mergeCMSContent } from "@/lib/cms/merge";
import { revalidateSite } from "@/lib/cms/revalidate";
import type { CMSKey } from "@/lib/cms/types";

const CMS_LAYOUT_KEY = "cmsLayout";

function parseLayout(rows: { key: string; value: unknown }[]): CMSLayout {
  const row = rows.find((r) => r.key === CMS_LAYOUT_KEY);
  const defaults = defaultCMSLayout();
  if (!row?.value || typeof row.value !== "object") {
    return defaults;
  }
  return mergeLayout(row.value as Partial<CMSLayout>, defaults);
}

async function loadCMSState(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  return {
    content: mergeCMSContent(rows),
    layout: parseLayout(rows),
  };
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const state = await loadCMSState(auth.supabase!);
    return NextResponse.json(state);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load CMS";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (body.layout && typeof body.layout === "object") {
    const layout = body.layout as CMSLayout;
    const defaults = defaultCMSLayout();
    const merged = mergeLayout(layout, defaults);

    const { error } = await auth.supabase!
      .from("settings")
      .upsert({ key: CMS_LAYOUT_KEY, value: merged }, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateSite();
    const state = await loadCMSState(auth.supabase!);
    return NextResponse.json({ success: true, ...state });
  }

  const { key, value } = body as { key: CMSKey; value: unknown };

  if (!key || !(key in cmsDefaults)) {
    return NextResponse.json({ error: "Invalid CMS key" }, { status: 400 });
  }

  const { error } = await auth.supabase!
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: layoutRows } = await auth.supabase!
    .from("settings")
    .select("key, value")
    .eq("key", CMS_LAYOUT_KEY)
    .maybeSingle();

  const currentLayout = parseLayout(layoutRows ? [layoutRows] : []);
  const updatedLayout = touchLayoutMeta(currentLayout, key);

  await auth.supabase!
    .from("settings")
    .upsert({ key: CMS_LAYOUT_KEY, value: updatedLayout }, { onConflict: "key" });

  revalidateSite();
  const state = await loadCMSState(auth.supabase!);
  return NextResponse.json({ success: true, key, ...state });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (body.action === "seed") {
    const rows = [
      ...cmsKeys.map((key) => ({
        key,
        value: cmsDefaults[key],
      })),
      {
        key: CMS_LAYOUT_KEY,
        value: defaultCMSLayout(),
      },
    ];

    const { error } = await auth.supabase!
      .from("settings")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidateSite();
    const state = await loadCMSState(auth.supabase!);
    return NextResponse.json({
      success: true,
      message: "CMS seeded with defaults",
      ...state,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
