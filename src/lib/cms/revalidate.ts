import { revalidatePath } from "next/cache";

export function revalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/services");
  revalidatePath("/pricing");
  revalidatePath("/contact");
  revalidatePath("/portfolio");
  revalidatePath("/testimonials");
}
