"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { TestimonialCard } from "@/components/admin/testimonials/TestimonialCard";
import {
  TestimonialSelect,
  TestimonialStatCard,
  TestimonialsAdminHeader,
} from "@/components/admin/testimonials/TestimonialsAdminHeader";
import { TestimonialsPagination } from "@/components/admin/testimonials/TestimonialsPagination";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Testimonial = {
  id: string;
  client_name: string;
  client_company: string | null;
  client_image: string | null;
  content: string;
  rating: number | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  client_name: "",
  client_company: "",
  client_image: "",
  content: "",
  rating: "5",
  featured: false,
  published: false,
};

function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function monthGrowthHint(items: Testimonial[]) {
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
    return thisMonth > 0 ? `+ ${thisMonth} this month` : "No new reviews this month";
  }
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const sign = growth >= 0 ? "+" : "";
  return `${sign} ${growth}% this month`;
}

function averageRating(items: Testimonial[]) {
  if (items.length === 0) return "—";
  const sum = items.reduce((acc, i) => acc + (i.rating ?? 5), 0);
  return (sum / items.length).toFixed(1);
}

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  published: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  drafts: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  featured: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  rating: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(6);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/testimonials", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items ?? []);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load testimonials");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, ratingFilter, timeFilter, perPage]);

  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter((i) => i.published).length;
    const drafts = items.filter((i) => !i.published).length;
    const featured = items.filter((i) => i.featured).length;
    return { total, published, drafts, featured, avgRating: averageRating(items) };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();

    return items.filter((item) => {
      if (statusFilter === "published" && !item.published) return false;
      if (statusFilter === "draft" && item.published) return false;
      if (statusFilter === "featured" && !item.featured) return false;

      if (ratingFilter !== "all") {
        const r = parseInt(ratingFilter, 10);
        if ((item.rating ?? 5) !== r) return false;
      }

      if (timeFilter !== "all") {
        const updated = new Date(item.updated_at ?? item.created_at).getTime();
        const days =
          timeFilter === "30d" ? 30 : timeFilter === "90d" ? 90 : timeFilter === "year" ? 365 : 0;
        if (days && now - updated > days * 86400000) return false;
      }

      if (!q) return true;
      return [item.client_name, item.client_company, item.content]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [items, search, statusFilter, ratingFilter, timeFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function startEdit(item: Testimonial) {
    setEditId(item.id);
    setForm({
      client_name: item.client_name,
      client_company: item.client_company ?? "",
      client_image: item.client_image ?? "",
      content: item.content,
      rating: item.rating?.toString() ?? "5",
      featured: item.featured,
      published: item.published,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const payload = { ...form, rating: parseInt(form.rating, 10) || 5 };
    const res = await fetch("/api/admin/testimonials", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    });

    setSaving(false);

    if (res.ok) {
      closeForm();
      fetchItems();
      setMessage(editId ? "Testimonial updated successfully." : "Testimonial created successfully.");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setFormError(data.error ?? "Failed to save testimonial");
  }

  async function deleteItem(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials?id=${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    fetchItems();
  }

  async function importDefaults() {
    setSeeding(true);
    setMessage(null);
    const res = await fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "seed" }),
    });
    setSeeding(false);
    if (res.ok) {
      setMessage("Imported testimonials from your public site defaults.");
      fetchItems();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setMessage(data.error ?? "Failed to import testimonials");
  }

  async function togglePublish(item: Testimonial) {
    await fetch("/api/admin/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    fetchItems();
  }

  return (
    <div className="admin-testimonials-page">
      <TestimonialsAdminHeader
        search={search}
        onSearchChange={setSearch}
        onAddTestimonial={openCreate}
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
          <TestimonialStatCard
            label="Total Reviews"
            value={stats.total}
            hint={monthGrowthHint(items)}
            icon={statIcons.total}
          />
          <TestimonialStatCard
            label="Published"
            value={stats.published}
            hint={`+ ${pct(stats.published, stats.total)} of total`}
            icon={statIcons.published}
          />
          <TestimonialStatCard
            label="Drafts"
            value={stats.drafts}
            hint={`+ ${pct(stats.drafts, stats.total)} of total`}
            icon={statIcons.drafts}
          />
          <TestimonialStatCard
            label="Featured"
            value={stats.featured}
            hint={`+ ${pct(stats.featured, stats.total)} of total`}
            icon={statIcons.featured}
          />
          <TestimonialStatCard
            label="Avg. Rating"
            value={stats.avgRating}
            hint="Across all reviews"
            icon={statIcons.rating}
          />
        </div>

        <div className="admin-testimonials-toolbar">
          <div className="flex flex-wrap gap-2">
            <TestimonialSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "featured", label: "Featured" },
              ]}
            />
            <TestimonialSelect
              value={ratingFilter}
              onChange={setRatingFilter}
              options={[
                { value: "all", label: "All Ratings" },
                { value: "5", label: "5 Stars" },
                { value: "4", label: "4 Stars" },
                { value: "3", label: "3 Stars" },
                { value: "2", label: "2 Stars" },
                { value: "1", label: "1 Star" },
              ]}
            />
            <TestimonialSelect
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
            <div className="admin-testimonials-view-toggle">
              <button
                type="button"
                title="Grid view"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "admin-testimonials-view-btn",
                  viewMode === "grid" && "admin-testimonials-view-btn-active",
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
                  "admin-testimonials-view-btn",
                  viewMode === "list" && "admin-testimonials-view-btn-active",
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
                const el = document.querySelector(".admin-testimonials-toolbar");
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
                {seeding ? "Importing…" : "Import site testimonials"}
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="admin-luxury-card h-64 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title="No testimonials"
            description="Import reviews from your public site or add new client feedback."
            actionLabel={items.length === 0 ? "Import site testimonials" : "Add testimonial"}
            onAction={items.length === 0 ? importDefaults : openCreate}
          />
        ) : viewMode === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((item) => (
              <TestimonialCard
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
              <div key={item.id} className="admin-testimonials-list-row">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]">
                  {item.client_image ? (
                    <Image src={item.client_image} alt={item.client_name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--admin-gold-light)]">
                      {item.client_name[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
                    {item.client_company || "Client"}
                  </p>
                  <p className="truncate font-medium text-[var(--admin-text)]">{item.client_name}</p>
                  <p className="truncate text-xs text-[var(--admin-text-muted)]">
                    &ldquo;{item.content}&rdquo;
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[var(--admin-gold-light)]">
                  {"★".repeat(item.rating ?? 5)}
                </span>
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
          <TestimonialsPagination
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
          title={editId ? "Edit testimonial" : "New testimonial"}
          size="lg"
        >
          <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-4">
            <AdminField
              label="Client name"
              value={form.client_name}
              onChange={(v) => setForm({ ...form, client_name: v })}
            />
            <AdminField
              label="Company"
              value={form.client_company}
              onChange={(v) => setForm({ ...form, client_company: v })}
            />
            <MediaPicker
              label="Client photo"
              value={form.client_image}
              onChange={(v) => setForm({ ...form, client_image: v })}
            />
            <AdminField
              label="Testimonial"
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              multiline
              rows={4}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Rating</label>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="admin-input w-full text-sm"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r} className="bg-[var(--admin-bg)]">
                    {r} stars
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published
              </label>
            </div>
            {formError && <AdminAlert tone="error">{formError}</AdminAlert>}
            <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
              <Button variant="ghost" size="sm" className="admin-btn-ghost" type="button" onClick={closeForm}>
                Cancel
              </Button>
              <Button size="sm" className="admin-btn-gold" type="submit" disabled={saving}>
                {saving ? "Saving…" : editId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </AdminModal>
      </AdminPageContent>
    </div>
  );
}
