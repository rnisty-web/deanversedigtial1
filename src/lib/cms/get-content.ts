import { unstable_cache } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
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

function mergeSection<K extends CMSKey>(
  key: K,
  dbValue: unknown,
): CMSContent[K] {
  if (!dbValue || typeof dbValue !== "object") {
    return cmsDefaults[key];
  }
  return { ...cmsDefaults[key], ...(dbValue as object) } as CMSContent[K];
}

async function fetchCMSFromDb(): Promise<CMSContent> {
  if (!hasSupabase()) {
    return cmsDefaults;
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient()
      : await createClient();
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
  { revalidate: 60, tags: ["cms"] },
);

async function fetchCMSLayoutFromDb(): Promise<CMSLayout> {
  const defaults = defaultCMSLayout();

  if (!hasSupabase()) {
    return defaults;
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await createAdminClient()
      : await createClient();
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
  { revalidate: 60, tags: ["cms"] },
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
