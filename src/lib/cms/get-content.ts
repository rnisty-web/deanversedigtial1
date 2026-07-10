import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createAnonServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cmsDefaults, cmsKeys } from "@/lib/cms/defaults";
import { defaultCMSLayout, mergeLayout, type CMSLayout } from "@/lib/cms/layout";
import { mergeCMSContent } from "@/lib/cms/merge";
import type { CMSContent, PublicSiteConfig } from "@/lib/cms/types";
import { siteConfig } from "@/lib/constants";

export {
  getFeaturedPortfolio,
  getFeaturedTestimonials,
} from "@/lib/data/queries";

const CMS_LAYOUT_KEY = "cmsLayout";
const CMS_SETTING_KEYS = [...cmsKeys, CMS_LAYOUT_KEY];

function hasSupabase() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function createCMSSupabaseClient() {
  const serviceClient = createServiceRoleClient();
  if (serviceClient) return serviceClient;
  return createAnonServerClient();
}

function warnWhenPublicCMSReadMayFail() {
  if (!createServiceRoleClient()) {
    console.error(
      "[cms] Public CMS reads may fail without SUPABASE_SERVICE_ROLE_KEY. Run supabase/cms-public-read.sql or set the service role key on your host.",
    );
  }
}

async function fetchCMSFromDbUncached(): Promise<CMSContent> {
  if (!hasSupabase()) {
    return cmsDefaults;
  }

  const supabase = createCMSSupabaseClient();
  if (!supabase) {
    return cmsDefaults;
  }

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", CMS_SETTING_KEYS);

    if (error) {
      console.error("[cms] settings read failed:", error.message);
      warnWhenPublicCMSReadMayFail();
      return structuredClone(cmsDefaults);
    }

    if (!data?.length) {
      console.error("[cms] no CMS settings rows returned from database");
      warnWhenPublicCMSReadMayFail();
      return structuredClone(cmsDefaults);
    }

    const merged = mergeCMSContent(data);
    const hasPricingRow = data.some((row) => row.key === "pricing");
    if (!hasPricingRow && process.env.NODE_ENV === "development") {
      console.warn(
        "[cms] no pricing row in database — using template defaults until you save Site Content → Pricing",
      );
    }

    return merged;
  } catch (error) {
    console.error("[cms] settings read error:", error);
    warnWhenPublicCMSReadMayFail();
    return structuredClone(cmsDefaults);
  }
}

const getCachedCMSContent = unstable_cache(
  fetchCMSFromDbUncached,
  ["cms-content"],
  { tags: ["cms"], revalidate: 60 },
);

export const getCMSContent = cache(async (): Promise<CMSContent> => {
  return getCachedCMSContent();
});

async function fetchCMSLayoutFromDbUncached(): Promise<CMSLayout> {
  const defaults = defaultCMSLayout();

  if (!hasSupabase()) {
    return defaults;
  }

  const supabase = createCMSSupabaseClient();
  if (!supabase) {
    return defaults;
  }

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", CMS_LAYOUT_KEY)
      .maybeSingle();

    if (error) {
      console.error("[cms] layout read failed:", error.message);
      warnWhenPublicCMSReadMayFail();
      return defaults;
    }

    if (!data?.value) {
      return defaults;
    }

    return mergeLayout(data.value as Partial<CMSLayout>, defaults);
  } catch (error) {
    console.error("[cms] layout read error:", error);
    warnWhenPublicCMSReadMayFail();
    return defaults;
  }
}

const getCachedCMSLayout = unstable_cache(
  fetchCMSLayoutFromDbUncached,
  ["cms-layout"],
  { tags: ["cms"], revalidate: 60 },
);

export const getCMSLayout = cache(async (): Promise<CMSLayout> => {
  return getCachedCMSLayout();
});

export { getPublishedHomepageSections, isHomepageSectionPublished } from "@/lib/cms/layout";

export const getPublicSiteConfig = cache(async (): Promise<PublicSiteConfig> => {
  const cms = await getCMSContent();
  return {
    ...cms.site,
    url: siteConfig.url,
    colors: siteConfig.colors,
  };
});
