"use client";

import Image from "next/image";
import type { CMSContent } from "@/lib/cms/types";
import { SECTION_BY_ID, isCMSKey, type SectionId } from "@/lib/cms/sections";
import { cn } from "@/lib/utils";

export type PreviewViewport = "desktop" | "tablet" | "mobile";

type ContentSectionPreviewProps = {
  sectionId: SectionId;
  content: CMSContent;
  viewport: PreviewViewport;
  collapsed?: boolean;
};

const VIEWPORT_WIDTH: Record<PreviewViewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

export function ContentSectionPreview({
  sectionId,
  content,
  viewport,
  collapsed = false,
}: ContentSectionPreviewProps) {
  const section = SECTION_BY_ID[sectionId];
  const background = content.site.assets.background;

  if (collapsed) return null;

  return (
    <div className="admin-content-preview-wrap">
      <div
        className="admin-content-preview-frame mx-auto transition-all duration-300"
        style={{ maxWidth: VIEWPORT_WIDTH[viewport] }}
      >
        <div className="admin-content-preview-inner">
          {background && (
            <Image
              src={background}
              alt=""
              fill
              className="object-cover opacity-30"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          )}
          <div className="relative z-10 p-6">{renderPreviewContent(sectionId, content, section?.title)}</div>
        </div>
      </div>
    </div>
  );
}

function renderPreviewContent(sectionId: SectionId, content: CMSContent, fallbackTitle?: string) {
  if (!isCMSKey(sectionId)) {
    return (
      <PreviewBlock title={fallbackTitle ?? sectionId}>
        <p className="text-sm text-white/60">
          Managed in{" "}
          <span className="text-[#a3c9a8]">
            {sectionId === "portfolio" ? "Portfolio" : "Testimonials"}
          </span>{" "}
          admin.
        </p>
      </PreviewBlock>
    );
  }

  switch (sectionId) {
    case "site":
      return (
        <PreviewBlock title={content.site.name}>
          <p className="text-xs uppercase tracking-widest text-[#a3c9a8]">{content.site.tagline}</p>
          <p className="mt-2 text-sm text-white/70 line-clamp-3">{content.site.description}</p>
        </PreviewBlock>
      );
    case "hero":
      return (
        <PreviewBlock title="Hero">
          <span className="inline-block rounded-full border border-[#6f8f72]/40 bg-[#6f8f72]/15 px-3 py-1 text-xs text-[#a3c9a8]">
            {content.hero.badge}
          </span>
          <h3 className="mt-3 text-xl font-bold text-white">
            {content.hero.headline}{" "}
            <span className="text-[#a3c9a8]">{content.hero.headlineAccent}</span>
          </h3>
          <p className="mt-2 text-sm text-white/65 line-clamp-2">{content.hero.subheadline}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#6f8f72] px-4 py-1.5 text-xs font-medium text-white">
              {content.hero.primaryCta}
            </span>
            <span className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/80">
              {content.hero.secondaryCta}
            </span>
          </div>
        </PreviewBlock>
      );
    case "stats":
      return (
        <PreviewBlock title="Stats">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {content.stats.slice(0, 4).map((stat, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-lg font-bold text-[#a3c9a8]">{stat.value || "—"}</div>
                <div className="text-xs text-white/55">{stat.label || "Label"}</div>
              </div>
            ))}
          </div>
        </PreviewBlock>
      );
    case "about":
      return (
        <PreviewBlock title={content.about.headline}>
          <p className="text-sm text-white/70">{content.about.intro}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {content.about.skills.slice(0, 6).map((skill) => (
              <span key={skill} className="rounded-full bg-[#6f8f72]/20 px-2 py-0.5 text-xs text-[#a3c9a8]">
                {skill}
              </span>
            ))}
          </div>
        </PreviewBlock>
      );
    case "services":
      return (
        <PreviewBlock title="Services">
          <div className="grid gap-2 sm:grid-cols-2">
            {content.services.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-medium text-white">{s.title || "Service"}</div>
                <div className="mt-1 text-xs text-white/55 line-clamp-2">{s.description}</div>
              </div>
            ))}
          </div>
        </PreviewBlock>
      );
    case "pricing":
      return (
        <PreviewBlock title="Pricing">
          <div className="grid gap-2 sm:grid-cols-3">
            {content.pricing.tiers.slice(0, 3).map((tier) => (
              <div
                key={tier.id}
                className={cn(
                  "rounded-xl border p-3",
                  tier.highlighted ? "border-[#c9a962]/50 bg-[#c9a962]/10" : "border-white/10 bg-white/5",
                )}
              >
                <div className="text-sm font-medium text-white">{tier.name || "Tier"}</div>
                <div className="mt-1 text-lg font-bold text-[#a3c9a8]">
                  {tier.priceLabel || (tier.price != null ? `$${tier.price}` : "Custom")}
                </div>
              </div>
            ))}
          </div>
        </PreviewBlock>
      );
    case "cta":
      return (
        <PreviewBlock title={content.cta.headline}>
          <p className="text-xs uppercase tracking-widest text-[#a3c9a8]">{content.cta.eyebrow}</p>
          <h3 className="mt-1 text-lg font-bold text-white">
            {content.cta.headline}{" "}
            <span className="text-[#a3c9a8]">{content.cta.headlineAccent}</span>
          </h3>
          <p className="mt-2 text-sm text-white/65 line-clamp-2">{content.cta.body}</p>
        </PreviewBlock>
      );
    case "faq":
      return (
        <PreviewBlock title={content.faq.headline}>
          {content.faq.items.slice(0, 3).map((item, i) => (
            <div key={i} className="border-b border-white/10 py-2 last:border-0">
              <div className="text-sm font-medium text-white">{item.question || "Question"}</div>
              <div className="text-xs text-white/55 line-clamp-1">{item.answer}</div>
            </div>
          ))}
        </PreviewBlock>
      );
    case "process":
      return (
        <PreviewBlock title="Process">
          {content.process.slice(0, 3).map((step) => (
            <div key={step.step} className="flex gap-3 py-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#6f8f72]/25 text-xs font-bold text-[#a3c9a8]">
                {step.step}
              </span>
              <div>
                <div className="text-sm font-medium text-white">{step.title}</div>
                <div className="text-xs text-white/55 line-clamp-1">{step.description}</div>
              </div>
            </div>
          ))}
        </PreviewBlock>
      );
    case "techStack":
      return (
        <PreviewBlock title="Tech Stack">
          <div className="flex flex-wrap gap-1.5">
            {content.techStack.slice(0, 12).map((t, i) => (
              <span key={i} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/75">
                {t.name || "Tech"}
              </span>
            ))}
          </div>
        </PreviewBlock>
      );
    case "experience":
      return (
        <PreviewBlock title={content.experience.headline}>
          {content.experience.items.slice(0, 2).map((item) => (
            <div key={item.id} className="py-2">
              <div className="text-sm font-medium text-white">{item.role}</div>
              <div className="text-xs text-[#a3c9a8]">
                {item.company} · {item.period}
              </div>
            </div>
          ))}
        </PreviewBlock>
      );
    case "education":
      return (
        <PreviewBlock title={content.education.headline}>
          {content.education.items.slice(0, 2).map((item) => (
            <div key={item.id} className="py-2">
              <div className="text-sm font-medium text-white">{item.title}</div>
              <div className="text-xs text-white/55">
                {item.provider} · {item.year}
              </div>
            </div>
          ))}
        </PreviewBlock>
      );
    default:
      return (
        <PreviewBlock title={fallbackTitle ?? sectionId}>
          <p className="text-sm text-white/60">Preview not available.</p>
        </PreviewBlock>
      );
  }
}

function PreviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f1a17]/80 p-4 backdrop-blur-sm">
      <div className="mb-3 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[#a3c9a8]/80">
        Live Preview
      </div>
      <div className="text-sm font-medium text-white/90">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function PreviewViewportToggle({
  viewport,
  onChange,
}: {
  viewport: PreviewViewport;
  onChange: (v: PreviewViewport) => void;
}) {
  const options: { id: PreviewViewport; label: string; icon: string }[] = [
    { id: "desktop", label: "Desktop", icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" },
    { id: "tablet", label: "Tablet", icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
    { id: "mobile", label: "Mobile", icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75V21m3-3.75h3" },
  ];

  return (
    <div className="admin-content-viewport-toggle flex gap-1 rounded-xl border border-[var(--admin-border-subtle)] p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          title={opt.label}
          onClick={() => onChange(opt.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
            viewport === opt.id
              ? "bg-[var(--admin-gold-soft)] text-[var(--admin-gold-light)]"
              : "text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]",
          )}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
          </svg>
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
