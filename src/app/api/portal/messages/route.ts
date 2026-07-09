import { NextResponse } from "next/server";
import { verifyAuthApi } from "@/lib/auth";
import { escapeHtml, sendOwnerNotification } from "@/lib/email";
import { siteConfig } from "@/lib/constants";
import { getPortalSenderName } from "@/lib/portal/client-access";
import {
  getPortalMessageRecipients,
  resolveStaffRecipient,
} from "@/lib/portal/message-recipients";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";

const MESSAGE_FIELDS =
  "id, subject, content, read, created_at, project_id, sender_id, recipient_id, sender:profiles!messages_sender_id_fkey(full_name, email), recipient:profiles!messages_recipient_id_fkey(full_name, email), projects(title)" as const;

function sanitizeMessage(message: Record<string, unknown>, userId: string) {
  const sender = message.sender as
    | { full_name: string | null; email?: string }
    | { full_name: string | null; email?: string }[]
    | null
    | undefined;
  const recipient = message.recipient as
    | { full_name: string | null; email?: string }
    | { full_name: string | null; email?: string }[]
    | null
    | undefined;

  const senderProfile = Array.isArray(sender) ? sender[0] : sender;
  const recipientProfile = Array.isArray(recipient) ? recipient[0] : recipient;
  const isOutgoing = message.sender_id === userId;

  return {
    id: message.id,
    subject: message.subject,
    content: message.content,
    read: message.read,
    created_at: message.created_at,
    project_id: message.project_id,
    sender_id: message.sender_id,
    recipient_id: message.recipient_id,
    is_outgoing: isOutgoing,
    sender: {
      full_name: isOutgoing
        ? "You"
        : getPortalSenderName(senderProfile),
      email: senderProfile?.email,
    },
    recipient: {
      full_name: isOutgoing
        ? getPortalSenderName(recipientProfile, "Team member")
        : "You",
      email: recipientProfile?.email,
    },
    projects: message.projects ?? null,
  };
}

export async function GET() {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [messagesResult, recipients] = await Promise.all([
    auth.supabase!
      .from("messages")
      .select(MESSAGE_FIELDS)
      .or(`sender_id.eq.${auth.user!.id},recipient_id.eq.${auth.user!.id}`)
      .order("created_at", { ascending: false }),
    getPortalMessageRecipients(),
  ]);

  const { data: messages, error } = messagesResult;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    userId: auth.user!.id,
    recipients,
    messages: (messages ?? []).map((msg) =>
      sanitizeMessage(msg as Record<string, unknown>, auth.user!.id),
    ),
  });
}

export async function POST(request: Request) {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { subject, content, project_id, recipient_id } = body;

  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  if (!recipient_id || typeof recipient_id !== "string") {
    return NextResponse.json({ error: "Recipient is required" }, { status: 400 });
  }

  const recipient = await resolveStaffRecipient(recipient_id);
  if (!recipient) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }

  if (project_id) {
    const client = await resolvePortalClient(
      auth.supabase!,
      auth.user!.id,
      auth.user!.email ?? auth.profile!.email ?? "",
    );
    if (!client) {
      return NextResponse.json({ error: "Project not found" }, { status: 403 });
    }
    const { data: project } = await auth.supabase!
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("client_id", client.id)
      .maybeSingle();
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 403 });
    }
  }

  const { data: message, error } = await auth.supabase!
    .from("messages")
    .insert({
      sender_id: auth.user!.id,
      recipient_id: recipient.id,
      subject: subject ?? null,
      content,
      project_id: project_id ?? null,
    })
    .select(MESSAGE_FIELDS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const senderName =
    auth.profile?.full_name?.trim() ||
    auth.user!.email?.split("@")[0] ||
    "Portal client";

  await sendOwnerNotification({
    to: recipient.email,
    subject: `Portal message from ${senderName}`,
    html: `
      <h2>New portal message</h2>
      <p><strong>From:</strong> ${escapeHtml(senderName)} (${escapeHtml(auth.user!.email ?? "")})</p>
      ${subject ? `<p><strong>Subject:</strong> ${escapeHtml(subject)}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(content).replace(/\n/g, "<br/>")}</p>
      <p><a href="${siteConfig.url}/admin/messages">View in admin</a></p>
    `,
  });

  return NextResponse.json(
    { message: sanitizeMessage(message as Record<string, unknown>, auth.user!.id) },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ids, read } = body as { id?: string; ids?: string[]; read?: boolean };
  const targetIds = (ids ?? (id ? [id] : [])).filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );

  if (targetIds.length === 0) {
    return NextResponse.json({ error: "Message id is required" }, { status: 400 });
  }

  const { data: existing } = await auth.supabase!
    .from("messages")
    .select("id, recipient_id")
    .in("id", targetIds);

  const ownedIds = (existing ?? [])
    .filter((message) => message.recipient_id === auth.user!.id)
    .map((message) => message.id);

  if (ownedIds.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const { data: messages, error } = await auth.supabase!
    .from("messages")
    .update({ read: read ?? true })
    .in("id", ownedIds)
    .select(MESSAGE_FIELDS);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    messages: (messages ?? []).map((msg) =>
      sanitizeMessage(msg as Record<string, unknown>, auth.user!.id),
    ),
  });
}
