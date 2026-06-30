import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";
import { escapeHtml, sendClientEmail } from "@/lib/email";
import { siteConfig } from "@/lib/constants";

const MESSAGE_SELECT =
  "id, subject, content, read, created_at, project_id, sender_id, recipient_id, sender:profiles!messages_sender_id_fkey(id, full_name, email), recipient:profiles!messages_recipient_id_fkey(id, full_name, email), projects(title)";

export async function GET(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";

  let query = auth.supabase!
    .from("messages")
    .select(MESSAGE_SELECT)
    .order("created_at", { ascending: false });

  if (unreadOnly) {
    query = query.eq("read", false).eq("recipient_id", auth.user!.id);
  }

  const { data: messages, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: messages ?? [] });
}

async function resolveRecipientProfileId(
  supabase: NonNullable<Awaited<ReturnType<typeof verifyAdminApi>>["supabase"]>,
  recipientId?: string,
  clientId?: string,
) {
  if (recipientId) return recipientId;

  if (!clientId) return null;

  const { data: client } = await supabase
    .from("clients")
    .select("profile_id, email")
    .eq("id", clientId)
    .maybeSingle();

  if (!client) return null;
  if (client.profile_id) return client.profile_id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", client.email.trim())
    .limit(1)
    .maybeSingle();

  return profile?.id ?? null;
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { recipient_id, client_id, project_id, subject, content } = body;

  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const recipientProfileId = await resolveRecipientProfileId(
    auth.supabase!,
    recipient_id,
    client_id,
  );

  if (!recipientProfileId) {
    return NextResponse.json(
      { error: "Recipient not found — client must have a portal account or matching profile email" },
      { status: 400 },
    );
  }

  if (project_id) {
    const { data: project } = await auth.supabase!
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
  }

  const { data: message, error } = await auth.supabase!
    .from("messages")
    .insert({
      sender_id: auth.user!.id,
      recipient_id: recipientProfileId,
      subject: subject ?? null,
      content,
      project_id: project_id ?? null,
    })
    .select(MESSAGE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const recipient = message.recipient as { email?: string; full_name?: string | null } | null;
  const sender = message.sender as { full_name?: string | null } | null;
  const recipientEmail = recipient?.email;
  const recipientName = recipient?.full_name?.trim() || "there";
  const senderName = sender?.full_name?.trim() || siteConfig.creator;

  if (recipientEmail) {
    await sendClientEmail({
      to: recipientEmail,
      subject: subject ? `Re: ${subject}` : `Message from ${siteConfig.name}`,
      html: `
        <h2>Hi ${escapeHtml(recipientName)},</h2>
        <p>You have a new message from ${escapeHtml(senderName)} at ${siteConfig.name}.</p>
        ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
        <p>${escapeHtml(content).replace(/\n/g, "<br/>")}</p>
        <p><a href="${siteConfig.url}/portal/messages">View in your portal</a></p>
        <p>Best,<br/>${escapeHtml(senderName)}<br/>${siteConfig.name}</p>
      `,
    });
  }

  return NextResponse.json({ message }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, read } = body as { id?: string; read?: boolean };

  if (!id) {
    return NextResponse.json({ error: "Message id is required" }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await auth.supabase!
    .from("messages")
    .select("id, recipient_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  if (existing.recipient_id !== auth.user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: message, error } = await auth.supabase!
    .from("messages")
    .update({ read: read ?? true })
    .eq("id", id)
    .select(MESSAGE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message });
}
