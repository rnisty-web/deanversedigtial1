"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  PortfolioAdminHeader,
  PortfolioSelect,
  PortfolioStatCard,
} from "@/components/admin/portfolio/PortfolioAdminHeader";
import { PortfolioPagination } from "@/components/admin/portfolio/PortfolioPagination";
import { PortfolioProjectCard } from "@/components/admin/portfolio/PortfolioProjectCard";
import { Button } from "@/components/ui/Button";
import type { PortfolioCaseStudy } from "@/types";
import { cn } from "@/lib/utils";

type PortfolioItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  tags: string[];
  industry: string | null;
  case_study: PortfolioCaseStudy | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const emptyCaseStudy: PortfolioCaseStudy = {
  challenge: "",
  solution: "",
  content: "",
  results: [],
  testimonial: { quote: "", client_name: "", client_company: "" },
};

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  image_url: "",
  live_url: "",
  github_url: "",
  tags: "",
  industry: "",
  challenge: "",
  solution: "",
  content: "",
  results: "",
  testimonial_quote: "",
  testimonial_name: "",
  testimonial_company: "",
  featured: false,
  published: false,
  sort_order: "0",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function monthGrowthHint(items: PortfolioItem[]) {
  const now = new Date();
  const thisMonth = items.filter((i) => {
    const d = new Date(i.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = items.filter((i) => {
    const d = new Date(i.created_at);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  }).length;
  if (lastMonth === 0) {
    return thisMonth > 0 ? `+ ${thisMonth} this month` : "No new projects this month";
  }
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const sign = growth >= 0 ? "+" : "";
  return `${sign} ${growth}% this month`;
}

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  published: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  drafts: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  featured: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  categories: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
};

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/portfolio", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load portfolio items");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, tagFilter, statusFilter, timeFilter, perPage]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.industry) set.add(item.industry);
    });
    return Array.from(set).sort();
  }, [items]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((i) => i.published).length;
    const drafts = items.filter((i) => !i.published).length;
    const featured = items.filter((i) => i.featured).length;
    return { total, published, drafts, featured, categories: categories.length };
  }, [items, categories.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();

    return items.filter((item) => {
      if (categoryFilter !== "all" && item.industry !== categoryFilter) return false;
      if (tagFilter !== "all" && !item.tags.includes(tagFilter)) return false;
      if (statusFilter === "published" && !item.published) return false;
      if (statusFilter === "draft" && item.published) return false;
      if (statusFilter === "featured" && !item.featured) return false;

      if (timeFilter !== "all") {
        const updated = new Date(item.updated_at).getTime();
        const days =
          timeFilter === "30d" ? 30 : timeFilter === "90d" ? 90 : timeFilter === "year" ? 365 : 0;
        if (days && now - updated > days * 86400000) return false;
      }

      if (!q) return true;
      return [item.title, item.description, item.industry, item.slug, ...item.tags]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, categoryFilter, tagFilter, statusFilter, timeFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function startEdit(item: PortfolioItem) {
    const cs = item.case_study ?? emptyCaseStudy;
    setEditId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description ?? "",
      image_url: item.image_url ?? "",
      live_url: item.live_url ?? "",
      github_url: item.github_url ?? "",
      tags: item.tags.join(", "),
      industry: item.industry ?? "",
      challenge: cs.challenge ?? "",
      solution: cs.solution ?? "",
      content: cs.content ?? "",
      results: (cs.results ?? []).join("\n"),
      testimonial_quote: cs.testimonial?.quote ?? "",
      testimonial_name: cs.testimonial?.client_name ?? "",
      testimonial_company: cs.testimonial?.client_company ?? "",
      featured: item.featured,
      published: item.published,
      sort_order: item.sort_order.toString(),
    });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const caseStudy: PortfolioCaseStudy = {
      challenge: form.challenge,
      solution: form.solution,
      content: form.content,
      results: form.results
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
      testimonial:
        form.testimonial_quote || form.testimonial_name
          ? {
              quote: form.testimonial_quote,
              client_name: form.testimonial_name,
              client_company: form.testimonial_company,
            }
          : undefined,
    };

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description,
      image_url: form.image_url,
      live_url: form.live_url,
      github_url: form.github_url,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      industry: form.industry || null,
      case_study: caseStudy,
      featured: form.featured,
      published: form.published,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };

    const res = await fetch("/api/admin/portfolio", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    });

    setSaving(false);

    if (res.ok) {
      closeForm();
      fetchItems();
      setMessage(editId ? "Project updated successfully." : "Project created successfully.");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setFormError(data.error ?? "Failed to save portfolio item");
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this portfolio project?")) return;
    await fetch(`/api/admin/portfolio?id=${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    fetchItems();
  }

  async function importDefaults() {
    setSeeding(true);
    setMessage(null);
    const res = await fetch("/api/admin/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "seed" }),
    });
    setSeeding(false);
    if (res.ok) {
      setMessage("Imported portfolio projects from your site defaults.");
      fetchItems();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setMessage(data.error ?? "Failed to import portfolio items");
  }

  async function togglePublish(item: PortfolioItem) {
    await fetch("/api/admin/portfolio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    fetchItems();
  }

  return (
    <div className="admin-portfolio-page">
      <PortfolioAdminHeader
        search={search}
        onSearchChange={setSearch}
        onAddProject={openCreate}
      />

      <AdminPageContent>
        {error && (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        )}
        {message && (
          <AdminAlert tone="success" className="mb-6">
            {message}
          </AdminAlert>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <PortfolioStatCard
            label="Total Projects"
            value={stats.total}
            hint={monthGrowthHint(items)}
            icon={statIcons.total}
          />
          <PortfolioStatCard
            label="Published"
            value={stats.published}
            hint={`+ ${pct(stats.published, stats.total)} of total`}
            icon={statIcons.published}
          />
          <PortfolioStatCard
            label="Drafts"
            value={stats.drafts}
            hint={`+ ${pct(stats.drafts, stats.total)} of total`}
            icon={statIcons.drafts}
          />
          <PortfolioStatCard
            label="Featured"
            value={stats.featured}
            hint={`+ ${pct(stats.featured, stats.total)} of total`}
            icon={statIcons.featured}
          />
          <PortfolioStatCard
            label="Categories"
            value={stats.categories}
            hint="Active categories"
            icon={statIcons.categories}
          />
        </div>

        <div className="admin-portfolio-toolbar">
          <div className="flex flex-wrap gap-2">
            <PortfolioSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: "All Categories" },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
            />
            <PortfolioSelect
              value={tagFilter}
              onChange={setTagFilter}
              options={[
                { value: "all", label: "All Tags" },
                ...allTags.map((t) => ({ value: t, label: t })),
              ]}
            />
            <PortfolioSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "featured", label: "Featured" },
              ]}
            />
            <PortfolioSelect
              value={timeFilter}
              onChange={setTimeFilter}
              options={[
                { value: "all", label: "All Time" },
                { value: "30d", label: "Last 30 days" },
                { value: "90d", label: "Last 90 days" },
                { value: "year", label: "Last year" },
              ]}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="admin-portfolio-view-toggle">
              <button
                type="button"
                title="Grid view"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "admin-portfolio-view-btn",
                  viewMode === "grid" && "admin-portfolio-view-btn-active",
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </button>
              <button
                type="button"
                title="List view"
                onClick={() => setViewMode("list")}
                className={cn(
                  "admin-portfolio-view-btn",
                  viewMode === "list" && "admin-portfolio-view-btn-active",
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.008 5.25h.007v.008H3.758V12zm.008 5.25h.007v.008H3.766v-.008z" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs"
              onClick={() => {
                const el = document.querySelector(".admin-portfolio-toolbar");
                el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Filters
            </button>
            {items.length === 0 && (
              <button type="button" className="admin-btn-ghost text-xs" onClick={importDefaults} disabled={seeding}>
                {seeding ? "Importing…" : "Import defaults"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="admin-luxury-card h-72 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title="No portfolio projects"
            description="Import your public site defaults or add a new case study from scratch."
            actionLabel={items.length === 0 ? "Import defaults" : "Add New Project"}
            onAction={items.length === 0 ? importDefaults : openCreate}
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {paginated.map((item) => (
              <PortfolioProjectCard
                key={item.id}
                item={item}
                onEdit={() => startEdit(item)}
                onTogglePublish={() => togglePublish(item)}
                onDelete={() => deleteItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((item) => (
              <div key={item.id} className="admin-portfolio-list-row">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-panel)]">
                  {item.image_url ? (
                    <Image src={item.image_url} alt="" fill className="object-cover" unoptimized />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
                    {item.industry || "Project"}
                  </p>
                  <p className="truncate font-medium text-[var(--admin-text)]">{item.title}</p>
                  <p className="truncate text-xs text-[var(--admin-text-muted)]">
                    {item.description || "No description"}
                  </p>
                </div>
                <span
                  className={cn(
                    "admin-content-status-badge shrink-0",
                    item.published ? "admin-content-status-published" : "admin-content-status-draft",
                  )}
                >
                  {item.published ? "Published" : "Draft"}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={() => togglePublish(item)}>
                    {item.published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <PortfolioPagination
            page={page}
            perPage={perPage}
            total={filtered.length}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        )}

        <AdminModal
          open={showForm}
          onClose={closeForm}
          title={editId ? "Edit project" : "New project"}
          size="xl"
        >
          <form id="portfolio-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField
                label="Title"
                value={form.title}
                onChange={(v) =>
                  setForm({ ...form, title: v, slug: form.slug || slugify(v) })
                }
              />
              <AdminField
                label="Slug"
                value={form.slug}
                onChange={(v) => setForm({ ...form, slug: slugify(v) })}
                hint="/portfolio/your-slug"
              />
            </div>
            <AdminField
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              multiline
              rows={2}
            />
            <MediaPicker
              label="Cover image"
              value={form.image_url}
              onChange={(v) => setForm({ ...form, image_url: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Live URL" value={form.live_url} onChange={(v) => setForm({ ...form, live_url: v })} />
              <AdminField label="GitHub URL" value={form.github_url} onChange={(v) => setForm({ ...form, github_url: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Category / Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
              <AdminField label="Tags" value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} hint="Comma separated" />
            </div>

            <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
              <p className="mb-4 text-sm font-semibold text-[var(--admin-text)]">Case study</p>
              <div className="space-y-4">
                <AdminField label="Challenge" value={form.challenge} onChange={(v) => setForm({ ...form, challenge: v })} multiline rows={2} />
                <AdminField label="Solution" value={form.solution} onChange={(v) => setForm({ ...form, solution: v })} multiline rows={2} />
                <AdminField label="Content" value={form.content} onChange={(v) => setForm({ ...form, content: v })} multiline rows={3} />
                <AdminField label="Results" value={form.results} onChange={(v) => setForm({ ...form, results: v })} multiline rows={3} hint="One result per line" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <AdminField label="Client quote" value={form.testimonial_quote} onChange={(v) => setForm({ ...form, testimonial_quote: v })} multiline rows={2} />
                  <div className="space-y-4">
                    <AdminField label="Client name" value={form.testimonial_name} onChange={(v) => setForm({ ...form, testimonial_name: v })} />
                    <AdminField label="Client company" value={form.testimonial_company} onChange={(v) => setForm({ ...form, testimonial_company: v })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label="Sort order" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} />
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-[var(--admin-text-muted)]">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured on homepage
              </label>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-[var(--admin-text-muted)]">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                Published
              </label>
            </div>

            {formError && <AdminAlert tone="error">{formError}</AdminAlert>}

            <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
              <Button variant="ghost" size="sm" className="admin-btn-ghost" type="button" onClick={closeForm}>
                Cancel
              </Button>
              <Button size="sm" className="admin-btn-gold" type="submit" disabled={saving}>
                {saving ? "Saving…" : editId ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </AdminModal>
      </AdminPageContent>
    </div>
  );
}
