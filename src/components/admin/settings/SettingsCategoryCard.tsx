"use client";

import Link from "next/link";
import { AdminCardMotion } from "@/components/admin/AdminMotion";
import type { SettingsCategory } from "@/lib/settings/config";
import { cn } from "@/lib/utils";

type SettingsCategoryCardProps = {
  category: SettingsCategory;
  statValue?: string;
};

export function SettingsCategoryCard({ category, statValue }: SettingsCategoryCardProps) {
  const displayStat = statValue ?? category.statFallback;

  return (
    <AdminCardMotion className="admin-settings-category-card">
      <Link href={category.href} className="admin-settings-category-link">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "admin-settings-category-icon",
              category.tone === "emerald" && "admin-settings-category-icon-emerald",
              category.tone === "neutral" && "admin-settings-category-icon-neutral",
            )}
          >
            {category.icon}
          </div>
          <span className="admin-settings-category-arrow" aria-hidden>
            →
          </span>
        </div>

        <div className="mt-4 min-w-0">
          <p className="text-base font-semibold text-[var(--admin-text)]">{category.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--admin-text-muted)]">
            {category.description}
          </p>
        </div>

        <div className="admin-settings-category-footer">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
              {category.statLabel}
            </p>
            <p className="mt-0.5 truncate text-sm text-[var(--admin-gold-light)]">{displayStat}</p>
          </div>
          <span className="admin-settings-category-cta">{category.cta}</span>
        </div>
      </Link>
    </AdminCardMotion>
  );
}
