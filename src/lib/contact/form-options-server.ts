import { cmsDefaults } from "@/lib/cms/defaults";
import { mergeSection } from "@/lib/cms/merge";
import type { ContactPageSettings } from "@/lib/cms/types";
import { resolveContactFormOptions, type ContactFormOptions } from "@/lib/contact/form-options";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function getContactFormOptionsForApi(): Promise<ContactFormOptions> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return resolveContactFormOptions(cmsDefaults.contact);
  }

  const { data } = await supabase.from("settings").select("value").eq("key", "contact").maybeSingle();
  const contact = mergeSection("contact", data?.value) as ContactPageSettings;
  return resolveContactFormOptions(contact);
}
