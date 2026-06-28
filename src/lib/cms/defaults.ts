import {
  pricingTiers,
  processSteps,
  siteConfig,
  stats,
  techStack,
} from "@/lib/constants";
import {
  aboutStory,
  allServices,
  educationDefaults,
  experienceDefaults,
  faqDefaults,
  pricingFaqs,
} from "@/lib/data/fallbacks";
import type { CMSContent } from "@/lib/cms/types";

export const cmsDefaults: CMSContent = {
  site: {
    name: siteConfig.name,
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    creator: siteConfig.creator,
    email: siteConfig.email,
    phone: siteConfig.phone,
    location: siteConfig.location,
    social: { ...siteConfig.social },
    assets: {
      logo: siteConfig.assets.logo,
      profile: siteConfig.assets.profile,
      background: siteConfig.assets.background,
      ogImage: siteConfig.ogImage,
    },
  },
  hero: {
    badge: "Available for new projects",
    headline: "Premium web design for brands that",
    headlineAccent: "deserve to stand out",
    subheadline: `Hi, I'm ${siteConfig.creator} — founder of ${siteConfig.name}. I build fast, beautiful websites that turn visitors into customers, from California to anywhere in the world.`,
    primaryCta: "Start Your Project",
    secondaryCta: "View My Work",
  },
  stats: stats.map((s) => ({ label: s.label, value: s.value })),
  process: processSteps.map((s) => ({
    step: s.step,
    title: s.title,
    description: s.description,
  })),
  about: {
    headline: aboutStory.headline,
    intro: aboutStory.intro,
    story: aboutStory.paragraphs.join("\n\n"),
    skills: [...aboutStory.skills],
  },
  services: allServices.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    benefits: [...s.benefits],
    startingPrice: s.startingPrice,
    icon: s.icon,
  })),
  pricing: {
    tiers: pricingTiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      priceLabel: t.priceLabel,
      description: t.description,
      features: [...t.features],
      highlighted: t.highlighted,
      cta: t.cta,
    })),
    faqs: pricingFaqs.map((f) => ({ question: f.question, answer: f.answer })),
  },
  cta: {
    eyebrow: "Ready to Start?",
    headline: "Let's build something",
    headlineAccent: "extraordinary",
    body: "Have a project in mind? I'd love to hear about it. Reach out and let's turn your vision into a website you're genuinely proud of.",
    primaryCta: "Start Your Project",
    secondaryCta: "Get in Touch",
  },
  techStack: techStack.map((t) => ({ name: t.name, category: t.category })),
  experience: {
    headline: experienceDefaults.headline,
    subtitle: experienceDefaults.subtitle,
    items: experienceDefaults.items.map((item) => ({
      ...item,
      highlights: [...item.highlights],
    })),
  },
  education: {
    headline: educationDefaults.headline,
    subtitle: educationDefaults.subtitle,
    items: educationDefaults.items.map((item) => ({ ...item })),
  },
  faq: {
    headline: faqDefaults.headline,
    subtitle: faqDefaults.subtitle,
    items: faqDefaults.items.map((f) => ({ question: f.question, answer: f.answer })),
  },
};

export const cmsKeys = Object.keys(cmsDefaults) as (keyof CMSContent)[];
