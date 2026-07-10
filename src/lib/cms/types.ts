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
  pageEyebrow: string;
  headline: string;
  intro: string;
  story: string;
  skills: string[];
  homepageTeaser: string;
  skillsEyebrow: string;
  skillsHeadline: string;
  skillsSubtitle: string;
  techStackHeadline: string;
  homepagePrimaryCta: string;
  homepageSecondaryCta: string;
  primaryCta: string;
  secondaryCta: string;
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

export type PageIntro = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export type ServicesPageSettings = {
  homepageIntro: PageIntro;
  homepageButton: string;
  intro: PageIntro;
  bottomCtaTitle: string;
  bottomCtaBody: string;
  bottomCtaButton: string;
};

export type ContactPageSettings = {
  intro: PageIntro;
  directContactLabel: string;
  nextStepsLabel: string;
  nextSteps: string[];
};

export type PortfolioPageSettings = {
  homepageIntro: PageIntro;
  homepageButton: string;
  pageIntro: PageIntro;
};

export type TestimonialsPageSettings = {
  homepageIntro: PageIntro;
  homepageButton: string;
  pageIntro: PageIntro;
};

export type ProcessIntroSettings = {
  homepage: PageIntro;
  hireMe: PageIntro;
};

export type HireMeReason = {
  title: string;
  description: string;
};

export type HireMePageSettings = {
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  whyHireIntro: PageIntro;
  reasons: HireMeReason[];
  pricingTeaser: PageIntro;
  pricingButton: string;
  formIntro: PageIntro;
  emailPrompt: string;
};

export type PricingSettings = {
  intro: PageIntro;
  homepageButton: string;
  tiers: PricingTier[];
  faqIntro: PageIntro;
  faqs: PricingFaq[];
  closingText: string;
  closingCta: string;
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
  eyebrow: string;
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
  eyebrow: string;
  headline: string;
  subtitle: string;
  items: EducationItem[];
};

export type FaqItem = { question: string; answer: string };

export type FaqSettings = {
  eyebrow: string;
  headline: string;
  subtitle: string;
  items: FaqItem[];
};

export type CMSContent = {
  site: SiteSettings;
  hero: HeroSettings;
  stats: StatItem[];
  process: ProcessStep[];
  processIntro: ProcessIntroSettings;
  hireMePage: HireMePageSettings;
  about: AboutSettings;
  services: ServiceItem[];
  servicesPage: ServicesPageSettings;
  pricing: PricingSettings;
  contact: ContactPageSettings;
  portfolioPage: PortfolioPageSettings;
  testimonialsPage: TestimonialsPageSettings;
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
