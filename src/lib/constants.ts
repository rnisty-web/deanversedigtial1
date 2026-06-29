function publicEnv(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export const siteConfig = {
  name: "DeanVerse Digital",
  tagline: "Freelance web design by Andrey",
  description:
    "Custom websites and web applications for small businesses and startups. Clean design, fast performance, and a personal touch from California.",
  url: publicEnv("NEXT_PUBLIC_SITE_URL", "https://deanversedigital.com"),
  ogImage: "/images/deanverse-digital-logo.png",
  creator: "Andrey",
  email: "adean2440@gmail.com",
  phone: "(619) 559-1008",
  location: "California, USA",
  colors: {
    primary: "#6f8f72",
    accent: "#a3c9a8",
    dark: "#0f1a17",
    darkAlt: "#2f5d50",
  },
  assets: {
    /** Primary logo — drop your SVG at public/images/deanverse-digital-logo.svg */
    logo: "/images/deanverse-digital-logo.svg",
    /** PNG fallback (used until SVG is added, and for Open Graph / JSON-LD) */
    logoRaster: "/images/deanverse-digital-logo.png",
    profile: "/images/image0.png",
    background: "/images/background.png",
  },
  social: {
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

export const portalNavLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/projects", label: "My Project" },
  { href: "/portal/files", label: "Files" },
  { href: "/portal/messages", label: "Messages" },
  { href: "/portal/invoices", label: "Invoices" },
  { href: "/portal/account", label: "Account" },
] as const;

export const services = [
  {
    id: "web-design",
    title: "Web Design",
    description:
      "Modern, responsive websites tailored to your brand. From landing pages to multi-page business sites with a focus on clarity and conversion.",
    icon: "layout",
    features: [
      "Custom UI/UX design",
      "Mobile-first responsive layouts",
      "Brand-aligned color and typography",
      "Accessibility best practices",
    ],
  },
  {
    id: "web-development",
    title: "Web Development",
    description:
      "Full-stack development with Next.js, React, and modern tooling. Fast, SEO-friendly sites built to scale with your business.",
    icon: "code",
    features: [
      "Next.js & React applications",
      "API integrations",
      "Performance optimization",
      "Deployment & hosting setup",
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce",
    description:
      "Online stores that are easy to manage and built to sell. Product catalogs, checkout flows, and payment integration.",
    icon: "shopping-cart",
    features: [
      "Product catalog setup",
      "Stripe / payment integration",
      "Inventory management",
      "Order notifications",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance & Support",
    description:
      "Ongoing updates, security patches, content changes, and performance monitoring so your site stays healthy long after launch.",
    icon: "wrench",
    features: [
      "Monthly updates & backups",
      "Content edits",
      "Bug fixes & troubleshooting",
      "Performance monitoring",
    ],
  },
] as const;

export const pricingTiers = [
  {
    id: "starter",
    name: "Starter",
    price: 1500,
    priceLabel: "$1,500",
    description: "Perfect for freelancers, portfolios, and small landing pages.",
    features: [
      "Up to 5 pages",
      "Responsive design",
      "Contact form",
      "Basic SEO setup",
      "2 revision rounds",
      "30-day post-launch support",
    ],
    highlighted: false,
    cta: "Get Started",
  },
  {
    id: "business",
    name: "Business",
    price: 3500,
    priceLabel: "$3,500",
    description: "Ideal for growing businesses that need a professional web presence.",
    features: [
      "Up to 12 pages",
      "Custom design system",
      "CMS integration",
      "Blog setup",
      "Analytics integration",
      "3 revision rounds",
      "60-day post-launch support",
    ],
    highlighted: true,
    cta: "Most Popular",
  },
  {
    id: "custom",
    name: "Custom",
    price: null,
    priceLabel: "Custom Quote",
    description: "Full web applications, e-commerce, and complex integrations.",
    features: [
      "Unlimited pages / app scope",
      "Custom functionality",
      "E-commerce or portal",
      "Third-party integrations",
      "Priority support",
      "Ongoing maintenance options",
    ],
    highlighted: false,
    cta: "Contact Me",
  },
] as const;

export const stats = [
  { label: "Projects Delivered", value: "25+" },
  { label: "Happy Clients", value: "20+" },
  { label: "Years Experience", value: "5+" },
  { label: "Avg. Response Time", value: "< 24h" },
] as const;

export const processSteps = [
  {
    step: 1,
    title: "Discovery",
    description:
      "We discuss your goals, audience, and vision. I learn about your brand and what success looks like for your project.",
  },
  {
    step: 2,
    title: "Design",
    description:
      "Wireframes and mockups bring your site to life. You review and refine until the design feels exactly right.",
  },
  {
    step: 3,
    title: "Development",
    description:
      "Clean, performant code turns designs into a live site. Regular check-ins keep you in the loop throughout the build.",
  },
  {
    step: 4,
    title: "Launch & Support",
    description:
      "Thorough testing, deployment, and handoff. Post-launch support ensures a smooth transition and ongoing peace of mind.",
  },
] as const;

export const techStack = [
  { name: "Next.js", category: "Framework" },
  { name: "React", category: "Library" },
  { name: "TypeScript", category: "Language" },
  { name: "JavaScript", category: "Language" },
  { name: "Python", category: "Language" },
  { name: "Node.js", category: "Runtime" },
  { name: "HTML/CSS", category: "Markup" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "PostgreSQL", category: "Database" },
  { name: "Supabase", category: "Backend" },
  { name: "Cloudflare", category: "Hosting" },
  { name: "Git", category: "Tooling" },
] as const;

export const leadSources = [
  "website",
  "referral",
  "social",
  "google",
  "other",
] as const;

export const invoiceStatuses = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

export const projectStatuses = [
  "draft",
  "planning",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
] as const;

export const leadStatuses = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;
