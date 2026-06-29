import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { siteConfig } from "@/lib/constants";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import { isTurnstileConfigured, verifyTurnstileToken } from "@/lib/turnstile";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const LEADS_LIMIT = 5;
const LEADS_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`leads:${ip}`, LEADS_LIMIT, LEADS_WINDOW_MS);
    if (!limit.success) {
      return rateLimitResponse(limit.resetAt);
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      message,
      service_interest,
      budget,
      project_type,
      source,
      website,
      turnstile_token,
    } = body;

    if (typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json({ lead: { id: "ok" } }, { status: 201 });
    }

    if (isTurnstileConfigured()) {
      const verified = await verifyTurnstileToken(turnstile_token, ip);
      if (!verified) {
        return NextResponse.json(
          { error: "Security check failed. Please refresh and try again." },
          { status: 400 },
        );
      }
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        name,
        email,
        phone: phone ?? null,
        company: company ?? null,
        message: message ?? null,
        service_interest: service_interest ?? null,
        budget: budget ?? null,
        project_type: project_type ?? service_interest ?? null,
        source: source ?? "website",
        status: "new",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (resend) {
      const from = process.env.RESEND_FROM_EMAIL ?? siteConfig.email;
      const to = process.env.CONTACT_FORM_TO ?? siteConfig.email;
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = phone ? escapeHtml(phone) : "";
      const safeCompany = company ? escapeHtml(company) : "";
      const safeService = service_interest ? escapeHtml(service_interest) : "";
      const safeBudget = budget ? escapeHtml(budget) : "";
      const safeProjectType = project_type ? escapeHtml(project_type) : "";
      const safeMessage = message ? escapeHtml(message) : "";
      const safeSource = escapeHtml(source ?? "website");

      await resend.emails.send({
        from: `DeanVerse Digital <${from}>`,
        to,
        subject: `New lead: ${name}`,
        html: `
          <h2>New Lead from ${siteConfig.name}</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ""}
          ${safeCompany ? `<p><strong>Company:</strong> ${safeCompany}</p>` : ""}
          ${safeService ? `<p><strong>Service:</strong> ${safeService}</p>` : ""}
          ${safeBudget ? `<p><strong>Budget:</strong> ${safeBudget}</p>` : ""}
          ${safeProjectType ? `<p><strong>Project Type:</strong> ${safeProjectType}</p>` : ""}
          ${safeMessage ? `<p><strong>Message:</strong> ${safeMessage}</p>` : ""}
          <p><strong>Source:</strong> ${safeSource}</p>
        `,
      });

      await resend.emails.send({
        from: `DeanVerse Digital <${from}>`,
        to: email,
        subject: `Thanks for reaching out — ${siteConfig.name}`,
        html: `
          <h2>Hi ${safeName},</h2>
          <p>Thank you for contacting ${siteConfig.name}. We've received your inquiry and will get back to you within 24 hours.</p>
          <p>Best,<br/>Andrey<br/>${siteConfig.name}</p>
        `,
      });
    }

    return NextResponse.json({ lead }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
