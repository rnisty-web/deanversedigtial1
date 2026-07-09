import { revalidatePath, revalidateTag } from "next/cache";

/** Bust CMS data cache (unstable_cache tags in get-content.ts). */
export function revalidateCMS() {
  revalidateTag("cms", { expire: 0 });
}

/** Revalidate public marketing pages after CMS or content changes. */
export function revalidateSite() {
  revalidateCMS();

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
    "/thank-you",
  ];

  for (const path of paths) {
    revalidatePath(path);
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
