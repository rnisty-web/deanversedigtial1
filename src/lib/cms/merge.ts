import { cmsDefaults } from "@/lib/cms/defaults";
import type { CMSContent, CMSKey, PricingFaq, PricingSettings, PricingTier } from "@/lib/cms/types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Recover arrays saved as plain objects (e.g. { "0": {...}, "1": {...} })
 * from an older CMS merge bug that spread arrays into objects.
 */
export function coerceArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (!isPlainObject(value)) {
    return fallback;
  }

  const numericKeys = Object.keys(value).filter((key) => /^\d+$/.test(key));
  if (numericKeys.length === 0) {
    return fallback;
  }

  return numericKeys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key]) as T[];
}

function normalizePricingTier(value: unknown, index: number): PricingTier | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const features = coerceArray<string>(value.features, []);
  const priceRaw = value.price;
  const price =
    priceRaw === null || priceRaw === undefined
      ? null
      : typeof priceRaw === "number"
        ? priceRaw
        : Number(priceRaw);

  const name = typeof value.name === "string" ? value.name.trim() : "";
  if (!name) {
    return null;
  }

  return {
    id: typeof value.id === "string" && value.id ? value.id : `tier-${index + 1}`,
    name,
    price: Number.isFinite(price) ? price : null,
    priceLabel: typeof value.priceLabel === "string" ? value.priceLabel : "",
    description: typeof value.description === "string" ? value.description : "",
    features,
    highlighted: Boolean(value.highlighted),
    cta: typeof value.cta === "string" ? value.cta : "Get Started",
  };
}

function normalizePricingFaq(value: unknown): PricingFaq | null {
  if (!isPlainObject(value)) {
    return null;
  }

  const question = typeof value.question === "string" ? value.question.trim() : "";
  const answer = typeof value.answer === "string" ? value.answer.trim() : "";
  if (!question || !answer) {
    return null;
  }

  return { question, answer };
}

export function normalizePricingSettings(
  dbValue: unknown,
  defaults: PricingSettings,
): PricingSettings {
  if (!isPlainObject(dbValue)) {
    return defaults;
  }

  const rawTiers = coerceArray<unknown>(dbValue.tiers, []);
  const tiers = rawTiers
    .map((tier, index) => normalizePricingTier(tier, index))
    .filter((tier): tier is PricingTier => tier !== null);

  const rawFaqs = coerceArray<unknown>(dbValue.faqs, []);
  const faqs = rawFaqs
    .map((faq) => normalizePricingFaq(faq))
    .filter((faq): faq is PricingFaq => faq !== null);

  if (tiers.length === 0 && faqs.length === 0) {
    return defaults;
  }

  return {
    tiers: tiers.length > 0 ? tiers : defaults.tiers,
    faqs: faqs.length > 0 ? faqs : defaults.faqs,
  };
}

function mergeObjectSection(
  defaults: Record<string, unknown>,
  dbValue: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...defaults };

  for (const [field, value] of Object.entries(dbValue)) {
    const defaultValue = defaults[field];

    if (Array.isArray(defaultValue)) {
      merged[field] = coerceArray(value, defaultValue);
      continue;
    }

    if (isPlainObject(defaultValue) && isPlainObject(value)) {
      merged[field] = mergeObjectSection(defaultValue, value);
      continue;
    }

    if (value !== undefined && value !== null) {
      merged[field] = value;
    }
  }

  return merged;
}

export function mergeSection<K extends CMSKey>(key: K, dbValue: unknown): CMSContent[K] {
  const defaults = cmsDefaults[key];

  if (dbValue === undefined || dbValue === null) {
    return defaults;
  }

  if (key === "pricing") {
    return normalizePricingSettings(dbValue, defaults as PricingSettings) as CMSContent[K];
  }

  if (Array.isArray(defaults)) {
    return coerceArray(dbValue, defaults) as CMSContent[K];
  }

  if (!isPlainObject(dbValue)) {
    return defaults;
  }

  return mergeObjectSection(
    defaults as Record<string, unknown>,
    dbValue,
  ) as CMSContent[K];
}

export function mergeCMSContent(rows: { key: string; value: unknown }[]): CMSContent {
  const merged: Record<string, unknown> = structuredClone(cmsDefaults);

  for (const row of rows) {
    if (row.key === "cmsLayout") continue;
    const key = row.key as CMSKey;
    if (key in cmsDefaults) {
      merged[key] = mergeSection(key, row.value);
    }
  }

  return merged as CMSContent;
}
