import { revalidatePath, revalidateTag } from "next/cache";
import { CMS_KEYS_BY_PAGE } from "@/lib/cms/pages";
import { cmsKeys } from "@/lib/cms/defaults";
import type { CMSKey } from "@/lib/cms/types";

const CMS_PUBLIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/contact",
  "/portfolio",
  "/testimonials",
  "/faq",
  "/education",
  "/experience",
  "/hire-me",
  "/privacy",
  "/terms",
  "/search",
  "/thank-you",
] as const;

function pathsForSection(sectionKey?: string): string[] {
  if (!sectionKey || !cmsKeys.includes(sectionKey as CMSKey)) {
    return [...CMS_PUBLIC_PATHS];
  }

  const paths = new Set<string>(["/", ...CMS_PUBLIC_PATHS]);
  for (const [path, keys] of Object.entries(CMS_KEYS_BY_PAGE)) {
    if (keys.includes(sectionKey as CMSKey)) {
      paths.add(path);
    }
  }
  return [...paths];
}

/** Bust CMS data cache tags (legacy caches + section-specific tags). */
export function revalidateCMS(sectionKey?: string) {
  revalidateTag("cms", { expire: 0 });
  if (sectionKey) {
    revalidateTag(`cms-${sectionKey}`, { expire: 0 });
  }
}

/** Revalidate public pages after Site Content (CMS) changes. */
export function revalidateCMSContent(sectionKey?: string) {
  revalidateSite(sectionKey);
}

/** Revalidate public marketing pages after CMS or content changes. */
export function revalidateSite(sectionKey?: string) {
  revalidateCMS(sectionKey);

  revalidatePath("/", "layout");
  revalidatePath("/");

  for (const path of pathsForSection(sectionKey)) {
    revalidatePath(path);
    revalidatePath(path, "layout");
  }
}

/** Bust portfolio list, detail pages, and homepage after admin portfolio changes. */
export function revalidatePortfolioContent(slugs: string[] = []) {
  revalidateTag("portfolio", { expire: 0 });
  revalidateSite();
  revalidatePath("/portfolio", "layout");

  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
  for (const slug of uniqueSlugs) {
    revalidatePath(`/portfolio/${slug}`);
  }
}

/** Bust testimonials pages and homepage after admin testimonial changes. */
export function revalidateTestimonialsContent() {
  revalidateTag("testimonials", { expire: 0 });
  revalidateSite();
  revalidatePath("/testimonials", "layout");
}
