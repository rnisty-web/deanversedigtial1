"use client";

import { useRef, useState } from "react";
import { DragHandleIcon, MoreMenuIcon, SectionIcon } from "@/components/admin/content/SectionIcon";
import type { CMSLayout } from "@/lib/cms/layout";
import type { CMSContent } from "@/lib/cms/types";
import {
  getSectionDisplayTitle,
  type SectionDefinition,
  type SectionId,
} from "@/lib/cms/sections";
import { cn } from "@/lib/utils";

type ContentSectionListProps = {
  sections: SectionDefinition[];
  activeId: string;
  layout: CMSLayout;
  content: CMSContent | null;
  reorderEnabled?: boolean;
  onSelect: (id: SectionId) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleStatus: (id: SectionId) => void;
  onDuplicate: (id: SectionId) => void;
};

export function ContentSectionList({
  sections,
  activeId,
  layout,
  content,
  reorderEnabled = true,
  onSelect,
  onReorder,
  onToggleStatus,
  onDuplicate,
}: ContentSectionListProps) {
  const dragIndex = useRef<number | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  function handleDragStart(index: number) {
    if (!reorderEnabled) return;
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    if (!reorderEnabled) return;
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    onReorder(dragIndex.current, index);
    dragIndex.current = index;
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--admin-text-muted)]">
        No sections match your search.
      </div>
    );
  }

  return (
    <div className="admin-content-section-list flex-1 overflow-y-auto p-3">
      <ul className="space-y-2">
        {sections.map((section, index) => {
          const meta = layout.meta[section.id];
          const status = meta?.status ?? "published";
          const title = getSectionDisplayTitle(section, content, meta?.displayName);
          const isActive = section.id === activeId;

          return (
            <li
              key={section.id}
              draggable={reorderEnabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "admin-content-section-item group",
                isActive && "admin-content-section-item-active",
                !reorderEnabled && "opacity-95",
              )}
            >
              <button
                type="button"
                className={cn(
                  "p-1 touch-none",
                  reorderEnabled ? "cursor-grab active:cursor-grabbing" : "cursor-default opacity-40",
                )}
                aria-label={reorderEnabled ? "Drag to reorder" : "Reorder disabled while filtering"}
                disabled={!reorderEnabled}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <DragHandleIcon />
              </button>

              <button
                type="button"
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
                onClick={() => onSelect(section.id)}
              >
                <span className="admin-content-section-icon">
                  <SectionIcon icon={section.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--admin-text)]">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">
                    {section.typeLabel}
                  </span>
                </span>
              </button>

              <span
                className={cn(
                  "admin-content-status-badge shrink-0",
                  status === "published"
                    ? "admin-content-status-published"
                    : "admin-content-status-draft",
                )}
              >
                {status === "published" ? "Published" : "Draft"}
              </span>

              <div className="relative shrink-0">
                <button
                  type="button"
                  className="rounded-lg p-1.5 text-[var(--admin-text-muted)] transition-opacity hover:bg-white/5 hover:text-[var(--admin-text)] max-lg:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Section menu"
                  aria-expanded={menuOpenId === section.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === section.id ? null : section.id);
                  }}
                >
                  <MoreMenuIcon />
                </button>
                {menuOpenId === section.id && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label="Close menu"
                      onClick={() => setMenuOpenId(null)}
                    />
                    <div className="admin-content-add-menu absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl">
                      <button
                        type="button"
                        className="admin-sidebar-menu-item w-full text-left"
                        onClick={() => {
                          onToggleStatus(section.id);
                          setMenuOpenId(null);
                        }}
                      >
                        Mark as {status === "published" ? "Draft" : "Published"}
                      </button>
                      {!section.isLinked && (
                        <button
                          type="button"
                          className="admin-sidebar-menu-item w-full text-left"
                          onClick={() => {
                            onDuplicate(section.id);
                            setMenuOpenId(null);
                          }}
                        >
                          Duplicate
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
