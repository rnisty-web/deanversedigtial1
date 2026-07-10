import { cmsDefaults } from "@/lib/cms/defaults";
import type { CMSContent, CMSKey } from "@/lib/cms/types";

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

export function mergeSection<K extends CMSKey>(key: K, dbValue: unknown): CMSContent[K] {
  const defaults = cmsDefaults[key];

  if (dbValue === undefined || dbValue === null) {
    return defaults;
  }

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
