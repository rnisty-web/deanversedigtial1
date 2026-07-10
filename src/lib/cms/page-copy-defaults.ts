import { siteConfig } from "@/lib/constants";
import type {
  ContactPageSettings,
  HireMePageSettings,
  PageIntro,
  PortfolioPageSettings,
  PricingSettings,
  ProcessIntroSettings,
  ServicesPageSettings,
  TestimonialsPageSettings,
} from "@/lib/cms/types";

export function emptyPageIntro(): PageIntro {
  return { eyebrow: "", title: "", subtitle: "" };
}

export function defaultServicesPage(): ServicesPageSettings {
  return {
    homepageIntro: {
      eyebrow: "Services",
      title: "Everything you need to launch and grow online",
      subtitle:
        "From first sketch to final deployment — tailored solutions for businesses ready to make an impression.",
    },
    homepageButton: "Explore all services →",
    intro: {
      eyebrow: "Services",
      title: "Web design and development built for growth",
      subtitle: `${siteConfig.name} offers end-to-end digital services — from first sketch to launch and beyond.`,
    },
    bottomCtaTitle: "Not sure which service fits?",
    bottomCtaBody:
      "Book a free consultation and I'll help you find the right approach for your goals and budget.",
    bottomCtaButton: "Schedule a Free Call",
  };
}

export function defaultContactPage(): ContactPageSettings {
  return {
    intro: {
      eyebrow: "Contact",
      title: "Let's build something great together",
      subtitle:
        "Fill out the form below and I'll respond within 24 hours. Or reach out directly — I'd love to hear about your project.",
    },
    directContactLabel: "Direct Contact",
    nextStepsLabel: "What happens next?",
    nextSteps: [
      "I review your project details within 24 hours.",
      "We schedule a free discovery call to discuss goals and scope.",
      "You receive a tailored proposal with timeline and pricing.",
    ],
  };
}

export function defaultPortfolioPage(): PortfolioPageSettings {
  return {
    homepageIntro: {
      eyebrow: "Portfolio",
      title: "Recent work that speaks for itself",
      subtitle:
        "A selection of projects built with care — each one crafted to reflect the client's unique brand and goals.",
    },
    homepageButton: "View Full Portfolio",
    pageIntro: {
      eyebrow: "Portfolio",
      title: "Projects built with care and precision",
      subtitle: `A selection of work from ${siteConfig.creator} — each project crafted to reflect the client's brand and goals.`,
    },
  };
}

export function defaultTestimonialsPage(): TestimonialsPageSettings {
  return {
    homepageIntro: {
      eyebrow: "Testimonials",
      title: "Trusted by clients who value quality",
      subtitle: `Don't just take my word for it — here's what businesses say about working with ${siteConfig.creator}.`,
    },
    homepageButton: "Read more testimonials",
    pageIntro: {
      eyebrow: "Testimonials",
      title: "Trusted by clients who value quality",
      subtitle: `Real feedback from businesses who partnered with ${siteConfig.creator} to build their online presence.`,
    },
  };
}

export function defaultProcessIntro(): ProcessIntroSettings {
  return {
    homepage: {
      eyebrow: "Process",
      title: "A clear path from idea to launch",
      subtitle:
        "No surprises, no jargon — just a proven workflow that keeps you informed at every step.",
    },
    hireMe: {
      eyebrow: "Process",
      title: "How we'll work together",
      subtitle: "A proven four-step workflow from idea to launch.",
    },
  };
}

export function defaultPricingPageCopy(): Pick<
  PricingSettings,
  "intro" | "homepageButton" | "faqIntro" | "closingText" | "closingCta"
> {
  return {
    intro: {
      eyebrow: "Pricing",
      title: "Transparent packages, no hidden fees",
      subtitle: `Every ${siteConfig.name} project includes personal attention, quality craftsmanship, and post-launch support.`,
    },
    homepageButton: "Compare full pricing details →",
    faqIntro: {
      eyebrow: "FAQ",
      title: "Frequently asked questions",
      subtitle: "Everything you need to know before starting your project.",
    },
    closingText: "Still have questions? I'm happy to help.",
    closingCta: "Get in Touch",
  };
}

export function defaultHireMePage(): HireMePageSettings {
  return {
    heroBadge: "Available for new projects",
    heroTitle: `Hire ${siteConfig.creator} for your`,
    heroTitleAccent: "next website",
    heroSubtitle: `${siteConfig.name} delivers custom web design and development for businesses that want to stand out. Based in ${siteConfig.location}, working with clients worldwide.`,
    whyHireIntro: {
      eyebrow: "Why hire me",
      title: "What you get when we work together",
      subtitle: "A focused, personal approach to building websites that perform.",
    },
    reasons: [
      {
        title: "Direct partnership",
        description:
          "No account managers or hand-offs. You work with me from discovery through launch and beyond.",
      },
      {
        title: "Premium craft",
        description:
          "Custom design, fast performance, and attention to detail — never cookie-cutter templates.",
      },
      {
        title: "Clear communication",
        description:
          "Regular updates, honest timelines, and a client portal to keep everything organized.",
      },
      {
        title: "Results-focused",
        description:
          "Sites built to convert visitors into customers with SEO, accessibility, and UX best practices.",
      },
    ],
    pricingTeaser: {
      eyebrow: "Pricing",
      title: "Transparent packages to get started",
      subtitle: "Most projects begin with one of these tiers — custom scope available anytime.",
    },
    pricingButton: "View Full Pricing",
    formIntro: {
      eyebrow: "Get started",
      title: "Tell me about your project",
      subtitle: "Fill out the form below and I'll respond within 24 hours.",
    },
    emailPrompt: "Prefer email?",
  };
}
