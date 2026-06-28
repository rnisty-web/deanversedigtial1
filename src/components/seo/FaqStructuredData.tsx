import { getAbsoluteUrl } from "@/lib/seo/metadata";

type FaqEntry = { question: string; answer: string };

export function FaqStructuredData({
  faqs,
  pageUrl,
}: {
  faqs: FaqEntry[];
  pageUrl: string;
}) {
  if (!faqs.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url: getAbsoluteUrl(pageUrl),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
