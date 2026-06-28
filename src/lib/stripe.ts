import crypto from "crypto";
import { siteConfig } from "@/lib/constants";

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY?.trim();
}

type StripeError = { error: { message: string } };

async function stripeRequest<T>(
  path: string,
  body?: URLSearchParams,
  method = "POST",
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Stripe is not configured");
  }

  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body?.toString(),
  });

  const data = (await res.json()) as T & StripeError;
  if (!res.ok) {
    throw new Error(data.error?.message ?? "Stripe request failed");
  }
  return data;
}

export type CheckoutSessionResult = {
  id: string;
  url: string;
};

export async function createInvoiceCheckoutSession(options: {
  invoiceId: string;
  invoiceNumber: string;
  amountCents: number;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutSessionResult> {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", options.successUrl);
  params.set("cancel_url", options.cancelUrl);
  params.set("customer_email", options.customerEmail);
  params.set("metadata[invoice_id]", options.invoiceId);
  params.set("metadata[invoice_number]", options.invoiceNumber);
  params.set(
    "line_items[0][price_data][currency]",
    "usd",
  );
  params.set(
    "line_items[0][price_data][product_data][name]",
    `Invoice ${options.invoiceNumber} — ${siteConfig.name}`,
  );
  params.set(
    "line_items[0][price_data][unit_amount]",
    String(options.amountCents),
  );
  params.set("line_items[0][quantity]", "1");

  return stripeRequest<CheckoutSessionResult>("/checkout/sessions", params);
}

export function verifyStripeWebhookSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );

  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex"),
    );
  } catch {
    return false;
  }
}

export type StripeWebhookEvent = {
  type: string;
  data: {
    object: {
      id: string;
      metadata?: Record<string, string>;
      payment_status?: string;
    };
  };
};

export function parseStripeWebhookEvent(payload: string): StripeWebhookEvent {
  return JSON.parse(payload) as StripeWebhookEvent;
}
