export type SocialLinks = {
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
};

export type SiteAssets = {
  logo: string;
  profile: string;
  background: string;
  ogImage: string;
};

export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  creator: string;
  email: string;
  phone: string;
  location: string;
  social: SocialLinks;
  assets: SiteAssets;
};

export type HeroSettings = {
  badge: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
};

export type StatItem = { label: string; value: string };

export type ProcessStep = { step: number; title: string; description: string };

export type AboutSettings = {
  headline: string;
  intro: string;
  story: string;
  skills: string[];
};

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  startingPrice: string;
  icon: string;
};

export type PricingTier = {
  id: string;
  name: string;
  price: number | null;
  priceLabel: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
};

export type PricingFaq = { question: string; answer: string };

export type PricingSettings = {
  tiers: PricingTier[];
  faqs: PricingFaq[];
};

export type CtaSettings = {
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
};

export type TechItem = { name: string; category: string };

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  highlights: string[];
};

export type ExperienceSettings = {
  headline: string;
  subtitle: string;
  items: ExperienceItem[];
};

export type EducationItem = {
  id: string;
  title: string;
  provider: string;
  year: string;
  description: string;
};

export type EducationSettings = {
  headline: string;
  subtitle: string;
  items: EducationItem[];
};

export type FaqItem = { question: string; answer: string };

export type FaqSettings = {
  headline: string;
  subtitle: string;
  items: FaqItem[];
};

export type CMSContent = {
  site: SiteSettings;
  hero: HeroSettings;
  stats: StatItem[];
  process: ProcessStep[];
  about: AboutSettings;
  services: ServiceItem[];
  pricing: PricingSettings;
  cta: CtaSettings;
  techStack: TechItem[];
  experience: ExperienceSettings;
  education: EducationSettings;
  faq: FaqSettings;
};

export type CMSKey = keyof CMSContent;

export type PublicSiteConfig = SiteSettings & {
  url: string;
  colors: {
    primary: string;
    accent: string;
    dark: string;
    darkAlt: string;
  };
};
