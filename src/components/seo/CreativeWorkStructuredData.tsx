import { siteConfig } from "@/lib/constants";
import { getAbsoluteUrl } from "@/lib/seo/metadata";

type CreativeWorkProps = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  slug: string;
  tags?: string[];
  liveUrl?: string | null;
};

export function CreativeWorkStructuredData({
  title,
  description,
  imageUrl,
  slug,
  tags,
  liveUrl,
}: CreativeWorkProps) {
  const pageUrl = getAbsoluteUrl(`/portfolio/${slug}`);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: description ?? undefined,
    url: pageUrl,
    image: imageUrl ? getAbsoluteUrl(imageUrl) : getAbsoluteUrl(siteConfig.ogImage),
    creator: {
      "@type": "Person",
      name: siteConfig.creator,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: getAbsoluteUrl("/"),
    },
    keywords: tags?.join(", "),
    ...(liveUrl && { sameAs: liveUrl }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
