import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_ROLE_CATALOG,
  ROLE_CATALOG_SETTINGS_KEY,
  parseRoleCatalog,
  slugifyRoleLabel,
  type RoleDefinition,
} from "@/lib/roles/catalog";

export async function fetchRoleCatalog(supabase: SupabaseClient): Promise<RoleDefinition[]> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", ROLE_CATALOG_SETTINGS_KEY)
    .maybeSingle();

  if (error || !data?.value) {
    return DEFAULT_ROLE_CATALOG;
  }

  return parseRoleCatalog(data.value);
}

export async function saveRoleCatalog(
  supabase: SupabaseClient,
  catalog: RoleDefinition[],
): Promise<{ error?: string }> {
  const { error } = await supabase.from("settings").upsert(
    {
      key: ROLE_CATALOG_SETTINGS_KEY,
      value: catalog,
    },
    { onConflict: "key" },
  );

  if (error) return { error: error.message };
  return {};
}

export async function ensureRoleEnumValue(slug: string): Promise<{ error?: string }> {
  const admin = await createAdminClient();
  const { error } = await admin.rpc("add_user_role_enum_value", { new_value: slug });
  if (error) return { error: error.message };
  return {};
}

export async function createCustomRoleDefinition(input: {
  label: string;
  color: string;
  isStaff: boolean;
  catalog: RoleDefinition[];
}): Promise<{ error?: string; role?: RoleDefinition; catalog?: RoleDefinition[] }> {
  const slug = slugifyRoleLabel(input.label);
  const enumResult = await ensureRoleEnumValue(slug);
  if (enumResult.error) return { error: enumResult.error };

  const nextRole: RoleDefinition = {
    slug,
    label: input.label.trim(),
    color: input.color,
    isStaff: input.isStaff,
    isSystem: false,
    sortOrder: Math.max(...input.catalog.map((role) => role.sortOrder), 0) + 10,
  };

  return { role: nextRole, catalog: [...input.catalog, nextRole] };
}

export async function countUsersWithRole(supabase: SupabaseClient, slug: string) {
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .or(`role.eq.${slug},roles.cs.{${slug}}`);

  if (error) return 0;
  return count ?? 0;
}

async function fetchRoleCatalogFromDb() {
  const admin = await createAdminClient();
  return fetchRoleCatalog(admin);
}

export const getCachedRoleCatalog = unstable_cache(
  fetchRoleCatalogFromDb,
  ["role-catalog"],
  { tags: ["role-catalog"] },
);

export function revalidateRoleCatalog() {
  revalidateTag("role-catalog", { expire: 0 });
}
