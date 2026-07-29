/**
 * Maps a pricing tier onto contact-form query params so choosing a plan
 * pre-fills Budget, Project Type, and a short description draft.
 *
 * Values must match the default option strings in `lib/data/fallbacks.ts`
 * (or whatever the CMS has configured) — LeadForm only accepts allowed choices.
 */

export type PricingContactPrefill = {
  service?: string;
  budget?: string;
  message?: string;
};

const TIER_PREFILL: Record<string, PricingContactPrefill> = {
  starter: {
    service: "Landing Page",
    budget: "$1,500 – $3,500",
    message:
      "I'm interested in the Starter plan ($1,500). Looking for a clean site for my portfolio / landing page.",
  },
  business: {
    service: "Business Website",
    budget: "$3,500 – $7,500",
    message:
      "I'm interested in the Business plan ($3,500). Looking for a professional site for my growing business.",
  },
  custom: {
    service: "Custom Website",
    message:
      "I'm interested in a Custom quote. Here's what I need and any must-have features:",
  },
};

export function contactHrefForPricingTier(tier: {
  id: string;
  name: string;
  priceLabel: string;
}): string {
  const mapped = TIER_PREFILL[tier.id];
  const params = new URLSearchParams();

  const service = mapped?.service;
  const budget = mapped?.budget;
  const message =
    mapped?.message ??
    `I'm interested in the ${tier.name} plan (${tier.priceLabel}).`;

  if (service) params.set("service", service);
  if (budget) params.set("budget", budget);
  if (message) params.set("message", message);
  params.set("plan", tier.name);

  const query = params.toString();
  return query ? `/contact?${query}` : "/contact";
}
