import { NextResponse } from "next/server";
import { verifyAuthApi } from "@/lib/auth";
import { escapeHtml, sendOwnerNotification } from "@/lib/email";
import { siteConfig } from "@/lib/constants";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";

async function getClientProjects(
  supabase: NonNullable<Awaited<ReturnType<typeof verifyAuthApi>>["supabase"]>,
  userId: string,
  userEmail: string,
) {
  const client = await resolvePortalClient(supabase, userId, userEmail);

  if (!client) return { clientId: null, projects: [] };

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("client_id", client.id);

  return { clientId: client.id, projects: projects ?? [] };
}

const FILE_FIELDS = "id, name, file_path, project_id, file_size, mime_type, created_at" as const;

export async function GET(request: Request) {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const download = searchParams.get("download");
  const projectId = searchParams.get("project_id");

  if (download) {
    const { projects } = await getClientProjects(
      auth.supabase!,
      auth.user!.id,
      auth.user!.email ?? auth.profile!.email,
    );
    const projectIds = projects.map((p) => p.id);

    if (projectIds.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: ownedFile } = await auth.supabase!
      .from("files")
      .select("file_path, name")
      .in("project_id", projectIds)
      .eq("file_path", download)
      .maybeSingle();

    if (!ownedFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { data, error } = await auth.supabase!.storage
      .from("project-files")
      .download(ownedFile.file_path);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${ownedFile.name}"`,
      },
    });
  }

  const { projects } = await getClientProjects(
    auth.supabase!,
    auth.user!.id,
    auth.user!.email ?? auth.profile!.email,
  );
  const projectIds = projects.map((p) => p.id);

  if (projectIds.length === 0) {
    return NextResponse.json({ files: [], projects: [] });
  }

  let query = auth.supabase!
    .from("files")
    .select(FILE_FIELDS)
    .in("project_id", projectIds)
    .order("created_at", { ascending: false });

  if (projectId && projectIds.includes(projectId)) {
    query = query.eq("project_id", projectId);
  }

  const { data: files, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ files: files ?? [], projects });
}

export async function POST(request: Request) {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const projectId = formData.get("project_id") as string | null;

  if (!file || !projectId) {
    return NextResponse.json(
      { error: "File and project_id are required" },
      { status: 400 },
    );
  }

  const { projects } = await getClientProjects(
    auth.supabase!,
    auth.user!.id,
    auth.user!.email ?? auth.profile!.email,
  );
  if (!projects.some((p) => p.id === projectId)) {
    return NextResponse.json({ error: "Project not found" }, { status: 403 });
  }

  const filePath = `${projectId}/${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await auth.supabase!.storage
    .from("project-files")
    .upload(filePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: fileRecord, error } = await auth.supabase!
    .from("files")
    .insert({
      project_id: projectId,
      uploaded_by: auth.user!.id,
      name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
    })
    .select(FILE_FIELDS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: project } = await auth.supabase!
    .from("projects")
    .select("title")
    .eq("id", projectId)
    .maybeSingle();

  const uploaderName =
    auth.profile?.full_name?.trim() ||
    auth.user!.email?.split("@")[0] ||
    "Portal client";

  await sendOwnerNotification({
    subject: `File uploaded: ${file.name}`,
    html: `
      <h2>New file upload</h2>
      <p><strong>File:</strong> ${escapeHtml(file.name)}</p>
      <p><strong>Project:</strong> ${escapeHtml(project?.title ?? "Unknown project")}</p>
      <p><strong>Uploaded by:</strong> ${escapeHtml(uploaderName)} (${escapeHtml(auth.user!.email ?? "")})</p>
      <p><a href="${siteConfig.url}/admin">View in admin</a></p>
    `,
  });

  return NextResponse.json({ file: fileRecord }, { status: 201 });
}
