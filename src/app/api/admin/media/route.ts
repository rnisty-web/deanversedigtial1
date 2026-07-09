import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";
import { sanitizeMediaObjectName, validateAdminMediaUpload } from "@/lib/admin/media-upload";

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validationError = validateAdminMediaUpload(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await auth.supabase!.storage
    .from("site-media")
    .upload(path, file, { upsert: false });

  if (uploadError) {
    const message = uploadError.message.includes("Bucket not found")
      ? "Storage bucket 'site-media' not found. Run supabase/cms-upgrade.sql in the Supabase SQL Editor."
      : uploadError.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: urlData } = auth.supabase!.storage
    .from("site-media")
    .getPublicUrl(path);

  return NextResponse.json({
    path,
    url: urlData.publicUrl,
  });
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase!.storage
    .from("site-media")
    .list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    const message = error.message.includes("Bucket not found")
      ? "Storage bucket 'site-media' not found. Run supabase/cms-upgrade.sql in the Supabase SQL Editor."
      : error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const files = (data ?? [])
    .filter((f) => f.name && !f.name.startsWith("."))
    .map((f) => {
      const { data: urlData } = auth.supabase!.storage
        .from("site-media")
        .getPublicUrl(f.name);
      const meta = f.metadata as Record<string, unknown> | undefined;
      const size =
        typeof meta?.size === "number"
          ? meta.size
          : typeof meta?.contentLength === "number"
            ? meta.contentLength
            : 0;
      return { name: f.name, url: urlData.publicUrl, created_at: f.created_at, size };
    });

  return NextResponse.json({ files });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }

  const safeName = sanitizeMediaObjectName(name);
  if (!safeName) {
    return NextResponse.json({ error: "Invalid file name" }, { status: 400 });
  }

  const { error } = await auth.supabase!.storage.from("site-media").remove([safeName]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
