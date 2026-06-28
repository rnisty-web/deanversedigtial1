"use client";

import { useRef } from "react";
import { DragHandleIcon } from "@/components/admin/content/SectionIcon";
import { SECTION_BY_ID, type SectionId } from "@/lib/cms/sections";
import { cn } from "@/lib/utils";

type ContentReorderBarProps = {
  order: SectionId[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onReset: () => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
};

export function ContentReorderBar({
  order,
  onReorder,
  onReset,
  onSave,
  saving,
  dirty,
}: ContentReorderBarProps) {
  const dragIndex = useRef<number | null>(null);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === index) return;
    onReorder(dragIndex.current, index);
    dragIndex.current = index;
  }

  function handleDragEnd() {
    dragIndex.current = null;
  }

  return (
    <footer className="admin-content-reorder-bar shrink-0 border-t border-[var(--admin-border-subtle)] px-6 py-4 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
            Reorder Homepage Sections
          </div>
          <p className="mb-2 text-[11px] text-[var(--admin-text-muted)]">
            Drag chips to change homepage order, then click Save Order.
          </p>
          <div className="flex flex-wrap gap-2">
            {order.map((id, index) => {
              const section = SECTION_BY_ID[id];
              if (!section) return null;
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="admin-content-reorder-chip"
                >
                  <DragHandleIcon className="h-3 w-3" />
                  <span>{section.title}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className="admin-btn-ghost"
            onClick={onReset}
            disabled={!dirty || saving}
          >
            Reset Order
          </button>
          <button
            type="button"
            className={cn("admin-btn-gold", !dirty && "opacity-50")}
            onClick={onSave}
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : "Save Order"}
          </button>
        </div>
      </div>
    </footer>
  );
}
