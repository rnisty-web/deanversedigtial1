import { siteConfig } from "@/lib/constants";

function getAbsoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path}`;
}

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${getAbsoluteUrl("/")}#organization`,
    name: siteConfig.name,
    url: getAbsoluteUrl("/"),
    logo: getAbsoluteUrl(siteConfig.assets.logoRaster),
    description: siteConfig.description,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    founder: {
      "@type": "Person",
      name: siteConfig.creator,
    },
    sameAs: [
      siteConfig.social.github,
      siteConfig.social.linkedin,
      siteConfig.social.twitter,
      siteConfig.social.instagram,
    ].filter(Boolean),
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${getAbsoluteUrl("/")}#localbusiness`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: getAbsoluteUrl("/"),
    image: getAbsoluteUrl(siteConfig.assets.logoRaster),
    email: siteConfig.email,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      addressRegion: "CA",
      addressCountry: "US",
      name: siteConfig.location,
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
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  );
}
