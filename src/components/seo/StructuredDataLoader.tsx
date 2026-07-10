import { StructuredData } from "@/components/seo/StructuredData";
import { getPublicSiteConfig } from "@/lib/cms/get-content";

export async function StructuredDataLoader() {
  const config = await getPublicSiteConfig();
  return <StructuredData config={config} />;
}
