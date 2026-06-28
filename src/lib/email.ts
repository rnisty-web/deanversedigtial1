import { Resend } from "resend";
import { siteConfig } from "@/lib/constants";
import { getOwnerEmail } from "@/lib/auth";

let resendClient: Resend | null = null;

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? siteConfig.email;
}

function getOwnerRecipient(): string {
  return process.env.CONTACT_FORM_TO ?? getOwnerEmail();
}

export async function sendOwnerNotification(options: {
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: `DeanVerse Digital <${getFromAddress()}>`,
    to: getOwnerRecipient(),
    subject: options.subject,
    html: options.html,
  });
}

export async function sendClientEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend || !options.to) return;

  await resend.emails.send({
    from: `DeanVerse Digital <${getFromAddress()}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
