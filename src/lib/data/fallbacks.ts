import { siteConfig } from "@/lib/constants";
import type { PortfolioItem, Testimonial } from "@/types";

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  startingPrice: string;
  icon: string;
}

export interface CaseStudyDetails {
  slug: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  content: string;
  testimonial?: {
    quote: string;
    client_name: string;
    client_company: string;
  };
}

export interface PricingFaq {
  question: string;
  answer: string;
}

const timestamp = "2025-01-15T00:00:00.000Z";

export const allServices: ServiceDetail[] = [
  {
    id: "custom-websites",
    title: "Custom Websites",
    description:
      "One-of-a-kind websites built from scratch to match your brand, goals, and audience — no templates, no shortcuts.",
    benefits: [
      "Unique design tailored to your brand",
      "Conversion-focused layouts",
      "Fast, accessible, mobile-first build",
      "SEO-ready structure from day one",
    ],
    startingPrice: "From $1,500",
    icon: "sparkles",
  },
  {
    id: "business-websites",
    title: "Business Websites",
    description:
      "Professional multi-page sites that establish credibility and turn visitors into leads for established and growing businesses.",
    benefits: [
      "Up to 12 custom pages",
      "Service and about page architecture",
      "Contact forms and lead capture",
      "Google Analytics integration",
    ],
    startingPrice: "From $2,500",
    icon: "building",
  },
  {
    id: "landing-pages",
    title: "Landing Pages",
    description:
      "High-converting single-page experiences designed for campaigns, product launches, and paid traffic.",
    benefits: [
      "Focused messaging and clear CTAs",
      "A/B-ready layout structure",
      "Fast load times for ad campaigns",
      "Form and CRM integration",
    ],
    startingPrice: "From $800",
    icon: "rocket",
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    description:
      "Online stores with smooth checkout, product management, and payment processing that make selling effortless.",
    benefits: [
      "Product catalog and collections",
      "Stripe payment integration",
      "Order notifications and receipts",
      "Mobile-optimized shopping experience",
    ],
    startingPrice: "From $4,000",
    icon: "shopping-cart",
  },
  {
    id: "website-redesigns",
    title: "Website Redesigns",
    description:
      "Transform an outdated site into a modern, premium experience without losing your SEO equity or brand recognition.",
    benefits: [
      "UX audit and improvement plan",
      "Modern visual refresh",
      "Content migration support",
      "Performance and SEO uplift",
    ],
    startingPrice: "From $2,000",
    icon: "refresh",
  },
  {
    id: "seo-optimization",
    title: "SEO Optimization",
    description:
      "Technical and on-page SEO to help your site rank higher, load faster, and attract the right organic traffic.",
    benefits: [
      "Technical SEO audit",
      "Meta tags and schema markup",
      "Core Web Vitals improvements",
      "Keyword-focused page structure",
    ],
    startingPrice: "From $750",
    icon: "search",
  },
  {
    id: "website-maintenance",
    title: "Website Maintenance",
    description:
      "Peace of mind with ongoing updates, security monitoring, content changes, and performance checks.",
    benefits: [
      "Monthly updates and backups",
      "Security patches and monitoring",
      "Content edits on request",
      "Uptime and performance reports",
    ],
    startingPrice: "From $150/mo",
    icon: "wrench",
  },
  {
    id: "custom-development",
    title: "Custom Development",
    description:
      "Bespoke web applications, client portals, dashboards, and integrations built with modern full-stack tooling.",
    benefits: [
      "Custom features and workflows",
      "API and third-party integrations",
      "Scalable Next.js architecture",
      "Admin panels and client portals",
    ],
    startingPrice: "Custom quote",
    icon: "code",
  },
];

export const fallbackPortfolio: PortfolioItem[] = [
  {
    id: "fb-1",
    title: "Coastal Wellness Studio",
    slug: "coastal-wellness",
    description:
      "A serene booking platform for a California wellness brand with online scheduling and class packages.",
    image_url: siteConfig.assets.background,
    live_url: "https://example.com/coastal-wellness",
    github_url: null,
    tags: ["Web Design", "Next.js", "Booking"],
    featured: true,
    sort_order: 1,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "fb-2",
    title: "Summit Realty Group",
    slug: "summit-realty",
    description:
      "Property showcase with advanced filtering, lead capture, and CRM integration for a regional realty team.",
    image_url: siteConfig.assets.profile,
    live_url: "https://example.com/summit-realty",
    github_url: null,
    tags: ["Development", "CMS", "Lead Gen"],
    featured: true,
    sort_order: 2,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "fb-3",
    title: "Artisan Coffee Co.",
    slug: "artisan-coffee",
    description:
      "E-commerce storefront with subscription ordering, gift cards, and a loyalty program for a local roaster.",
    image_url: siteConfig.assets.background,
    live_url: "https://example.com/artisan-coffee",
    github_url: null,
    tags: ["E-Commerce", "Stripe", "Shopify Alt"],
    featured: true,
    sort_order: 3,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "fb-4",
    title: "Pacific Legal Partners",
    slug: "pacific-legal",
    description:
      "Trust-building website for a boutique law firm with practice area pages and secure consultation requests.",
    image_url: siteConfig.assets.background,
    live_url: "https://example.com/pacific-legal",
    github_url: null,
    tags: ["Web Design", "Professional Services"],
    featured: false,
    sort_order: 4,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "fb-5",
    title: "Verde Landscaping",
    slug: "verde-landscaping",
    description:
      "Before-and-after portfolio gallery with service area pages and quote request flow for a landscaping company.",
    image_url: siteConfig.assets.profile,
    live_url: "https://example.com/verde-landscaping",
    github_url: null,
    tags: ["Landing Page", "Local SEO"],
    featured: false,
    sort_order: 5,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "fb-6",
    title: "Nimbus SaaS Dashboard",
    slug: "nimbus-saas",
    description:
      "Custom client portal and analytics dashboard for a B2B startup with role-based access and file sharing.",
    image_url: siteConfig.assets.background,
    live_url: "https://example.com/nimbus-saas",
    github_url: null,
    tags: ["Custom Dev", "Portal", "Supabase"],
    featured: false,
    sort_order: 6,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
];

export const fallbackCaseStudies: Record<string, CaseStudyDetails> = {
  "coastal-wellness": {
    slug: "coastal-wellness",
    industry: "Health & Wellness",
    challenge:
      "Coastal Wellness Studio had an outdated WordPress site with no online booking. Clients called or DM'd to schedule, creating friction and missed appointments.",
    solution:
      "I designed a calming, mobile-first experience with integrated class scheduling, package purchases, and automated confirmation emails — all built on Next.js for speed.",
    results: [
      "40% increase in online bookings within 60 days",
      "Page load time reduced from 4.2s to under 1.5s",
      "Mobile traffic conversion up 55%",
    ],
    content:
      "The new site reflects the studio's serene brand with soft sage tones, generous whitespace, and photography-forward layouts. The booking flow was reduced to three taps on mobile. Staff can manage classes from a simple admin panel without touching code.",
    testimonial: {
      quote:
        "Andrey transformed our outdated site into something we're genuinely proud of. The process was smooth, communication was excellent, and the results exceeded our expectations.",
      client_name: "Sarah Mitchell",
      client_company: "Coastal Wellness Studio",
    },
  },
  "summit-realty": {
    slug: "summit-realty",
    industry: "Real Estate",
    challenge:
      "Summit Realty's previous site couldn't filter listings effectively and leaked leads through a generic contact form with no CRM connection.",
    solution:
      "A property showcase with map-based search, saved favorites, and direct lead routing to agents via HubSpot integration.",
    results: [
      "3x more qualified leads in the first quarter",
      "Average session duration increased by 2 minutes",
      "Agent response time cut in half with automated routing",
    ],
    content:
      "Each listing gets a dedicated page with photo galleries, virtual tour embeds, and neighborhood highlights. The design balances premium aesthetics with practical search tools buyers expect from top brokerages.",
    testimonial: {
      quote:
        "Professional, responsive, and incredibly detail-oriented. Our new website has already generated more leads in two months than the old one did all year.",
      client_name: "James Rivera",
      client_company: "Summit Realty Group",
    },
  },
  "artisan-coffee": {
    slug: "artisan-coffee",
    industry: "Food & Beverage",
    challenge:
      "Artisan Coffee Co. needed to move beyond in-store-only sales with subscriptions and gift options, but their existing Squarespace site couldn't handle complex product variants.",
    solution:
      "Custom e-commerce built with Stripe Checkout, subscription management, and a streamlined product catalog optimized for repeat purchases.",
    results: [
      "Online revenue grew 120% in six months",
      "Subscription retention rate above 85%",
      "Cart abandonment reduced by 30%",
    ],
    content:
      "The storefront emphasizes the craft story behind each roast with rich photography and tasting notes. Checkout is frictionless on mobile, and customers can manage subscriptions from a simple account page.",
    testimonial: {
      quote:
        "From design to launch, everything felt premium. The e-commerce setup was seamless and our customers love the new experience.",
      client_name: "Emily Chen",
      client_company: "Artisan Coffee Co.",
    },
  },
  "pacific-legal": {
    slug: "pacific-legal",
    industry: "Legal Services",
    challenge:
      "Pacific Legal Partners needed a site that conveyed trust and expertise while making it easy for potential clients to request consultations.",
    solution:
      "A refined, content-rich site with practice area pages, attorney profiles, and a secure multi-step consultation form.",
    results: [
      "Consultation requests up 65% year over year",
      "Bounce rate dropped by 28%",
      "Top 3 rankings for two target practice-area keywords",
    ],
    content:
      "Typography and layout choices prioritize readability and authority. Each practice area page includes FAQs and clear CTAs, helping visitors find relevant information quickly before reaching out.",
  },
  "verde-landscaping": {
    slug: "verde-landscaping",
    industry: "Home Services",
    challenge:
      "Verde Landscaping relied entirely on referrals and had no online portfolio to showcase their transformation projects.",
    solution:
      "A visually driven site with before/after galleries, service area landing pages, and a quote request form tied to their workflow.",
    results: [
      "Organic search traffic increased 90% in four months",
      "Quote requests doubled during peak season",
      "Google Business Profile clicks up 45%",
    ],
    content:
      "Project galleries use lazy-loaded images and category filters so homeowners can browse by project type. Local SEO foundations were built into every service page.",
  },
  "nimbus-saas": {
    slug: "nimbus-saas",
    industry: "B2B SaaS",
    challenge:
      "Nimbus needed a client portal where customers could track project milestones, download deliverables, and message their account manager.",
    solution:
      "A secure portal with Supabase auth, real-time messaging, file uploads, and an admin dashboard for the Nimbus team.",
    results: [
      "Support ticket volume reduced by 35%",
      "Client satisfaction scores improved to 4.8/5",
      "Onboarding time cut from 2 weeks to 5 days",
    ],
    content:
      "The portal integrates with their existing workflow tools and gives clients a single place to manage their account. Role-based permissions ensure each user sees only what they need.",
  },
};

export const fallbackTestimonials: Testimonial[] = [
  {
    id: "t-1",
    client_name: "Sarah Mitchell",
    client_company: "Coastal Wellness Studio",
    client_image: null,
    content:
      "Andrey transformed our outdated site into something we're genuinely proud of. The process was smooth, communication was excellent, and the results exceeded our expectations.",
    rating: 5,
    project_id: null,
    featured: true,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "t-2",
    client_name: "James Rivera",
    client_company: "Summit Realty Group",
    client_image: null,
    content:
      "Professional, responsive, and incredibly detail-oriented. Our new website has already generated more leads in two months than the old one did all year.",
    rating: 5,
    project_id: null,
    featured: true,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "t-3",
    client_name: "Emily Chen",
    client_company: "Artisan Coffee Co.",
    client_image: null,
    content:
      "From design to launch, everything felt premium. The e-commerce setup was seamless and our customers love the new experience.",
    rating: 5,
    project_id: null,
    featured: true,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "t-4",
    client_name: "David Park",
    client_company: "Pacific Legal Partners",
    client_image: null,
    content:
      "Our firm needed a site that felt established and trustworthy. Andrey delivered exactly that — clean design, fast performance, and a consultation flow that actually converts.",
    rating: 5,
    project_id: null,
    featured: false,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "t-5",
    client_name: "Maria Gonzalez",
    client_company: "Verde Landscaping",
    client_image: null,
    content:
      "The before-and-after gallery alone has brought us so many new clients. Andrey understood our business and built a site that sells our work for us.",
    rating: 5,
    project_id: null,
    featured: false,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: "t-6",
    client_name: "Alex Thompson",
    client_company: "Nimbus Analytics",
    client_image: null,
    content:
      "The client portal Andrey built saved our team hours every week. It's intuitive, secure, and our customers love having everything in one place.",
    rating: 5,
    project_id: null,
    featured: false,
    published: true,
    created_at: timestamp,
    updated_at: timestamp,
  },
];

export const pricingFaqs: PricingFaq[] = [
  {
    question: "What's included in the starting prices?",
    answer:
      "Starting prices cover design, development, responsive layouts, basic SEO setup, and post-launch support for the tier described. Final quotes depend on scope, content readiness, and any custom integrations.",
  },
  {
    question: "Do you require a deposit?",
    answer:
      "Yes. Most projects start with a 50% deposit to reserve your spot and begin discovery. The remaining balance is due at launch or split across milestones for larger projects.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Starter sites usually take 2–4 weeks. Business sites run 4–8 weeks. Custom applications and e-commerce projects vary based on complexity — we'll define a timeline during discovery.",
  },
  {
    question: "Can I update the site myself after launch?",
    answer:
      "Absolutely. Business and Custom tiers include CMS integration so you can edit content without code. I also provide a walkthrough and documentation at handoff.",
  },
  {
    question: "What if I need changes after the project is done?",
    answer:
      "Every package includes post-launch support (30–60 days depending on tier). After that, you can book ad-hoc updates or sign up for a maintenance plan starting at $150/month.",
  },
  {
    question: "Do you work with clients outside California?",
    answer:
      "Yes. I'm based in California but work with clients worldwide. All communication happens via video call, email, and your client portal.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "Next.js, React, TypeScript, JavaScript, Node.js, Tailwind CSS, PostgreSQL, Supabase, and Cloudflare for most projects. E-commerce typically uses Stripe. I choose the stack that best fits your goals and budget.",
  },
  {
    question: "Can you redesign my existing site without losing SEO?",
    answer:
      "Yes. Redesigns include proper redirects, metadata migration, and performance improvements that typically boost rankings rather than hurt them.",
  },
];

export const aboutStory = {
  headline: "Building digital experiences with purpose",
  intro: `Hi, I'm Andrey — the designer and developer behind ${siteConfig.name}. Based in ${siteConfig.location}, I help small businesses and startups launch websites that look premium, load fast, and convert visitors into customers.`,
  paragraphs: [
    "I started DeanVerse Digital because I saw too many great businesses held back by outdated, slow, or generic websites. You deserve a site that reflects the quality of your work — not a template that looks like everyone else's.",
    "Every project gets my full attention. No account managers, no outsourcing, no cookie-cutter solutions. From our first discovery call to launch day and beyond, you work directly with me.",
    "When I'm not designing or coding, I'm exploring new tools, refining my craft, and finding inspiration in California's coastlines and creative community.",
  ],
  skills: [
    "UI/UX Design",
    "Responsive Web Design",
    "Next.js & React",
    "TypeScript",
    "E-Commerce (Stripe)",
    "SEO & Performance",
    "Supabase & APIs",
    "Brand Strategy",
  ],
};

export const experienceDefaults = {
  headline: "Career journey",
  subtitle:
    "A timeline of roles, projects, and milestones that shaped how I design and build for the web.",
  items: [
    {
      id: "exp-1",
      role: "Founder & Lead Designer",
      company: "DeanVerse Digital",
      period: "2021 — Present",
      description:
        "Running an independent studio focused on premium web design and development for small businesses and startups.",
      highlights: [
        "Delivered 25+ client projects across industries",
        "Built custom Next.js apps, e-commerce, and client portals",
        "Direct client relationships from discovery through launch",
      ],
    },
    {
      id: "exp-2",
      role: "Freelance Web Developer",
      company: "Independent",
      period: "2019 — 2021",
      description:
        "Transitioned from side projects to full-time freelance work, specializing in React and modern front-end development.",
      highlights: [
        "WordPress-to-Next.js migrations for performance gains",
        "Landing pages and marketing sites for local businesses",
        "Established repeatable design and development workflows",
      ],
    },
    {
      id: "exp-3",
      role: "Front-End Developer",
      company: "Agency & Contract Work",
      period: "2017 — 2019",
      description:
        "Collaborated with design teams to implement responsive interfaces and interactive experiences.",
      highlights: [
        "HTML, CSS, JavaScript, and early React projects",
        "Accessibility and cross-browser QA",
        "Component-based UI patterns",
      ],
    },
  ],
};

export const educationDefaults = {
  headline: "Learning & credentials",
  subtitle:
    "Continuous education in design, development, and the tools that power modern web experiences.",
  items: [
    {
      id: "edu-1",
      title: "Full-Stack Web Development",
      provider: "Self-directed & industry courses",
      year: "Ongoing",
      description:
        "Deep dives into Next.js, React, TypeScript, Node.js, and cloud deployment with Supabase and Cloudflare.",
    },
    {
      id: "edu-2",
      title: "UI/UX Design Fundamentals",
      provider: "Professional development",
      year: "2020",
      description:
        "Layout systems, typography, color theory, and user-centered design principles applied to client work.",
    },
    {
      id: "edu-3",
      title: "Web Accessibility (WCAG)",
      provider: "Industry best practices",
      year: "2021",
      description:
        "Semantic HTML, ARIA patterns, keyboard navigation, and inclusive design for all project tiers.",
    },
    {
      id: "edu-4",
      title: "SEO & Web Performance",
      provider: "Continuous learning",
      year: "2022",
      description:
        "Core Web Vitals, technical SEO, schema markup, and performance optimization for search and conversion.",
    },
  ],
};

export const faqDefaults = {
  headline: "Frequently asked questions",
  subtitle:
    "Answers to common questions about working with DeanVerse Digital — from pricing to process.",
  items: pricingFaqs,
};

export const projectTypes = [
  "Custom Website",
  "Business Website",
  "Landing Page",
  "E-Commerce",
  "Website Redesign",
  "SEO Optimization",
  "Maintenance Plan",
  "Custom Development",
  "Not sure yet",
] as const;

export const budgetRanges = [
  "Under $1,500",
  "$1,500 – $3,500",
  "$3,500 – $7,500",
  "$7,500 – $15,000",
  "$15,000+",
  "Not sure yet",
] as const;
