"use client";

import type { CMSStats } from "@/lib/cms/stats";
import { getCategoryLabel } from "@/lib/cms/stats";

export function ContentOverviewStats({ stats }: { stats: CMSStats }) {
  const cards = [
    {
      label: "Total sections",
      value: stats.total,
      hint: "Across site CMS",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
    },
    {
      label: "Published",
      value: stats.published,
      hint: "Live on site",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Drafts",
      value: stats.drafts,
      hint: "Needs publishing",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a4.5 4.5 0 016.364 6.364L10.582 21.75 4.5 21.75V15.668l11.362-11.363z" />
        </svg>
      ),
    },
    {
      label: "Homepage flow",
      value: stats.homepage,
      hint: "Reorder bar sections",
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
  ];

  return (
    <div className="admin-cms-stats shrink-0 px-6 lg:px-8">
      <div className="admin-cms-stats-grid">
        {cards.map((card) => (
          <div key={card.label} className="admin-cms-stat-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-gold-light)]">{card.value}</p>
                <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{card.hint}</p>
              </div>
              <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContentOverviewSidebar({
  stats,
  draftSectionTitles,
  onSelectDraft,
  onPublishDraft,
}: {
  stats: CMSStats;
  draftSectionTitles: { id: string; title: string }[];
  onSelectDraft: (id: string) => void;
  onPublishDraft: (id: string) => void;
}) {
  return (
    <aside className="admin-cms-overview">
      <div className="admin-cms-overview-panel">
        <p className="admin-cms-overview-title">Content overview</p>
        <dl className="admin-cms-overview-meta">
          <div>
            <dt>Linked editors</dt>
            <dd>{stats.linked}</dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{stats.published}</dd>
          </div>
          <div>
            <dt>Drafts</dt>
            <dd>{stats.drafts}</dd>
          </div>
        </dl>
      </div>

      <div className="admin-cms-overview-panel">
        <p className="admin-cms-overview-title">By category</p>
        {stats.categories.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-muted)]">No sections configured.</p>
        ) : (
          <ul className="admin-cms-category-list">
            {stats.categories.map(({ category, count }) => (
              <li key={category} className="admin-cms-category-item">
                <span>{getCategoryLabel(category)}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {draftSectionTitles.length > 0 ? (
        <div className="admin-cms-overview-panel">
          <p className="admin-cms-overview-title">Draft sections</p>
          <ul className="admin-cms-draft-list">
            {draftSectionTitles.map((section) => (
              <li key={section.id} className="admin-cms-draft-item">
                <button type="button" onClick={() => onSelectDraft(section.id)} className="admin-cms-draft-name">
                  {section.title}
                </button>
                <button
                  type="button"
                  onClick={() => onPublishDraft(section.id)}
                  className="admin-cms-draft-publish"
                >
                  Publish
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="admin-cms-overview-panel">
        <p className="admin-cms-overview-title">Tips</p>
        <ul className="admin-cms-tips-list">
          <li>Use All Sections + clear search to drag-reorder the sidebar list.</li>
          <li>Homepage order is managed in the sticky bar at the bottom.</li>
          <li>Toggle Preview to compare desktop, tablet, and mobile layouts.</li>
        </ul>
      </div>
    </aside>
  );
}
