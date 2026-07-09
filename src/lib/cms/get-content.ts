import { unstable_cache } from "next/cache";
import { createAnonServerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cmsDefaults } from "@/lib/cms/defaults";
import { defaultCMSLayout, mergeLayout, type CMSLayout } from "@/lib/cms/layout";
import { mergeCMSContent } from "@/lib/cms/merge";
import type { CMSContent, PublicSiteConfig } from "@/lib/cms/types";
import { siteConfig } from "@/lib/constants";

export {
  getFeaturedPortfolio,
  getFeaturedTestimonials,
} from "@/lib/data/queries";

const CMS_LAYOUT_KEY = "cmsLayout";

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

async function fetchCMSFromDb(): Promise<CMSContent> {
  if (!hasSupabase()) {
    return cmsDefaults;
  }

  const supabase = createCMSSupabaseClient();
  if (!supabase) {
    return cmsDefaults;
  }

  try {
    const { data, error } = await supabase.from("settings").select("key, value");

    if (error) {
      console.error("[cms] settings read failed:", error.message);
      return structuredClone(cmsDefaults);
    }

    if (!data?.length) {
      return structuredClone(cmsDefaults);
    }

    return mergeCMSContent(data);
  } catch (error) {
    console.error("[cms] settings read error:", error);
    return structuredClone(cmsDefaults);
  }
}

export const getCMSContent = unstable_cache(
  fetchCMSFromDb,
  ["cms-content"],
  { tags: ["cms"], revalidate: 60 },
);

async function fetchCMSLayoutFromDb(): Promise<CMSLayout> {
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
      return defaults;
    }

    if (!data?.value) {
      return defaults;
    }

    return mergeLayout(data.value as Partial<CMSLayout>, defaults);
  } catch (error) {
    console.error("[cms] layout read error:", error);
    return defaults;
  }
}

export const getCMSLayout = unstable_cache(
  fetchCMSLayoutFromDb,
  ["cms-layout"],
  { tags: ["cms"], revalidate: 60 },
);

export { getPublishedHomepageSections, isHomepageSectionPublished } from "@/lib/cms/layout";

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const cms = await getCMSContent();
  return {
    ...cms.site,
    url: siteConfig.url,
    colors: siteConfig.colors,
  };
}
