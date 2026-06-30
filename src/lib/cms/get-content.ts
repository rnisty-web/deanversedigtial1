import { unstable_cache } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cmsDefaults } from "@/lib/cms/defaults";
import { defaultCMSLayout, mergeLayout, getHomepageOrder, type CMSLayout } from "@/lib/cms/layout";
import type { SectionId } from "@/lib/cms/sections";
import type { CMSContent, CMSKey, PublicSiteConfig } from "@/lib/cms/types";
import { siteConfig } from "@/lib/constants";

export {
  getFeaturedPortfolio,
  getFeaturedTestimonials,
} from "@/lib/data/queries";

function hasSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeObjectSection(
  defaults: Record<string, unknown>,
  dbValue: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...defaults };

  for (const [field, value] of Object.entries(dbValue)) {
    const defaultValue = defaults[field];

    if (Array.isArray(defaultValue)) {
      merged[field] = Array.isArray(value) ? value : defaultValue;
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

function mergeSection<K extends CMSKey>(
  key: K,
  dbValue: unknown,
): CMSContent[K] {
  const defaults = cmsDefaults[key];

  if (Array.isArray(defaults)) {
    return (Array.isArray(dbValue) ? dbValue : defaults) as CMSContent[K];
  }

  if (!isPlainObject(dbValue)) {
    return defaults;
  }

  return mergeObjectSection(
    defaults as Record<string, unknown>,
    dbValue,
  ) as CMSContent[K];
}

async function createCMSSupabaseClient() {
  // settings table is admin-only via RLS — server reads need the service role.
  const serviceClient = createServiceRoleClient();
  if (serviceClient) return serviceClient;
  return createClient();
}

async function fetchCMSFromDb(): Promise<CMSContent> {
  if (!hasSupabase()) {
    return cmsDefaults;
  }

  try {
    const supabase = await createCMSSupabaseClient();
    const { data, error } = await supabase.from("settings").select("key, value");

    if (error || !data?.length) {
      return cmsDefaults;
    }

    const merged: Record<string, unknown> = structuredClone(cmsDefaults);
    for (const row of data) {
      const key = row.key as CMSKey;
      if (key in cmsDefaults) {
        merged[key] = mergeSection(key, row.value);
      }
    }
    return merged as CMSContent;
  } catch {
    return cmsDefaults;
  }
}

export const getCMSContent = unstable_cache(
  fetchCMSFromDb,
  ["cms-content"],
  { tags: ["cms"] },
);

async function fetchCMSLayoutFromDb(): Promise<CMSLayout> {
  const defaults = defaultCMSLayout();

  if (!hasSupabase()) {
    return defaults;
  }

  try {
    const supabase = await createCMSSupabaseClient();
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "cmsLayout")
      .maybeSingle();

    if (error || !data?.value) {
      return defaults;
    }

    return mergeLayout(data.value as Partial<CMSLayout>, defaults);
  } catch {
    return defaults;
  }
}

export const getCMSLayout = unstable_cache(
  fetchCMSLayoutFromDb,
  ["cms-layout"],
  { tags: ["cms"] },
);

export function getPublishedHomepageSections(layout: CMSLayout): SectionId[] {
  return getHomepageOrder(layout).filter((id) => layout.meta[id]?.status !== "draft");
}

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const cms = await getCMSContent();
  return {
    ...cms.site,
    url: siteConfig.url,
    colors: siteConfig.colors,
  };
}
