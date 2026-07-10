import type { PublicSiteConfig } from "@/lib/cms/types";
import { siteConfig } from "@/lib/constants";

function getAbsoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path}`;
}

type StructuredDataProps = {
  config?: Pick<
    PublicSiteConfig,
    "name" | "description" | "creator" | "email" | "phone" | "location" | "social" | "assets"
  >;
};

export function StructuredData({ config }: StructuredDataProps) {
  const name = config?.name ?? siteConfig.name;
  const description = config?.description ?? siteConfig.description;
  const creator = config?.creator ?? siteConfig.creator;
  const email = config?.email ?? siteConfig.email;
  const phone = config?.phone ?? siteConfig.phone;
  const location = config?.location ?? siteConfig.location;
  const social = config?.social ?? siteConfig.social;
  const logo = config?.assets?.logo ?? siteConfig.assets.logoRaster;
  const ogImage = config?.assets?.ogImage ?? siteConfig.ogImage;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getAbsoluteUrl("/")}#organization`,
    name,
    url: getAbsoluteUrl("/"),
    logo: getAbsoluteUrl(logo),
    image: getAbsoluteUrl(ogImage),
    description,
    email,
    telephone: phone,
    founder: {
      "@type": "Person",
      name: creator,
    },
    sameAs: [social.github, social.linkedin, social.twitter, social.instagram].filter(Boolean),
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getAbsoluteUrl("/")}#website`,
    name,
    url: getAbsoluteUrl("/"),
    description,
    publisher: { "@id": `${getAbsoluteUrl("/")}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${getAbsoluteUrl("/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${getAbsoluteUrl("/")}#localbusiness`,
    name,
    description,
    url: getAbsoluteUrl("/"),
    image: getAbsoluteUrl(ogImage),
    email,
    telephone: phone,
    address: {
      "@type": "PostalAddress",
      addressRegion: "CA",
      addressCountry: "US",
      name: location,
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    priceRange: "$$",
    knowsAbout: [
      "Web Design",
      "Web Development",
      "Next.js",
      "React",
      "E-Commerce",
    ],
    parentOrganization: {
      "@id": `${getAbsoluteUrl("/")}#organization`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  );
}
