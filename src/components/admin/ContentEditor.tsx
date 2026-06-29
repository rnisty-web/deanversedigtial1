"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ContentEditorHeader,
  ContentFilterTabs,
} from "@/components/admin/content/ContentEditorHeader";
import {
  ContentOverviewSidebar,
  ContentOverviewStats,
} from "@/components/admin/content/ContentOverviewPanel";
import { ContentReorderBar } from "@/components/admin/content/ContentReorderBar";
import {
  addSectionItem,
  ContentSectionForms,
  duplicateSectionContent,
  isArraySection,
} from "@/components/admin/content/ContentSectionForms";
import { ContentSectionList } from "@/components/admin/content/ContentSectionList";
import {
  ContentSectionPreview,
  PreviewViewportToggle,
  type PreviewViewport,
} from "@/components/admin/content/ContentSectionPreview";
import { SectionIcon } from "@/components/admin/content/SectionIcon";
import { Button } from "@/components/ui/Button";
import { defaultCMSLayout, formatLayoutDate, getHomepageOrder, applyHomepageOrder, reorderFullOrder, type CMSLayout } from "@/lib/cms/layout";
import { computeCMSStats } from "@/lib/cms/stats";
import {
  FILTER_TABS,
  filterSectionsBySearch,
  getSectionDisplayTitle,
  getSectionsByCategory,
  isCMSKey,
  orderedSections,
  SECTION_BY_ID,
  type SectionFilter,
  type SectionId,
} from "@/lib/cms/sections";
import type { CMSContent, CMSKey } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

export function ContentEditor() {
  const [content, setContent] = useState<CMSContent | null>(null);
  const [savedContent, setSavedContent] = useState<CMSContent | null>(null);
  const [layout, setLayout] = useState<CMSLayout>(defaultCMSLayout());
  const [savedLayout, setSavedLayout] = useState<CMSLayout>(defaultCMSLayout());

  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [categoryFilter, setCategoryFilter] = useState<SectionFilter>("all");
  const [search, setSearch] = useState("");
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const [showPreview, setShowPreview] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/admin/cms");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage({ type: "error", text: data.error ?? "Failed to load content" });
      setLoading(false);
      return;
    }
    const data = await res.json();
    const nextLayout = data.layout ?? defaultCMSLayout();
    setContent(data.content);
    setSavedContent(structuredClone(data.content));
    setLayout(nextLayout);
    setSavedLayout(nextLayout);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  function updateSection<K extends CMSKey>(key: K, value: CMSContent[K]) {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const visibleSections = useMemo(() => {
    const byCategory = getSectionsByCategory(categoryFilter);
    const byOrder = orderedSections(layout.order).filter((s) => byCategory.some((c) => c.id === s.id));
    return filterSectionsBySearch(byOrder, search);
  }, [categoryFilter, layout.order, search]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of FILTER_TABS) {
      counts[tab.id] = getSectionsByCategory(tab.id).length;
    }
    return counts;
  }, []);

  const draftSections = useMemo(
    () =>
      orderedSections(layout.order).filter(
        (s) => (layout.meta[s.id]?.status ?? "published") === "draft",
      ),
    [layout],
  );

  const activeDef = SECTION_BY_ID[activeSection];
  const activeMeta = layout.meta[activeSection];
  const activeStatus = activeMeta?.status ?? "published";
  const homepageOrder = useMemo(() => getHomepageOrder(layout), [layout]);
  const cmsStats = useMemo(() => computeCMSStats(layout), [layout]);

  const draftSectionTitles = useMemo(
    () => draftSections.map((s) => ({ id: s.id, title: s.title })),
    [draftSections],
  );

  const orderDirty = useMemo(
    () => JSON.stringify(layout.order) !== JSON.stringify(savedLayout.order),
    [layout.order, savedLayout.order],
  );

  const sectionDirty = useMemo(() => {
    if (!content || !savedContent || !isCMSKey(activeSection)) return false;
    return JSON.stringify(content[activeSection]) !== JSON.stringify(savedContent[activeSection]);
  }, [activeSection, content, savedContent]);

  const listReorderEnabled = categoryFilter === "all" && !search.trim();

  function selectSection(id: SectionId) {
    if (sectionDirty && id !== activeSection) {
      const leave = window.confirm(
        "You have unsaved changes in this section. Leave without saving?",
      );
      if (!leave) return;
    }
    setActiveSection(id);
    setMessage(null);
  }

  function reorderListSections(fromIndex: number, toIndex: number) {
    if (!listReorderEnabled) return;
    setLayout((prev) => {
      const ordered = orderedSections(prev.order);
      const fromId = ordered[fromIndex]?.id;
      const toId = ordered[toIndex]?.id;
      if (!fromId || !toId) return prev;
      const fromGlobal = prev.order.indexOf(fromId);
      const toGlobal = prev.order.indexOf(toId);
      if (fromGlobal === -1 || toGlobal === -1) return prev;
      return { ...prev, order: reorderFullOrder(prev.order, fromGlobal, toGlobal) };
    });
  }

  function reorderHomepage(fromIndex: number, toIndex: number) {
    const nextHomepage = [...homepageOrder];
    const [moved] = nextHomepage.splice(fromIndex, 1);
    if (!moved) return;
    nextHomepage.splice(toIndex, 0, moved);
    setLayout((prev) => ({
      ...prev,
      order: applyHomepageOrder(prev.order, nextHomepage),
    }));
  }

  async function handleSaveSection() {
    if (!content || !isCMSKey(activeSection)) return;
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: activeSection, value: content[activeSection] }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setMessage({ type: "error", text: data.error ?? "Failed to save" });
      return;
    }

    const data = await res.json();
    if (data.layout) {
      setLayout(data.layout);
      setSavedLayout(data.layout);
    }

    setSavedContent((prev) => {
      if (!prev || !content || !isCMSKey(activeSection)) return prev;
      return { ...prev, [activeSection]: structuredClone(content[activeSection]) };
    });

    setMessage({
      type: "success",
      text: `${activeDef?.title ?? activeSection} saved — live site updated`,
    });
  }

  async function handleSaveLayout(nextLayout: CMSLayout) {
    const res = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: nextLayout }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Failed to save layout");
    }
    const data = await res.json();
    return data.layout as CMSLayout;
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    setMessage(null);
    try {
      const saved = await handleSaveLayout(layout);
      setLayout(saved);
      setSavedLayout(saved);
      setMessage({ type: "success", text: "Section order saved — live site updated" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save order",
      });
    } finally {
      setSavingOrder(false);
    }
  }

  function handleResetOrder() {
    setLayout((prev) => ({ ...prev, order: [...savedLayout.order] }));
  }

  async function handleToggleStatus(sectionId: string) {
    const previousLayout = layout;
    const current = layout.meta[sectionId]?.status ?? "published";
    const nextLayout: CMSLayout = {
      ...layout,
      meta: {
        ...layout.meta,
        [sectionId]: {
          ...layout.meta[sectionId],
          status: current === "published" ? "draft" : "published",
        },
      },
    };
    setLayout(nextLayout);
    try {
      const saved = await handleSaveLayout(nextLayout);
      setLayout(saved);
      setSavedLayout(saved);
    } catch {
      setLayout(previousLayout);
      setMessage({ type: "error", text: "Failed to update section status" });
    }
  }

  async function handlePublishDraft(sectionId: string) {
    const nextLayout: CMSLayout = {
      ...layout,
      meta: {
        ...layout.meta,
        [sectionId]: { ...layout.meta[sectionId], status: "published" },
      },
    };
    setLayout(nextLayout);
    try {
      const saved = await handleSaveLayout(nextLayout);
      setLayout(saved);
      setSavedLayout(saved);
      setActiveSection(sectionId as SectionId);
      setMessage({ type: "success", text: "Section published — live site updated" });
    } catch {
      setMessage({ type: "error", text: "Failed to publish section" });
    }
  }

  function handleDuplicate(sectionId: SectionId) {
    if (!content || !isCMSKey(sectionId)) return;
    if (!isArraySection(sectionId)) {
      void handleDuplicateObjectSection();
      return;
    }
    const next = duplicateSectionContent(sectionId, content);
    if (next === content) {
      setMessage({ type: "error", text: "Nothing to duplicate — add an item first" });
      return;
    }
    setContent(next);
    setMessage({ type: "success", text: "Item duplicated — save section to persist" });
  }

  function handleAddSectionItem() {
    if (!content || !isCMSKey(activeSection)) return;
    if (!isArraySection(activeSection)) {
      setMessage({
        type: "error",
        text: "Select an array section (Services, Stats, FAQ, etc.) to add items",
      });
      return;
    }
    setContent(addSectionItem(activeSection, content));
    setEditMode(true);
    setMessage({ type: "success", text: "Item added — save section to persist" });
  }

  async function handleSeed() {
    if (!confirm("Reset all CMS sections to defaults? Existing saved content will be overwritten.")) {
      return;
    }
    setSeeding(true);
    setMessage(null);
    const res = await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed" }),
    });
    setSeeding(false);
    if (!res.ok) {
      const data = await res.json();
      setMessage({ type: "error", text: data.error ?? "Failed to seed defaults" });
      return;
    }
    setMessage({ type: "success", text: "Defaults seeded — live site updated" });
    fetchContent();
  }

  async function handleDuplicateObjectSection() {
    if (!content || !isCMSKey(activeSection)) return;
    const value = content[activeSection];
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
      setMessage({ type: "success", text: "Section JSON copied to clipboard" });
    } catch {
      setMessage({ type: "error", text: "Could not copy to clipboard" });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-8">
        <p className="text-[var(--admin-text-muted)]">Loading content…</p>
      </div>
    );
  }

  return (
    <div className="admin-content-editor flex min-h-0 flex-1 flex-col overflow-hidden">
      <ContentEditorHeader
        search={search}
        onSearchChange={setSearch}
        onAddSection={handleAddSectionItem}
        showAddMenu={showAddMenu}
        onToggleAddMenu={() => setShowAddMenu((v) => !v)}
        draftSections={draftSections}
        onPublishDraft={handlePublishDraft}
        onSeedDefaults={handleSeed}
        seeding={seeding}
      />

      <ContentFilterTabs
        tabs={FILTER_TABS}
        active={categoryFilter}
        onChange={(id) => setCategoryFilter(id as SectionFilter)}
        counts={tabCounts}
      />

      <ContentOverviewStats stats={cmsStats} />

      {message && (
        <div
          className={cn(
            "mx-6 mt-4 rounded-lg px-4 py-3 text-sm lg:mx-8",
            message.type === "error"
              ? "border border-red-500/30 bg-red-500/10 text-red-300"
              : "border border-[#6f8f72]/30 bg-[#6f8f72]/10 text-[#a3c9a8]",
          )}
        >
          {message.text}
        </div>
      )}

      <div className="admin-content-body admin-content-body-grid min-h-0 flex-1 overflow-hidden">
        <aside className="admin-content-sidebar flex w-full max-w-[340px] shrink-0 flex-col overflow-hidden border-r border-[var(--admin-border-subtle)]">
          {!listReorderEnabled && (
            <p className="border-b border-[var(--admin-border-subtle)] px-4 py-2 text-[11px] text-[var(--admin-text-muted)]">
              Clear search and select All Sections to drag-reorder the list.
            </p>
          )}
          <ContentSectionList
            sections={visibleSections}
            activeId={activeSection}
            layout={layout}
            content={content}
            reorderEnabled={listReorderEnabled}
            onSelect={selectSection}
            onReorder={reorderListSections}
            onToggleStatus={handleToggleStatus}
            onDuplicate={handleDuplicate}
          />
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {activeDef && (
            <div className="admin-content-panel-header shrink-0 border-b border-[var(--admin-border-subtle)] px-6 py-4 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                  <span className="admin-content-section-icon mt-0.5">
                    <SectionIcon icon={activeDef.icon} />
                  </span>
                  <div>
                    <h2 className="admin-heading-serif text-xl text-[var(--admin-text)]">
                      {getSectionDisplayTitle(activeDef, content, activeMeta?.displayName)}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                      <span
                        className={cn(
                          "admin-content-status-badge",
                          activeStatus === "published"
                            ? "admin-content-status-published"
                            : "admin-content-status-draft",
                        )}
                      >
                        {activeStatus === "published" ? "Published" : "Draft"}
                      </span>
                      <span>·</span>
                      <span>Updated {formatLayoutDate(activeMeta?.updatedAt)}</span>
                      {sectionDirty && (
                        <>
                          <span>·</span>
                          <span className="text-amber-300">Unsaved changes</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <PreviewViewportToggle viewport={viewport} onChange={setViewport} />
                  <button
                    type="button"
                    className={cn("admin-btn-ghost text-xs", showPreview && "border-[var(--admin-gold)]/30")}
                    onClick={() => setShowPreview((v) => !v)}
                  >
                    Preview
                  </button>
                  {!activeDef.isLinked && (
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs"
                      onClick={() => {
                        if (isCMSKey(activeSection) && isArraySection(activeSection)) {
                          handleDuplicate(activeSection);
                        } else {
                          handleDuplicateObjectSection();
                        }
                      }}
                    >
                      Duplicate
                    </button>
                  )}
                  <button
                    type="button"
                    className={cn("admin-btn-ghost text-xs", editMode && "border-[var(--admin-gold)]/30")}
                    onClick={() => setEditMode((v) => !v)}
                  >
                    Edit Section
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 lg:px-8">
            {content && activeDef && (
              <>
                <ContentSectionPreview
                  sectionId={activeSection}
                  content={content}
                  viewport={viewport}
                  collapsed={!showPreview}
                />

                {activeDef.isLinked && activeDef.href ? (
                  <div className="admin-luxury-card mt-6 rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-[var(--admin-text)]">{activeDef.title}</h3>
                    <p className="mt-2 text-sm text-[var(--admin-text-muted)]">{activeDef.description}</p>
                    <div className="mt-4">
                      <Button href={activeDef.href} className="admin-btn-gold">
                        Open {activeDef.title} Editor →
                      </Button>
                    </div>
                  </div>
                ) : (
                  editMode &&
                  isCMSKey(activeSection) && (
                    <div className="mt-6 max-w-3xl">
                      <ContentSectionForms
                        activeKey={activeSection}
                        content={content}
                        updateSection={updateSection}
                      />
                    </div>
                  )
                )}

                {!activeDef.isLinked && isCMSKey(activeSection) && (
                  <div className="mt-8 flex flex-wrap gap-2 border-t border-[var(--admin-border-subtle)] pt-6">
                    <Button
                      type="button"
                      className="admin-btn-gold"
                      onClick={handleSaveSection}
                      disabled={saving || !sectionDirty}
                    >
                      {saving ? "Saving…" : sectionDirty ? "Save Section" : "Saved"}
                    </Button>
                    <Button type="button" variant="ghost" className="admin-btn-ghost" onClick={handleSeed} disabled={seeding}>
                      {seeding ? "Seeding…" : "Seed Defaults"}
                    </Button>
                    <Link href="/" target="_blank" className="admin-btn-ghost inline-flex items-center text-sm">
                      View on site
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <ContentOverviewSidebar
          stats={cmsStats}
          draftSectionTitles={draftSectionTitles}
          onSelectDraft={(id) => selectSection(id as SectionId)}
          onPublishDraft={handlePublishDraft}
        />
      </div>

      <ContentReorderBar
        order={homepageOrder}
        onReorder={reorderHomepage}
        onReset={handleResetOrder}
        onSave={handleSaveOrder}
        saving={savingOrder}
        dirty={orderDirty}
      />
    </div>
  );
}
