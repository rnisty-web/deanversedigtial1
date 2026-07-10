"use client";

import { useRef, useState } from "react";
import { AdminField } from "@/components/admin/AdminField";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { DragHandleIcon } from "@/components/admin/content/SectionIcon";
import { Button } from "@/components/ui/Button";
import type {
  AboutSettings,
  CMSContent,
  CMSKey,
  ContactPageSettings,
  CtaSettings,
  EducationItem,
  EducationSettings,
  ExperienceItem,
  ExperienceSettings,
  FaqItem,
  FaqSettings,
  HireMePageSettings,
  HireMeReason,
  HeroSettings,
  PageIntro,
  PortfolioPageSettings,
  PricingFaq,
  PricingTier,
  ProcessIntroSettings,
  ProcessStep,
  ServiceItem,
  ServicesPageSettings,
  SiteSettings,
  StatItem,
  TechItem,
  TestimonialsPageSettings,
} from "@/lib/cms/types";
import { cn } from "@/lib/utils";

function SectionCard({
  title,
  children,
  onRemove,
}: {
  title: string;
  children: React.ReactNode;
  onRemove?: () => void;
}) {
  return (
    <div className="admin-luxury-card rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-[#a3c9a8]">{title}</h4>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400/80 transition-colors hover:text-red-300"
          >
            Remove
          </button>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ArrayFieldEditor({
  label,
  items,
  onChange,
  placeholder = "Add item",
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="admin-input flex-1 px-3 py-2 text-sm"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            >
              ×
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onChange([...items, ""])}
        >
          + {placeholder}
        </Button>
      </div>
    </div>
  );
}

function PageIntroFields({
  label,
  intro,
  onChange,
}: {
  label: string;
  intro: PageIntro;
  onChange: (intro: PageIntro) => void;
}) {
  return (
    <div className="admin-luxury-card space-y-3 rounded-xl p-4">
      <h4 className="text-sm font-medium text-[#a3c9a8]">{label}</h4>
      <AdminField label="Eyebrow" value={intro.eyebrow} onChange={(v) => onChange({ ...intro, eyebrow: v })} />
      <AdminField label="Title" value={intro.title} onChange={(v) => onChange({ ...intro, title: v })} />
      <AdminField
        label="Subtitle"
        value={intro.subtitle}
        onChange={(v) => onChange({ ...intro, subtitle: v })}
        multiline
        rows={2}
      />
    </div>
  );
}

type ContentSectionFormsProps = {
  activeKey: CMSKey;
  content: CMSContent;
  updateSection: <K extends CMSKey>(key: K, value: CMSContent[K]) => void;
};

export function ContentSectionForms({ activeKey, content, updateSection }: ContentSectionFormsProps) {
  switch (activeKey) {
    case "site":
      return renderSiteTab(content.site, updateSection);
    case "hero":
      return renderHeroTab(content.hero, updateSection);
    case "stats":
      return renderStatsTab(content.stats, updateSection);
    case "process":
      return renderProcessTab(content.process, updateSection);
    case "processIntro":
      return renderProcessIntroTab(content.processIntro, updateSection);
    case "about":
      return renderAboutTab(content.about, updateSection);
    case "services":
      return renderServicesTab(content.services, updateSection);
    case "servicesPage":
      return renderServicesPageTab(content.servicesPage, updateSection);
    case "pricing":
      return renderPricingTab(content.pricing, updateSection);
    case "contact":
      return renderContactTab(content.contact, updateSection);
    case "hireMePage":
      return renderHireMePageTab(content.hireMePage, updateSection);
    case "portfolioPage":
      return renderPortfolioPageTab(content.portfolioPage, updateSection);
    case "testimonialsPage":
      return renderTestimonialsPageTab(content.testimonialsPage, updateSection);
    case "cta":
      return renderCtaTab(content.cta, updateSection);
    case "techStack":
      return renderTechStackTab(content.techStack, updateSection);
    case "experience":
      return renderExperienceTab(content.experience, updateSection);
    case "education":
      return renderEducationTab(content.education, updateSection);
    case "faq":
      return renderFaqTab(content.faq, updateSection);
    default:
      return null;
  }
}

function renderSiteTab(site: SiteSettings, updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Site Name" value={site.name} onChange={(v) => updateSection("site", { ...site, name: v })} />
        <AdminField label="Tagline" value={site.tagline} onChange={(v) => updateSection("site", { ...site, tagline: v })} />
        <AdminField label="Creator" value={site.creator} onChange={(v) => updateSection("site", { ...site, creator: v })} />
        <AdminField label="Email" type="email" value={site.email} onChange={(v) => updateSection("site", { ...site, email: v })} />
        <AdminField label="Phone" type="tel" value={site.phone} onChange={(v) => updateSection("site", { ...site, phone: v })} />
        <AdminField label="Location" value={site.location} onChange={(v) => updateSection("site", { ...site, location: v })} />
      </div>
      <AdminField
        label="Description"
        value={site.description}
        onChange={(v) => updateSection("site", { ...site, description: v })}
        multiline
        rows={3}
      />
      <div>
        <h4 className="mb-3 text-sm font-medium text-[#a3c9a8]">Social Links</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["github", "linkedin", "twitter", "instagram"] as const).map((key) => (
            <AdminField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              type="url"
              value={site.social[key]}
              onChange={(v) =>
                updateSection("site", { ...site, social: { ...site.social, [key]: v } })
              }
            />
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-medium text-[#a3c9a8]">Assets</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <MediaPicker
            label="Logo"
            value={site.assets.logo}
            onChange={(v) =>
              updateSection("site", { ...site, assets: { ...site.assets, logo: v } })
            }
          />
          <MediaPicker
            label="Profile Photo"
            value={site.assets.profile}
            onChange={(v) =>
              updateSection("site", { ...site, assets: { ...site.assets, profile: v } })
            }
          />
          <MediaPicker
            label="Background"
            value={site.assets.background}
            onChange={(v) =>
              updateSection("site", { ...site, assets: { ...site.assets, background: v } })
            }
          />
          <MediaPicker
            label="OG Image"
            value={site.assets.ogImage}
            onChange={(v) =>
              updateSection("site", { ...site, assets: { ...site.assets, ogImage: v } })
            }
          />
        </div>
      </div>
    </div>
  );
}

function renderHeroTab(hero: HeroSettings, updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <AdminField label="Badge" value={hero.badge} onChange={(v) => updateSection("hero", { ...hero, badge: v })} />
      <AdminField label="Headline" value={hero.headline} onChange={(v) => updateSection("hero", { ...hero, headline: v })} />
      <AdminField
        label="Headline Accent"
        value={hero.headlineAccent}
        onChange={(v) => updateSection("hero", { ...hero, headlineAccent: v })}
      />
      <AdminField
        label="Subheadline"
        value={hero.subheadline}
        onChange={(v) => updateSection("hero", { ...hero, subheadline: v })}
        multiline
        rows={3}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="Primary CTA"
          value={hero.primaryCta}
          onChange={(v) => updateSection("hero", { ...hero, primaryCta: v })}
        />
        <AdminField
          label="Secondary CTA"
          value={hero.secondaryCta}
          onChange={(v) => updateSection("hero", { ...hero, secondaryCta: v })}
        />
      </div>
    </div>
  );
}

function renderStatsTab(stats: StatItem[], updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      {stats.map((stat, i) => (
        <SectionCard
          key={i}
          title={`Stat ${i + 1}`}
          onRemove={() => updateSection("stats", stats.filter((_, idx) => idx !== i))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField
              label="Label"
              value={stat.label}
              onChange={(v) => {
                const next = [...stats];
                next[i] = { ...stat, label: v };
                updateSection("stats", next);
              }}
            />
            <AdminField
              label="Value"
              value={stat.value}
              onChange={(v) => {
                const next = [...stats];
                next[i] = { ...stat, value: v };
                updateSection("stats", next);
              }}
            />
          </div>
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => updateSection("stats", [...stats, { label: "", value: "" }])}
      >
        + Add Stat
      </Button>
    </div>
  );
}

function renderProcessTab(steps: ProcessStep[], updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        Edit the step titles and descriptions here. Section headings are in{" "}
        <strong className="text-[#a3c9a8]">Process Headings</strong>.
      </p>
      {steps.map((step, i) => (
        <SectionCard
          key={i}
          title={`Step ${step.step}`}
          onRemove={() => updateSection("process", steps.filter((_, idx) => idx !== i))}
        >
          <AdminField
            label="Step Number"
            type="number"
            value={String(step.step)}
            onChange={(v) => {
              const next = [...steps];
              next[i] = { ...step, step: parseInt(v, 10) || 0 };
              updateSection("process", next);
            }}
          />
          <AdminField
            label="Title"
            value={step.title}
            onChange={(v) => {
              const next = [...steps];
              next[i] = { ...step, title: v };
              updateSection("process", next);
            }}
          />
          <AdminField
            label="Description"
            value={step.description}
            onChange={(v) => {
              const next = [...steps];
              next[i] = { ...step, description: v };
              updateSection("process", next);
            }}
            multiline
            rows={3}
          />
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          updateSection("process", [
            ...steps,
            { step: steps.length + 1, title: "", description: "" },
          ])
        }
      >
        + Add Step
      </Button>
    </div>
  );
}

function renderProcessIntroTab(
  processIntro: ProcessIntroSettings,
  updateSection: ContentSectionFormsProps["updateSection"],
) {
  return (
    <div className="space-y-4">
      <PageIntroFields
        label="Homepage process section"
        intro={processIntro.homepage}
        onChange={(homepage) => updateSection("processIntro", { ...processIntro, homepage })}
      />
      <PageIntroFields
        label="Hire Me page process section"
        intro={processIntro.hireMe}
        onChange={(hireMe) => updateSection("processIntro", { ...processIntro, hireMe })}
      />
    </div>
  );
}

function renderAboutTab(about: AboutSettings, updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        This content appears on your <strong className="text-[#a3c9a8]">/about page</strong> only. Edit Tech Stack
        separately for the tools list at the bottom of /about.
      </p>
      <AdminField
        label="Page eyebrow"
        value={about.pageEyebrow}
        onChange={(v) => updateSection("about", { ...about, pageEyebrow: v })}
      />
      <AdminField
        label="Headline"
        value={about.headline}
        onChange={(v) => updateSection("about", { ...about, headline: v })}
      />
      <AdminField
        label="Intro"
        value={about.intro}
        onChange={(v) => updateSection("about", { ...about, intro: v })}
        multiline
        rows={2}
        hint="Shown below the headline on /about"
      />
      <AdminField
        label="Homepage teaser"
        value={about.homepageTeaser}
        onChange={(v) => updateSection("about", { ...about, homepageTeaser: v })}
        multiline
        rows={3}
        hint="Short preview text on the homepage About section"
      />
      <AdminField
        label="Story"
        value={about.story}
        onChange={(v) => updateSection("about", { ...about, story: v })}
        multiline
        rows={6}
        hint="/about page only — use blank lines between paragraphs"
      />
      <ArrayFieldEditor
        label="Skills"
        items={about.skills}
        onChange={(skills) => updateSection("about", { ...about, skills })}
        placeholder="Add Skill"
      />
      <AdminField
        label="Skills eyebrow"
        value={about.skillsEyebrow}
        onChange={(v) => updateSection("about", { ...about, skillsEyebrow: v })}
      />
      <AdminField
        label="Skills section title"
        value={about.skillsHeadline}
        onChange={(v) => updateSection("about", { ...about, skillsHeadline: v })}
        hint="/about page"
      />
      <AdminField
        label="Skills section subtitle"
        value={about.skillsSubtitle}
        onChange={(v) => updateSection("about", { ...about, skillsSubtitle: v })}
        multiline
        rows={2}
        hint="/about page"
      />
      <AdminField
        label="Tech stack heading"
        value={about.techStackHeadline}
        onChange={(v) => updateSection("about", { ...about, techStackHeadline: v })}
        hint="Title above the tech list on /about (edit list in Tech Stack section)"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="Homepage primary button"
          value={about.homepagePrimaryCta}
          onChange={(v) => updateSection("about", { ...about, homepagePrimaryCta: v })}
        />
        <AdminField
          label="Homepage secondary button"
          value={about.homepageSecondaryCta}
          onChange={(v) => updateSection("about", { ...about, homepageSecondaryCta: v })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="Primary button"
          value={about.primaryCta}
          onChange={(v) => updateSection("about", { ...about, primaryCta: v })}
        />
        <AdminField
          label="Secondary button"
          value={about.secondaryCta}
          onChange={(v) => updateSection("about", { ...about, secondaryCta: v })}
        />
      </div>
    </div>
  );
}

function renderServicesTab(services: ServiceItem[], updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        Individual service cards on <strong className="text-[#a3c9a8]">/services</strong>. Page headings and bottom
        CTA are in <strong className="text-[#a3c9a8]">Services Page</strong>.
      </p>
      {services.map((service, i) => (
        <SectionCard
          key={service.id || i}
          title={service.title || `Service ${i + 1}`}
          onRemove={() => updateSection("services", services.filter((_, idx) => idx !== i))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField
              label="ID"
              value={service.id}
              onChange={(v) => {
                const next = [...services];
                next[i] = { ...service, id: v };
                updateSection("services", next);
              }}
              hint="URL-friendly slug"
            />
            <AdminField
              label="Icon"
              value={service.icon}
              onChange={(v) => {
                const next = [...services];
                next[i] = { ...service, icon: v };
                updateSection("services", next);
              }}
            />
          </div>
          <AdminField
            label="Title"
            value={service.title}
            onChange={(v) => {
              const next = [...services];
              next[i] = { ...service, title: v };
              updateSection("services", next);
            }}
          />
          <AdminField
            label="Description"
            value={service.description}
            onChange={(v) => {
              const next = [...services];
              next[i] = { ...service, description: v };
              updateSection("services", next);
            }}
            multiline
            rows={3}
          />
          <AdminField
            label="Starting Price"
            value={service.startingPrice}
            onChange={(v) => {
              const next = [...services];
              next[i] = { ...service, startingPrice: v };
              updateSection("services", next);
            }}
          />
          <ArrayFieldEditor
            label="Benefits"
            items={service.benefits}
            onChange={(benefits) => {
              const next = [...services];
              next[i] = { ...service, benefits };
              updateSection("services", next);
            }}
            placeholder="Add Benefit"
          />
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          updateSection("services", [
            ...services,
            {
              id: `service-${Date.now()}`,
              title: "",
              description: "",
              benefits: [],
              startingPrice: "",
              icon: "layout",
            },
          ])
        }
      >
        + Add Service
      </Button>
    </div>
  );
}

function renderServicesPageTab(
  servicesPage: ServicesPageSettings,
  updateSection: ContentSectionFormsProps["updateSection"],
) {
  return (
    <div className="space-y-4">
      <PageIntroFields
        label="Homepage preview"
        intro={servicesPage.homepageIntro}
        onChange={(homepageIntro) => updateSection("servicesPage", { ...servicesPage, homepageIntro })}
      />
      <AdminField
        label="Homepage button"
        value={servicesPage.homepageButton}
        onChange={(v) => updateSection("servicesPage", { ...servicesPage, homepageButton: v })}
      />
      <PageIntroFields
        label="Page header"
        intro={servicesPage.intro}
        onChange={(intro) => updateSection("servicesPage", { ...servicesPage, intro })}
      />
      <AdminField
        label="Bottom CTA title"
        value={servicesPage.bottomCtaTitle}
        onChange={(v) => updateSection("servicesPage", { ...servicesPage, bottomCtaTitle: v })}
      />
      <AdminField
        label="Bottom CTA body"
        value={servicesPage.bottomCtaBody}
        onChange={(v) => updateSection("servicesPage", { ...servicesPage, bottomCtaBody: v })}
        multiline
        rows={3}
      />
      <AdminField
        label="Bottom CTA button"
        value={servicesPage.bottomCtaButton}
        onChange={(v) => updateSection("servicesPage", { ...servicesPage, bottomCtaButton: v })}
      />
    </div>
  );
}

function renderHireMePageTab(
  hireMePage: HireMePageSettings,
  updateSection: ContentSectionFormsProps["updateSection"],
) {
  const updateReason = (i: number, reason: HireMeReason) => {
    const next = [...hireMePage.reasons];
    next[i] = reason;
    updateSection("hireMePage", { ...hireMePage, reasons: next });
  };

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        Controls the full <strong className="text-[#a3c9a8]">/hire-me page</strong>. Process steps and headings are in
        Process Steps / Process Headings sections.
      </p>
      <AdminField
        label="Hero badge"
        value={hireMePage.heroBadge}
        onChange={(v) => updateSection("hireMePage", { ...hireMePage, heroBadge: v })}
      />
      <AdminField
        label="Hero title"
        value={hireMePage.heroTitle}
        onChange={(v) => updateSection("hireMePage", { ...hireMePage, heroTitle: v })}
      />
      <AdminField
        label="Hero title accent"
        value={hireMePage.heroTitleAccent}
        onChange={(v) => updateSection("hireMePage", { ...hireMePage, heroTitleAccent: v })}
      />
      <AdminField
        label="Hero subtitle"
        value={hireMePage.heroSubtitle}
        onChange={(v) => updateSection("hireMePage", { ...hireMePage, heroSubtitle: v })}
        multiline
        rows={3}
      />
      <PageIntroFields
        label="Why hire me section"
        intro={hireMePage.whyHireIntro}
        onChange={(whyHireIntro) => updateSection("hireMePage", { ...hireMePage, whyHireIntro })}
      />
      <h4 className="text-sm font-medium text-[#a3c9a8]">Benefit cards</h4>
      {hireMePage.reasons.map((reason, i) => (
        <SectionCard
          key={i}
          title={reason.title || `Benefit ${i + 1}`}
          onRemove={() =>
            updateSection("hireMePage", {
              ...hireMePage,
              reasons: hireMePage.reasons.filter((_, idx) => idx !== i),
            })
          }
        >
          <AdminField label="Title" value={reason.title} onChange={(v) => updateReason(i, { ...reason, title: v })} />
          <AdminField
            label="Description"
            value={reason.description}
            onChange={(v) => updateReason(i, { ...reason, description: v })}
            multiline
            rows={3}
          />
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          updateSection("hireMePage", {
            ...hireMePage,
            reasons: [...hireMePage.reasons, { title: "", description: "" }],
          })
        }
      >
        + Add benefit
      </Button>
      <PageIntroFields
        label="Pricing teaser section"
        intro={hireMePage.pricingTeaser}
        onChange={(pricingTeaser) => updateSection("hireMePage", { ...hireMePage, pricingTeaser })}
      />
      <AdminField
        label="Pricing button"
        value={hireMePage.pricingButton}
        onChange={(v) => updateSection("hireMePage", { ...hireMePage, pricingButton: v })}
      />
      <PageIntroFields
        label="Contact form section"
        intro={hireMePage.formIntro}
        onChange={(formIntro) => updateSection("hireMePage", { ...hireMePage, formIntro })}
      />
      <AdminField
        label="Email prompt"
        value={hireMePage.emailPrompt}
        onChange={(v) => updateSection("hireMePage", { ...hireMePage, emailPrompt: v })}
        hint='Shown above email link, e.g. "Prefer email?"'
      />
    </div>
  );
}

function renderContactTab(contact: ContactPageSettings, updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <PageIntroFields
        label="Page header"
        intro={contact.intro}
        onChange={(intro) => updateSection("contact", { ...contact, intro })}
      />
      <AdminField
        label="Direct contact label"
        value={contact.directContactLabel}
        onChange={(v) => updateSection("contact", { ...contact, directContactLabel: v })}
      />
      <AdminField
        label="Next steps label"
        value={contact.nextStepsLabel}
        onChange={(v) => updateSection("contact", { ...contact, nextStepsLabel: v })}
      />
      <ArrayFieldEditor
        label="Next steps"
        items={contact.nextSteps}
        onChange={(nextSteps) => updateSection("contact", { ...contact, nextSteps })}
        placeholder="Add step"
      />
    </div>
  );
}

function renderPortfolioPageTab(
  portfolioPage: PortfolioPageSettings,
  updateSection: ContentSectionFormsProps["updateSection"],
) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        Project cards come from <strong className="text-[#a3c9a8]">Portfolio admin</strong>. Edit headings here.
      </p>
      <PageIntroFields
        label="Homepage portfolio preview"
        intro={portfolioPage.homepageIntro}
        onChange={(homepageIntro) => updateSection("portfolioPage", { ...portfolioPage, homepageIntro })}
      />
      <AdminField
        label="Homepage button text"
        value={portfolioPage.homepageButton}
        onChange={(v) => updateSection("portfolioPage", { ...portfolioPage, homepageButton: v })}
      />
      <PageIntroFields
        label="Full portfolio page (/portfolio)"
        intro={portfolioPage.pageIntro}
        onChange={(pageIntro) => updateSection("portfolioPage", { ...portfolioPage, pageIntro })}
      />
    </div>
  );
}

function renderTestimonialsPageTab(
  testimonialsPage: TestimonialsPageSettings,
  updateSection: ContentSectionFormsProps["updateSection"],
) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        Review cards come from <strong className="text-[#a3c9a8]">Testimonials admin</strong>. Edit headings here.
      </p>
      <PageIntroFields
        label="Homepage testimonials preview"
        intro={testimonialsPage.homepageIntro}
        onChange={(homepageIntro) => updateSection("testimonialsPage", { ...testimonialsPage, homepageIntro })}
      />
      <AdminField
        label="Homepage button text"
        value={testimonialsPage.homepageButton}
        onChange={(v) => updateSection("testimonialsPage", { ...testimonialsPage, homepageButton: v })}
      />
      <PageIntroFields
        label="Full testimonials page (/testimonials)"
        intro={testimonialsPage.pageIntro}
        onChange={(pageIntro) => updateSection("testimonialsPage", { ...testimonialsPage, pageIntro })}
      />
    </div>
  );
}

function moveItemToIndex<T>(items: T[], from: number, finalIndex: number): T[] {
  if (
    from === finalIndex ||
    from < 0 ||
    finalIndex < 0 ||
    from >= items.length ||
    finalIndex > items.length
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(finalIndex, 0, moved);
  return next;
}

function PricingTierDropSlot({
  index,
  active,
  onDragOver,
  onDrop,
}: {
  index: number;
  active: boolean;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
}) {
  return (
    <div
      className={cn(
        "relative transition-all",
        active ? "h-8" : "h-4",
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver(index);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDrop(index);
      }}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full transition-all",
          active ? "h-1 bg-[var(--admin-gold)] shadow-[0_0_10px_rgba(212,175,55,0.55)]" : "h-px bg-[var(--admin-border-subtle)]/60",
        )}
      />
      {active && (
        <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[var(--admin-gold)]" />
      )}
    </div>
  );
}

function PricingTiersEditor({
  tiers,
  onTiersChange,
}: {
  tiers: PricingTier[];
  onTiersChange: (tiers: PricingTier[]) => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const updateTier = (i: number, tier: PricingTier) => {
    const next = [...tiers];
    next[i] = tier;
    onTiersChange(next);
  };

  const moveTier = (from: number, toIndex: number) => {
    onTiersChange(moveItemToIndex(tiers, from, toIndex));
  };

  const finishDrag = (toIndex: number) => {
    if (dragIndex.current === null) return;
    moveTier(dragIndex.current, toIndex);
    dragIndex.current = null;
    setDropIndex(null);
    setDraggingIndex(null);
  };

  const clearDrag = () => {
    dragIndex.current = null;
    setDropIndex(null);
    setDraggingIndex(null);
  };

  return (
    <div>
      <h4 className="mb-1 text-sm font-medium text-[#a3c9a8]">Pricing Tiers</h4>
      <p className="mb-4 text-xs text-[var(--admin-text-muted)]">
        Use the arrows or drag the colored bar on each card to set the exact order (left to right) on the homepage
        and <strong className="text-[#a3c9a8]">/pricing</strong> page. Click{" "}
        <strong className="text-[#a3c9a8]">Save Section</strong> when finished.
      </p>
      <div
        className="space-y-0"
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDropIndex(null);
          }
        }}
      >
        <PricingTierDropSlot
          index={0}
          active={dropIndex === 0}
          onDragOver={setDropIndex}
          onDrop={finishDrag}
        />
        {tiers.map((tier, i) => (
          <div key={tier.id || `tier-${i}`}>
            <div
              className={cn(
                "admin-luxury-card overflow-hidden rounded-xl transition-opacity",
                draggingIndex === i && "opacity-50",
              )}
            >
              <div
                draggable
                onDragStart={(e) => {
                  dragIndex.current = i;
                  setDraggingIndex(i);
                  setDropIndex(null);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", String(i));
                }}
                onDragOver={(e) => {
                  if (dragIndex.current === null || dragIndex.current === i) return;
                  e.preventDefault();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const insertBefore = e.clientY < rect.top + rect.height / 2;
                  setDropIndex(insertBefore ? i : i + 1);
                }}
                onDragEnd={clearDrag}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dropIndex !== null) finishDrag(dropIndex);
                }}
                className="flex cursor-grab items-center gap-3 border-b border-[var(--admin-border-subtle)] bg-[#6f8f72]/10 px-4 py-3 touch-none active:cursor-grabbing"
              >
                <DragHandleIcon className="h-4 w-4 shrink-0 text-[var(--admin-gold-light)]" />
                <span className="shrink-0 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--admin-gold-light)]">
                  Position {i + 1}
                </span>
                <h4 className="min-w-0 flex-1 truncate text-sm font-medium text-[#a3c9a8]">
                  {tier.name || `Tier ${i + 1}`}
                </h4>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveTier(i, i - 1)}
                    className="rounded-md border border-[var(--admin-border-subtle)] px-2 py-1 text-xs text-[var(--admin-text-muted)] transition-colors hover:border-[var(--admin-gold)]/40 hover:text-[var(--admin-gold-light)] disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Move ${tier.name || `tier ${i + 1}`} earlier`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === tiers.length - 1}
                    onClick={() => moveTier(i, i + 1)}
                    className="rounded-md border border-[var(--admin-border-subtle)] px-2 py-1 text-xs text-[var(--admin-text-muted)] transition-colors hover:border-[var(--admin-gold)]/40 hover:text-[var(--admin-gold-light)] disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Move ${tier.name || `tier ${i + 1}`} later`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => onTiersChange(tiers.filter((_, idx) => idx !== i))}
                    className="ml-1 text-xs text-red-400/80 transition-colors hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="space-y-3 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminField label="ID" value={tier.id} onChange={(v) => updateTier(i, { ...tier, id: v })} />
                  <AdminField label="Name" value={tier.name} onChange={(v) => updateTier(i, { ...tier, name: v })} />
                  <AdminField
                    label="Price"
                    type="number"
                    value={tier.price === null ? "" : String(tier.price)}
                    onChange={(v) => updateTier(i, { ...tier, price: v === "" ? null : parseInt(v, 10) })}
                    hint="Leave empty for custom quote"
                  />
                  <AdminField
                    label="Price Label"
                    value={tier.priceLabel}
                    onChange={(v) => updateTier(i, { ...tier, priceLabel: v })}
                  />
                </div>
                <AdminField
                  label="Description"
                  value={tier.description}
                  onChange={(v) => updateTier(i, { ...tier, description: v })}
                  multiline
                  rows={2}
                />
                <AdminField label="CTA Text" value={tier.cta} onChange={(v) => updateTier(i, { ...tier, cta: v })} />
                <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
                  <input
                    type="checkbox"
                    checked={tier.highlighted}
                    onChange={(e) => updateTier(i, { ...tier, highlighted: e.target.checked })}
                    className="rounded border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-emerald)] focus:ring-[var(--admin-gold)]"
                  />
                  Highlighted tier
                </label>
                <ArrayFieldEditor
                  label="Features"
                  items={tier.features}
                  onChange={(features) => updateTier(i, { ...tier, features })}
                  placeholder="Add Feature"
                />
              </div>
            </div>
            <PricingTierDropSlot
              index={i + 1}
              active={dropIndex === i + 1}
              onDragOver={setDropIndex}
              onDrop={finishDrag}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() =>
            onTiersChange([
              ...tiers,
              {
                id: `tier-${Date.now()}`,
                name: "",
                price: null,
                priceLabel: "",
                description: "",
                features: [],
                highlighted: false,
                cta: "Get Started",
              },
            ])
          }
        >
          + Add Tier
        </Button>
      </div>
    </div>
  );
}

function renderPricingTab(pricing: CMSContent["pricing"], updateSection: ContentSectionFormsProps["updateSection"]) {
  const updateFaq = (i: number, faq: PricingFaq) => {
    const next = [...pricing.faqs];
    next[i] = faq;
    updateSection("pricing", { ...pricing, faqs: next });
  };

  return (
    <div className="space-y-8">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        This controls your <strong className="text-[#a3c9a8]">/pricing page</strong> and homepage pricing preview.
        After editing tier names, prices, or FAQs, click <strong className="text-[#a3c9a8]">Save Section</strong> — do
        not use Seed Defaults unless you want to wipe custom pricing.
      </p>
      <PageIntroFields
        label="Page header"
        intro={pricing.intro}
        onChange={(intro) => updateSection("pricing", { ...pricing, intro })}
      />
      <AdminField
        label="Homepage button"
        value={pricing.homepageButton}
        onChange={(v) => updateSection("pricing", { ...pricing, homepageButton: v })}
        hint="Link text below pricing cards on the homepage"
      />
      <PricingTiersEditor
        tiers={pricing.tiers}
        onTiersChange={(tiers) => updateSection("pricing", { ...pricing, tiers })}
      />
      <PageIntroFields
        label="FAQ section header"
        intro={pricing.faqIntro}
        onChange={(faqIntro) => updateSection("pricing", { ...pricing, faqIntro })}
      />
      <div>
        <h4 className="mb-4 text-sm font-medium text-[#a3c9a8]">FAQs</h4>
        <div className="space-y-4">
          {pricing.faqs.map((faq, i) => (
            <SectionCard
              key={i}
              title={`FAQ ${i + 1}`}
              onRemove={() =>
                updateSection("pricing", {
                  ...pricing,
                  faqs: pricing.faqs.filter((_, idx) => idx !== i),
                })
              }
            >
              <AdminField
                label="Question"
                value={faq.question}
                onChange={(v) => updateFaq(i, { ...faq, question: v })}
              />
              <AdminField
                label="Answer"
                value={faq.answer}
                onChange={(v) => updateFaq(i, { ...faq, answer: v })}
                multiline
                rows={3}
              />
            </SectionCard>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              updateSection("pricing", {
                ...pricing,
                faqs: [...pricing.faqs, { question: "", answer: "" }],
              })
            }
          >
            + Add FAQ
          </Button>
        </div>
      </div>
      <AdminField
        label="Closing text"
        value={pricing.closingText}
        onChange={(v) => updateSection("pricing", { ...pricing, closingText: v })}
        multiline
        rows={2}
      />
      <AdminField
        label="Closing button"
        value={pricing.closingCta}
        onChange={(v) => updateSection("pricing", { ...pricing, closingCta: v })}
      />
    </div>
  );
}

function renderCtaTab(cta: CtaSettings, updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <AdminField label="Eyebrow" value={cta.eyebrow} onChange={(v) => updateSection("cta", { ...cta, eyebrow: v })} />
      <AdminField label="Headline" value={cta.headline} onChange={(v) => updateSection("cta", { ...cta, headline: v })} />
      <AdminField
        label="Headline Accent"
        value={cta.headlineAccent}
        onChange={(v) => updateSection("cta", { ...cta, headlineAccent: v })}
      />
      <AdminField
        label="Body"
        value={cta.body}
        onChange={(v) => updateSection("cta", { ...cta, body: v })}
        multiline
        rows={3}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField
          label="Primary CTA"
          value={cta.primaryCta}
          onChange={(v) => updateSection("cta", { ...cta, primaryCta: v })}
        />
        <AdminField
          label="Secondary CTA"
          value={cta.secondaryCta}
          onChange={(v) => updateSection("cta", { ...cta, secondaryCta: v })}
        />
      </div>
    </div>
  );
}

function renderTechStackTab(items: TechItem[], updateSection: ContentSectionFormsProps["updateSection"]) {
  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-[#6f8f72]/20 bg-[#6f8f72]/5 px-4 py-3 text-sm text-[var(--admin-text-muted)]">
        These tools appear at the bottom of your <strong className="text-[#a3c9a8]">/about page</strong>. Edit the section title in the <strong className="text-[#a3c9a8]">About</strong> section.
      </p>
      {items.map((item, i) => (
        <SectionCard
          key={i}
          title={item.name || `Tech ${i + 1}`}
          onRemove={() => updateSection("techStack", items.filter((_, idx) => idx !== i))}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField
              label="Name"
              value={item.name}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, name: v };
                updateSection("techStack", next);
              }}
            />
            <AdminField
              label="Category"
              value={item.category}
              onChange={(v) => {
                const next = [...items];
                next[i] = { ...item, category: v };
                updateSection("techStack", next);
              }}
            />
          </div>
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => updateSection("techStack", [...items, { name: "", category: "" }])}
      >
        + Add Technology
      </Button>
    </div>
  );
}

function renderExperienceTab(
  experience: ExperienceSettings,
  updateSection: ContentSectionFormsProps["updateSection"],
) {
  const updateItem = (i: number, item: ExperienceItem) => {
    const next = [...experience.items];
    next[i] = item;
    updateSection("experience", { ...experience, items: next });
  };

  return (
    <div className="space-y-4">
      <AdminField
        label="Eyebrow"
        value={experience.eyebrow}
        onChange={(v) => updateSection("experience", { ...experience, eyebrow: v })}
      />
      <AdminField
        label="Headline"
        value={experience.headline}
        onChange={(v) => updateSection("experience", { ...experience, headline: v })}
      />
      <AdminField
        label="Subtitle"
        value={experience.subtitle}
        onChange={(v) => updateSection("experience", { ...experience, subtitle: v })}
        multiline
        rows={2}
      />
      {experience.items.map((item, i) => (
        <SectionCard
          key={item.id || i}
          title={item.role || `Entry ${i + 1}`}
          onRemove={() =>
            updateSection("experience", {
              ...experience,
              items: experience.items.filter((_, idx) => idx !== i),
            })
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="ID" value={item.id} onChange={(v) => updateItem(i, { ...item, id: v })} />
            <AdminField
              label="Period"
              value={item.period}
              onChange={(v) => updateItem(i, { ...item, period: v })}
            />
          </div>
          <AdminField label="Role" value={item.role} onChange={(v) => updateItem(i, { ...item, role: v })} />
          <AdminField
            label="Company"
            value={item.company}
            onChange={(v) => updateItem(i, { ...item, company: v })}
          />
          <AdminField
            label="Description"
            value={item.description}
            onChange={(v) => updateItem(i, { ...item, description: v })}
            multiline
            rows={3}
          />
          <ArrayFieldEditor
            label="Highlights"
            items={item.highlights}
            onChange={(highlights) => updateItem(i, { ...item, highlights })}
            placeholder="Add Highlight"
          />
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          updateSection("experience", {
            ...experience,
            items: [
              ...experience.items,
              {
                id: `exp-${Date.now()}`,
                role: "",
                company: "",
                period: "",
                description: "",
                highlights: [],
              },
            ],
          })
        }
      >
        + Add Experience
      </Button>
    </div>
  );
}

function renderEducationTab(
  education: EducationSettings,
  updateSection: ContentSectionFormsProps["updateSection"],
) {
  const updateItem = (i: number, item: EducationItem) => {
    const next = [...education.items];
    next[i] = item;
    updateSection("education", { ...education, items: next });
  };

  return (
    <div className="space-y-4">
      <AdminField
        label="Eyebrow"
        value={education.eyebrow}
        onChange={(v) => updateSection("education", { ...education, eyebrow: v })}
      />
      <AdminField
        label="Headline"
        value={education.headline}
        onChange={(v) => updateSection("education", { ...education, headline: v })}
      />
      <AdminField
        label="Subtitle"
        value={education.subtitle}
        onChange={(v) => updateSection("education", { ...education, subtitle: v })}
        multiline
        rows={2}
      />
      {education.items.map((item, i) => (
        <SectionCard
          key={item.id || i}
          title={item.title || `Item ${i + 1}`}
          onRemove={() =>
            updateSection("education", {
              ...education,
              items: education.items.filter((_, idx) => idx !== i),
            })
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label="ID" value={item.id} onChange={(v) => updateItem(i, { ...item, id: v })} />
            <AdminField label="Year" value={item.year} onChange={(v) => updateItem(i, { ...item, year: v })} />
          </div>
          <AdminField label="Title" value={item.title} onChange={(v) => updateItem(i, { ...item, title: v })} />
          <AdminField
            label="Provider"
            value={item.provider}
            onChange={(v) => updateItem(i, { ...item, provider: v })}
          />
          <AdminField
            label="Description"
            value={item.description}
            onChange={(v) => updateItem(i, { ...item, description: v })}
            multiline
            rows={3}
          />
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          updateSection("education", {
            ...education,
            items: [
              ...education.items,
              {
                id: `edu-${Date.now()}`,
                title: "",
                provider: "",
                year: "",
                description: "",
              },
            ],
          })
        }
      >
        + Add Education Item
      </Button>
    </div>
  );
}

function renderFaqTab(faq: FaqSettings, updateSection: ContentSectionFormsProps["updateSection"]) {
  const updateItem = (i: number, item: FaqItem) => {
    const next = [...faq.items];
    next[i] = item;
    updateSection("faq", { ...faq, items: next });
  };

  return (
    <div className="space-y-4">
      <AdminField
        label="Eyebrow"
        value={faq.eyebrow}
        onChange={(v) => updateSection("faq", { ...faq, eyebrow: v })}
      />
      <AdminField
        label="Headline"
        value={faq.headline}
        onChange={(v) => updateSection("faq", { ...faq, headline: v })}
      />
      <AdminField
        label="Subtitle"
        value={faq.subtitle}
        onChange={(v) => updateSection("faq", { ...faq, subtitle: v })}
        multiline
        rows={2}
      />
      {faq.items.map((item, i) => (
        <SectionCard
          key={i}
          title={`FAQ ${i + 1}`}
          onRemove={() =>
            updateSection("faq", {
              ...faq,
              items: faq.items.filter((_, idx) => idx !== i),
            })
          }
        >
          <AdminField
            label="Question"
            value={item.question}
            onChange={(v) => updateItem(i, { ...item, question: v })}
          />
          <AdminField
            label="Answer"
            value={item.answer}
            onChange={(v) => updateItem(i, { ...item, answer: v })}
            multiline
            rows={3}
          />
        </SectionCard>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          updateSection("faq", {
            ...faq,
            items: [...faq.items, { question: "", answer: "" }],
          })
        }
      >
        + Add FAQ
      </Button>
    </div>
  );
}

/** Add a new item to array-based CMS sections (used by Add New Section). */
export function addSectionItem(key: CMSKey, content: CMSContent): CMSContent {
  switch (key) {
    case "stats":
      return { ...content, stats: [...content.stats, { label: "", value: "" }] };
    case "process":
      return {
        ...content,
        process: [
          ...content.process,
          { step: content.process.length + 1, title: "", description: "" },
        ],
      };
    case "services":
      return {
        ...content,
        services: [
          ...content.services,
          {
            id: `service-${Date.now()}`,
            title: "",
            description: "",
            benefits: [],
            startingPrice: "",
            icon: "layout",
          },
        ],
      };
    case "techStack":
      return { ...content, techStack: [...content.techStack, { name: "", category: "" }] };
    case "faq":
      return { ...content, faq: { ...content.faq, items: [...content.faq.items, { question: "", answer: "" }] } };
    case "experience":
      return {
        ...content,
        experience: {
          ...content.experience,
          items: [
            ...content.experience.items,
            {
              id: `exp-${Date.now()}`,
              role: "",
              company: "",
              period: "",
              description: "",
              highlights: [],
            },
          ],
        },
      };
    case "education":
      return {
        ...content,
        education: {
          ...content.education,
          items: [
            ...content.education.items,
            {
              id: `edu-${Date.now()}`,
              title: "",
              provider: "",
              year: "",
              description: "",
            },
          ],
        },
      };
    case "pricing":
      return {
        ...content,
        pricing: {
          ...content.pricing,
          tiers: [
            ...content.pricing.tiers,
            {
              id: `tier-${Date.now()}`,
              name: "",
              price: null,
              priceLabel: "",
              description: "",
              features: [],
              highlighted: false,
              cta: "Get Started",
            },
          ],
        },
      };
    default:
      return content;
  }
}

/** Duplicate last item in array sections. */
export function duplicateSectionContent(key: CMSKey, content: CMSContent): CMSContent {
  switch (key) {
    case "stats": {
      const last = content.stats[content.stats.length - 1];
      if (!last) return content;
      return { ...content, stats: [...content.stats, { ...last }] };
    }
    case "process": {
      const last = content.process[content.process.length - 1];
      if (!last) return content;
      return {
        ...content,
        process: [...content.process, { ...last, step: content.process.length + 1 }],
      };
    }
    case "services": {
      const last = content.services[content.services.length - 1];
      if (!last) return content;
      return {
        ...content,
        services: [...content.services, { ...last, id: `${last.id}-copy-${Date.now()}` }],
      };
    }
    case "techStack": {
      const last = content.techStack[content.techStack.length - 1];
      if (!last) return content;
      return { ...content, techStack: [...content.techStack, { ...last }] };
    }
    case "faq": {
      const last = content.faq.items[content.faq.items.length - 1];
      if (!last) return content;
      return { ...content, faq: { ...content.faq, items: [...content.faq.items, { ...last }] } };
    }
    case "experience": {
      const last = content.experience.items[content.experience.items.length - 1];
      if (!last) return content;
      return {
        ...content,
        experience: {
          ...content.experience,
          items: [
            ...content.experience.items,
            { ...last, id: `${last.id}-copy-${Date.now()}` },
          ],
        },
      };
    }
    case "education": {
      const last = content.education.items[content.education.items.length - 1];
      if (!last) return content;
      return {
        ...content,
        education: {
          ...content.education,
          items: [
            ...content.education.items,
            { ...last, id: `${last.id}-copy-${Date.now()}` },
          ],
        },
      };
    }
    case "pricing": {
      const lastTier = content.pricing.tiers[content.pricing.tiers.length - 1];
      if (!lastTier) return content;
      return {
        ...content,
        pricing: {
          ...content.pricing,
          tiers: [
            ...content.pricing.tiers,
            { ...lastTier, id: `${lastTier.id}-copy-${Date.now()}` },
          ],
        },
      };
    }
    default:
      return content;
  }
}

export function isArraySection(key: CMSKey): boolean {
  return ["stats", "process", "services", "techStack", "faq", "experience", "education", "pricing"].includes(
    key,
  );
}
