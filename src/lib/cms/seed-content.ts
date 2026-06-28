import {
  fallbackCaseStudies,
  fallbackPortfolio,
  fallbackTestimonials,
} from "@/lib/data/fallbacks";

export function getPortfolioSeedRows() {
  return fallbackPortfolio.map((item) => {
    const caseStudy = fallbackCaseStudies[item.slug];

    return {
      title: item.title,
      slug: item.slug,
      description: item.description,
      image_url: item.image_url,
      live_url: item.live_url,
      github_url: item.github_url,
      tags: item.tags,
      industry: caseStudy?.industry ?? null,
      case_study: caseStudy
        ? {
            challenge: caseStudy.challenge,
            solution: caseStudy.solution,
            content: caseStudy.content,
            results: caseStudy.results,
            testimonial: caseStudy.testimonial,
          }
        : {},
      featured: item.featured,
      published: item.published,
      sort_order: item.sort_order,
    };
  });
}

export function getTestimonialSeedRows() {
  return fallbackTestimonials.map((item) => ({
    client_name: item.client_name,
    client_company: item.client_company,
    client_image: item.client_image,
    content: item.content,
    rating: item.rating ?? 5,
    featured: item.featured,
    published: item.published,
  }));
}
