import { unstable_noStore as noStore } from "next/cache";
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

async function fetchCMSFromDb(): Promise<CMSContent> {
  noStore();

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

    return mergeCMSContent(data);
  } catch (error) {
    console.error("[cms] settings read error:", error);
    warnWhenPublicCMSReadMayFail();
    return structuredClone(cmsDefaults);
  }
}

export async function getCMSContent(): Promise<CMSContent> {
  return fetchCMSFromDb();
}

async function fetchCMSLayoutFromDb(): Promise<CMSLayout> {
  noStore();
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

export async function getCMSLayout(): Promise<CMSLayout> {
  return fetchCMSLayoutFromDb();
}

export { getPublishedHomepageSections, isHomepageSectionPublished } from "@/lib/cms/layout";

export async function getPublicSiteConfig(): Promise<PublicSiteConfig> {
  const cms = await getCMSContent();
  return {
    ...cms.site,
    url: siteConfig.url,
    colors: siteConfig.colors,
  };
}
