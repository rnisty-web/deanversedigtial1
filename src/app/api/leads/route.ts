import { NextResponse } from "next/server";
import { Resend } from "resend";
import { siteConfig } from "@/lib/constants";
import { upsertClientFromLead } from "@/lib/portal/provision-portal-client";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";
import {
  getContactFormOptionsForApi,
} from "@/lib/contact/form-options-server";
import {
  validateContactSubmission,
} from "@/lib/contact/form-options";
import { createServiceRoleClient } from "@/lib/supabase/server";
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
    } else if (process.env.NODE_ENV === "production") {
      console.error("[leads] Turnstile is not configured in production");
      return NextResponse.json(
        { error: "Contact form is temporarily unavailable. Please email us directly." },
        { status: 503 },
      );
    }

    const formOptions = await getContactFormOptionsForApi();
    const validated = validateContactSubmission(
      {
        name,
        email,
        phone,
        company,
        message,
        budget,
        project_type,
        service_interest,
      },
      formOptions,
    );

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const {
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      company: trimmedCompany,
      message: trimmedMessage,
      budget: trimmedBudget,
      project_type: trimmedProjectType,
      service_interest: trimmedServiceInterest,
    } = validated.data;

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Server configuration error. Please try again later." },
        { status: 500 },
      );
    }

    const { error } = await supabase.from("leads").insert({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      company: trimmedCompany,
      message: trimmedMessage,
      service_interest: trimmedServiceInterest,
      budget: trimmedBudget,
      project_type: trimmedProjectType,
      source: typeof source === "string" ? source.trim().slice(0, 80) : "website",
      status: "new",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await upsertClientFromLead({
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone ?? undefined,
      company: trimmedCompany ?? undefined,
    });

    if (resend) {
      const from = process.env.RESEND_FROM_EMAIL ?? siteConfig.email;
      const to = process.env.CONTACT_FORM_TO ?? siteConfig.email;
      const safeName = escapeHtml(trimmedName);
      const safeEmail = escapeHtml(trimmedEmail);
      const safePhone = trimmedPhone ? escapeHtml(trimmedPhone) : "";
      const safeCompany = trimmedCompany ? escapeHtml(trimmedCompany) : "";
      const safeService = escapeHtml(trimmedServiceInterest);
      const safeBudget = escapeHtml(trimmedBudget);
      const safeProjectType = escapeHtml(trimmedProjectType);
      const safeMessage = escapeHtml(trimmedMessage);
      const safeSource = escapeHtml(source ?? "website");

      try {
        await resend.emails.send({
          from: `DeanVerse Digital <${from}>`,
          to,
          subject: `New lead: ${trimmedName}`,
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
          to: trimmedEmail,
          subject: `Thanks for reaching out — ${siteConfig.name}`,
          html: `
            <h2>Hi ${safeName},</h2>
            <p>Thank you for contacting ${siteConfig.name}. We've received your inquiry and will get back to you within 24 hours.</p>
            <p>Best,<br/>Andrey<br/>${siteConfig.name}</p>
          `,
        });
      } catch (emailError) {
        console.error("Lead notification email failed:", emailError);
      }
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Lead submission failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
