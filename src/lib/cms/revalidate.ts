import { revalidatePath, revalidateTag } from "next/cache";

/** Bust CMS data cache (unstable_cache tags in get-content.ts). */
export function revalidateCMS() {
  // Route handler save — expire immediately so the next page load uses fresh CMS data.
  revalidateTag("cms", { expire: 0 });
}

/** Revalidate public marketing pages after CMS or content changes. */
export function revalidateSite() {
  revalidateCMS();

  // Root layout refreshes shared header/footer CMSProvider data.
  revalidatePath("/", "layout");
  revalidatePath("/");

  const paths = [
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
  ];

  for (const path of paths) {
    revalidatePath(path);
  }
}
