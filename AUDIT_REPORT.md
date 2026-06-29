# DeanVerse Digital — Enterprise QA & Full Application Audit

**Date:** June 29, 2026  
**Scope:** Full codebase read-only analysis (~229 TS/TSX files, 26 API routes, 15 admin pages, portal, marketing site, Supabase schema)  
**Stack:** Next.js 16.2.9, React 19, Tailwind 4, Supabase, Resend, Vercel  
**Build status:** Production build passes  
**Lint status:** 60 problems (49 errors, 11 warnings) — CI-quality gate not met  

---

# Critical Issues

1. **No automated test suite** — Zero unit, integration, or E2E tests. CRUD flows (leads, clients, invoices, auth, payments) have no regression safety net. Any refactor risks silent breakage.

2. **ESLint fails with 49 errors** — Includes React 19 `react-hooks/set-state-in-effect` violations across admin pages and hooks (`usePortalNotifications`, `useHydratedReducedMotion`, leads/clients pages syncing state in `useEffect`). Not production-ready for strict CI.

3. **`PortalModal` has the same scroll/clipping bug AdminModal had** — `max-h-[92vh] overflow-hidden` without flex column layout; tall portal forms will clip footers off-screen (`src/components/portal/PortalModal.tsx`).

4. **In-memory rate limiting is not production-safe on Vercel** — `src/lib/rate-limit.ts` uses a module-level `Map`. Serverless instances reset/l multiply limits; contact form spam protection is unreliable at scale.

5. **Public lead insert RLS policy is wide open** — `supabase/schema.sql`: `"Anyone can submit a lead" WITH CHECK (TRUE)` allows unlimited DB inserts if API is bypassed. No CAPTCHA, no honeypot at DB layer.

6. **Schema vs app role drift** — Base `schema.sql` `is_admin()` only checks `admin` + `lead_web_designer`. App code supports `lead_developer`, `founder`, multi-role arrays (`multi-roles.sql`). If production DB never ran migration SQL, RLS will block legitimate staff or allow wrong access.

7. **Vercel env var mismatch (operational)** — App uses `ADMIN_OWNER_EMAIL`; Vercel screenshot showed `ADMIN_EMAIL`. Founder-only actions may silently fall back to `siteConfig.email` only.

8. **Leftover nested folder on disk** — `C:\MYWEBSITE\deanversedigtial\` may still exist locally (locked `node_modules`). Confusing for development; not in git but risks editing wrong copy.

---

# High Priority

1. **2,694-line monolithic `globals.css`** — All admin, portal, and marketing styles in one file. High risk of specificity wars, dead CSS, and inconsistent overrides. Hard to maintain enterprise design system.

2. **No code splitting / lazy loading** — No `next/dynamic` usage. Chart.js + react-chartjs-2 load wherever `StatsChart` is imported (dashboard, leads sidebar, analytics). Increases admin bundle weight.

3. **Duplicate modal implementations** — `AdminModal` (fixed, portaled) vs `PortalModal` (unfixed, inline). Should share one accessible modal primitive.

4. **Duplicate pagination/toolbar patterns** — Separate `LeadsPagination`, `ClientsPagination`, `PortfolioPagination`, `MediaPagination`, `TestimonialsPagination` with near-identical logic. Bug fixes must be repeated 5×.

5. **Monolithic page components** — `src/app/admin/leads/page.tsx` (~740 lines) owns fetch, filters, modals, convert flow, bulk ops, CSV import. Same pattern on clients/projects/invoices. Hard to test and reason about.

6. **Admin API routes lack rate limiting** — Public `/api/leads` has rate limit; `/api/admin/*` and `/api/portal/*` do not. Brute-force and abuse surface on authenticated endpoints.

7. **Bulk delete is sequential N+1** — Leads page deletes one-by-one in a loop (`fetch` per ID). Slow and partial-failure prone on large selections.

8. **Clients table min-width 1080px** — Forces horizontal scroll inside narrow admin content areas (sidebar + chart sidebar). Leads uses 760px; clients worse at 1024–1280px viewports.

9. **Middleware DB query on every request** — `updateSession` fetches profile roles from Supabase on every matched route. No caching; adds latency to all navigations.

10. **Blog routes redirect to home** — `proxy.ts` redirects `/blog` → `/`. Schema has `blog_posts` table; feature is half-built. Nav/marketing may reference dead feature.

11. **Stripe integration incomplete** — Webhook exists but `package.json` has no `stripe` dependency listed; payments marked "planned". Checkout route may fail if env not fully configured.

12. **No CSRF tokens on API routes** — Rely on SameSite cookies only. Acceptable for same-origin SPA but worth hardening for sensitive mutations.

13. **`DEPLOYMENT.md` outdated** — Still references Cloudflare Workers / OpenNext; hosting is Vercel.

---

# Medium

1. **Inconsistent admin page headers** — Leads/Clients/Portfolio use `*AdminHeader` pattern; Messages uses legacy `AdminHeader` + `AdminToolbar`. Visual and UX inconsistency.

2. **Calendar grouped under "Content" in nav** — `admin-nav-config.tsx` puts Calendar with CMS/Portfolio. Business users expect it under Business or System.

3. **Leads stat cards vs pipeline sidebar duplicate metrics** — Same data shown twice on leads page (top cards + sidebar doughnut).

4. **Chart empty-state overlay** — Fixed for pipeline total, but similar overlay patterns may exist elsewhere.

5. **Select elements lack consistent min-width** — Toolbar filters wrap awkwardly at 1024–1280px on several pages.

6. **Presence heartbeat runs globally in admin layout** — `PresenceHeartbeat` on every admin page; verify it doesn't stack intervals on fast navigation.

7. **Email validation inconsistent** — Client-side regex on leads page; admin POST accepts any non-empty email string without format check.

8. **CSV import is client-only parsing** — No server-side validation batch; large imports fire sequential POSTs.

9. **Messages page mobile split view** — Has `mobileDetailOpen` state; needs manual QA at 375px/390px.

10. **Framer Motion on marketing pages** — No reduced-motion guard on all animated sections (partial via `useHydratedReducedMotion`).

11. **Supabase storage policies** — Separate migration files (`storage-upgrade.sql`); must verify production buckets match app expectations.

12. **Analytics table RLS** — Present in schema; verify insert path from public site and admin dashboard.

13. **Invoice print view** — Portal print route exists; PDF/export flow not verified in audit (no runtime test without auth).

14. **Role multi-select UI** — `RoleMultiSelect.tsx` exists; users page complexity high for founder-only assignment rules.

15. **`.wrangler` folder still present** — Leftover from Cloudflare; should be gitignored/removed locally.

---

# Low

1. **Unused variable warnings in lint** — e.g. `get-portal-notifications.ts` empty variable, portal pages `setNotice` unused.

2. **Empty TypeScript interfaces** — ESLint `@typescript-eslint/no-empty-object-type` errors in type definitions.

3. **README folder structure** — Updated but `DEPLOYMENT.md` and inline comments still mention old paths.

4. **Hardcoded founder email in SQL** — `multi-roles.sql` backfill uses `adean2440@gmail.com`; should use env-driven seed in app layer only.

5. **Emoji in admin headings** — Leads page title includes ✨; may not match premium/enterprise tone everywhere.

6. **`build-output.log` committed** — Artifact noise in repo root.

7. **Chart.js legend hidden per-chart** — Custom legends duplicated in LeadsSidebar manually.

8. **Portal notice query param** — `?notice=admin-required` redirect; verify user-facing copy exists.

9. **Search page** — Public search exists; index coverage unknown.

10. **Multiple Supabase migration files** — No single ordered migration runner documented beyond `MIGRATIONS.md`.

---

# UI Improvements

- Unify all admin list pages on one header + toolbar + table + sidebar grid system (match Clients/Leads post-fix pattern).
- Standardize stat card grid to `sm:2 / xl:5` across dashboard, leads, clients, analytics.
- Align modal footer padding and safe-area insets across Admin + Portal modals.
- Consolidate button tokens: `admin-btn-gold`, `admin-btn-ghost` used consistently; portal uses raw Tailwind in places.
- Reduce table min-widths or switch to responsive card fallback below 1024px.
- Single icon size standard (`h-[18px]` in nav vs `h-4 w-4` in toolbars).
- Unify pagination button classes (`admin-leads-page-btn` vs ad-hoc styles).
- Dashboard hero vs inner page headers — align typography scale (serif titles, muted subtitles).
- Media manager grid — verify equal card heights and thumbnail aspect ratios.
- Settings subpages — match my-account layout spacing with main settings hub.

---

# UX Improvements

- **Add Lead / Add Client** — Consider stepped wizard (Contact → Project → Notes) instead of 9-field single form.
- **Bulk actions** — Add progress indicator for multi-delete/import; confirm destructive actions with typed confirm.
- **Convert lead flow** — Two-step modal is good; add success link to new client/project.
- **Messages** — Add compose-to-client from client record; reduce context switching.
- **Invoices** — Stripe checkout status feedback in portal after payment.
- **Global search in admin** — Only per-page search today; no cross-entity search.
- **Keyboard shortcuts** — Leads has ⌘K for search; extend pattern or remove misleading kbd hint on pages without it.
- **Empty states** — `AdminEmptyState` exists but not used uniformly (messages yes, others vary).
- **Toast notifications** — Success/error uses inline `AdminAlert`; no ephemeral toasts for CRUD success (easy to miss).
- **Filter persistence** — Filters reset on navigation; consider URL query sync for shareable views.
- **Mobile admin** — Sidebar collapses to mobile nav; complex pages (calendar, messages split) need dedicated mobile UX pass.

---

# Performance Improvements

- Lazy-load Chart.js via `next/dynamic` on dashboard, analytics, leads sidebar.
- Split `globals.css` into admin/portal/marketing modules (CSS `@import` or Tailwind layers).
- Add `loading.tsx` / Suspense boundaries per admin route (many use client-only full-page spinners).
- Batch API endpoints for bulk delete/update instead of N sequential fetches.
- Cache middleware profile role lookup in session cookie/JWT custom claim (reduce Supabase round-trip).
- Image audit: verify all `<img>` use `next/image` with sizes; check portfolio/media uploads.
- Review `force-dynamic` on admin layout — necessary for auth but prevents static optimization (expected).
- Dedupe `fetchLeads`/`fetchClients` calls after mutations — some pages refetch entire lists when PATCH returns updated row.
- Consider React Query or SWR for stale-while-revalidate and deduplication.
- Remove dead Cloudflare/OpenNext artifacts from repo to shrink clone size.

---

# Security Improvements

- Move rate limiting to Redis/Upstash or Vercel KV for serverless consistency.
- Add honeypot + CAPTCHA (Turnstile) on public contact/lead forms.
- Tighten RLS lead INSERT to validate required fields server-side via Edge Function or restrict columns.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` only used server-side (confirmed in `service.ts`; audit CMS paths).
- Add rate limits to auth routes (login/register/forgot-password).
- Validate webhook secrets required in production (Stripe returns 200 skip if missing — log/alert instead).
- Audit all admin PATCH handlers for mass-assignment (leads `pickLeadUpdates` is good pattern — replicate).
- Ensure portal file upload validates MIME type and size server-side in `/api/portal/files`.
- Review message INSERT policy — users can only send as self; verify recipient_id cannot be spoofed to read others' mail.
- Add security headers in `next.config.ts` (CSP, X-Frame-Options, Referrer-Policy).
- Confirm `getSafeRedirectPath` blocks open redirects on login.
- Run dependency audit (`npm audit` reported 2 moderate vulnerabilities).

---

# Accessibility Improvements

- Portal modal missing `aria-labelledby` (AdminModal has it).
- Focus trap not implemented in modals — tab can escape to background.
- Focus return to trigger button on modal close not implemented.
- Many icon-only buttons have `aria-label` (good on leads table); audit messages/calendar actions for gaps.
- Table headers — verify scope attributes on complex tables.
- Color contrast on gold-on-black muted text — spot-check WCAG AA on `--admin-text-muted`.
- Skip link to main content in admin layout — not present.
- Live regions for async success/error — alerts not announced to screen readers (`role="alert"` on AdminAlert — verify).
- Form fields — ensure all `AdminField` components wire `htmlFor` / `id` pairs.

---

# Code Cleanup

- Fix all 49 ESLint errors (priority: react-hooks/set-state-in-effect).
- Remove unused imports/vars (11 warnings).
- Delete or gitignore: `build-output.log`, `.wrangler`, local `deanversedigtial/` copy.
- Extract shared `AdminPagination`, `AdminDataTable`, `AdminFilterBar` components.
- Extract shared modal hook (`useModal`, focus trap, body scroll lock).
- Move leads/clients page business logic to `src/lib/*/actions.ts` or hooks.
- Align `schema.sql` with latest migration state (single source of truth).
- Remove deprecated `normalizeRole` callers over time.
- Consolidate date range formatters duplicated across leads/clients pages.

---

# Suggested Enhancements

- **Command palette** (⌘K global) — Linear-style navigation across admin entities.
- **Activity log** — Admin audit trail for lead/client/invoice changes.
- **Notification center** — Unified inbox for leads, messages, invoice events.
- **Real-time messages** — Supabase realtime subscriptions vs polling.
- **Blog CMS** — Complete UI for existing schema or remove schema/nav dead ends.
- **Stripe billing portal** — Customer self-service payment methods.
- **Onboarding checklist** — Admin dashboard widget for setup (env, DNS, first lead).
- **Dark/light mode toggle** — Admin is dark-only; portal/marketing differ.
- **Export all data** — GDPR-style client data export from admin.
- **Versioned CMS content** — Preview/publish workflow for site content sections.

---

## Page-by-Page Coverage Matrix

| Area | Route | Code reviewed | Runtime tested | Notes |
|------|-------|---------------|----------------|-------|
| Dashboard | `/admin` | ✅ | ❌ (auth) | Charts, activity feed, mini calendar |
| Site Content | `/admin/content` | ✅ | ❌ | CMS sections, reorder |
| Portfolio | `/admin/portfolio` | ✅ | ❌ | CRUD + publish flag |
| Testimonials | `/admin/testimonials` | ✅ | ❌ | Matches portfolio pattern |
| Media | `/admin/media` | ✅ | ❌ | Storage integration |
| Calendar | `/admin/calendar` | ✅ | ❌ | Month/week/day/agenda views |
| Leads | `/admin/leads` | ✅ | ❌ | Recently fixed toolbar/modal |
| Clients | `/admin/clients` | ✅ | ❌ | Reference layout pattern |
| Projects | `/admin/projects` | ✅ | ❌ | Client linkage |
| Messages | `/admin/messages` | ✅ | ❌ | Split pane, legacy header |
| Invoices | `/admin/invoices` | ✅ | ❌ | Stripe checkout partial |
| Analytics | `/admin/analytics` | ✅ | ❌ | Chart heavy |
| Users | `/admin/users` | ✅ | ❌ | Founder guards |
| Settings | `/admin/settings` | ✅ | ❌ | Subpages |
| Portal | `/portal/*` | ✅ | ❌ | Modal scroll risk |
| Auth | `/login` etc. | ✅ | ❌ | Proxy redirects |
| Marketing | `/`, `/contact`… | ✅ | ❌ | Public lead API rate limited |

---

## Recommended Fix Order (Post-Report)

1. Fix `PortalModal` scroll/layout (mirror AdminModal) — **quick win, same user-reported class of bug**
2. Resolve ESLint errors blocking CI quality
3. Add Upstash/Vercel KV rate limiting
4. Extract shared pagination + modal primitives
5. Lazy-load Chart.js
6. Split globals.css
7. Add E2E smoke tests for auth + leads CRUD
8. Verify Supabase migrations applied in production
9. Mobile responsive pass on clients/messages/calendar
10. Security headers + CAPTCHA on contact form

---

*End of audit. No application source files were modified during this analysis.*
