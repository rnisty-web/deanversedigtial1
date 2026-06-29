# DeanVerse Digital

Freelance web design and development portfolio site with a client portal and admin dashboard. Built for [DeanVerse Digital](https://deanversedigital.com) — custom websites and web applications for small businesses and startups.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Backend / DB | [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage) |
| Email | [Resend](https://resend.com/) |
| Payments | Stripe *(planned — not yet integrated)* |
| Hosting | [Vercel](https://vercel.com/) + [GitHub](https://github.com/rnisty-web/deanversedigtial1) |
| Language | TypeScript |

---

## Features

- **Marketing site** — Home, services, portfolio, about, testimonials, pricing, contact
- **Client portal** — Projects, files, messages, invoices (`/portal`)
- **Admin dashboard** — Leads, clients, projects, portfolio, testimonials, analytics, settings (`/admin`)
- **Blog** — *(planned — schema exists, UI not yet built)*
- **SEO** — Dynamic sitemap, robots.txt, JSON-LD structured data
- **Auth** — Supabase email/password with protected routes via middleware

---

## Folder structure

```
C:\MYWEBSITE\                 # Project root (this repo)
├── public/                   # Static assets
├── src/                      # Next.js App Router app
├── supabase/                 # Database schema
├── archive/static-html-site/ # Old static HTML site (local backup, not deployed)
├── package.json
└── README.md
```

---

## Database tables

All tables live in the `public` schema with Row Level Security enabled.

### `profiles`

User accounts linked to Supabase Auth. Auto-created on signup via trigger.

| Column | Description |
|--------|-------------|
| `id` | UUID, FK to `auth.users` |
| `email` | User email |
| `full_name` | Display name |
| `avatar_url` | Profile image URL |
| `role` | `admin` or `client` |
| `company`, `phone` | Optional contact info |
| `created_at`, `updated_at` | Timestamps |

### `clients`

Business clients managed by admin; may link to a portal user via `profile_id`.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `profile_id` | Optional FK to `profiles` for portal login |
| `name`, `email`, `phone`, `company` | Client contact details |
| `notes` | Internal notes |
| `status` | `active`, `inactive`, or `archived` |
| `created_at`, `updated_at` | Timestamps |

### `projects`

Client projects tracked through the pipeline.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `client_id` | FK to `clients` |
| `title`, `description` | Project info |
| `status` | `draft`, `planning`, `in_progress`, `review`, `completed`, `on_hold`, `cancelled` |
| `budget` | Numeric budget |
| `deadline` | Target completion date |
| `tech_stack` | JSON array of technologies |
| `created_at`, `updated_at` | Timestamps |

### `portfolio`

Public portfolio case studies (marketing site).

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `title`, `slug` | Display title and URL slug |
| `description` | Project summary |
| `image_url`, `live_url`, `github_url` | Media and links |
| `tags` | Text array of tags |
| `featured` | Show on homepage |
| `sort_order` | Display order |
| `published` | Visible on public site when true |
| `created_at`, `updated_at` | Timestamps |

### `testimonials`

Client testimonials for the marketing site.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `client_name`, `client_company`, `client_image` | Author info |
| `content` | Testimonial text |
| `rating` | 1–5 stars |
| `project_id` | Optional FK to `projects` |
| `featured`, `published` | Visibility flags |
| `created_at`, `updated_at` | Timestamps |

### `blog_posts`

Blog articles for the marketing site.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `title`, `slug` | Post title and URL slug |
| `excerpt`, `content` | Summary and body |
| `cover_image` | Hero image URL |
| `author_id` | FK to `profiles` |
| `published`, `published_at` | Visibility and publish date |
| `tags` | Text array of tags |
| `created_at`, `updated_at` | Timestamps |

### `leads`

Contact form submissions and inbound inquiries.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `name`, `email`, `phone`, `company` | Submitter info |
| `message` | Inquiry message |
| `service_interest` | Service they asked about |
| `status` | `new`, `contacted`, `qualified`, `converted`, `lost` |
| `source` | Lead source (website, referral, etc.) |
| `notes` | Admin notes |
| `created_at`, `updated_at` | Timestamps |

### `messages`

Direct messages between users on a project.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `project_id` | Optional FK to `projects` |
| `sender_id`, `recipient_id` | FK to `profiles` |
| `subject`, `content` | Message content |
| `read` | Read status |
| `created_at`, `updated_at` | Timestamps |

### `files`

Project file uploads (metadata; binary stored in Supabase Storage).

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `project_id` | FK to `projects` |
| `uploaded_by` | FK to `profiles` |
| `name`, `file_path` | Display name and storage path |
| `file_size`, `mime_type` | File metadata |
| `created_at`, `updated_at` | Timestamps |

### `invoices`

Client invoices with line items.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `client_id` | FK to `clients` |
| `project_id` | Optional FK to `projects` |
| `invoice_number` | Unique invoice ID |
| `amount` | Total amount |
| `status` | `draft`, `sent`, `paid`, `overdue`, `cancelled` |
| `due_date`, `paid_at` | Payment dates |
| `line_items` | JSON array of line items |
| `notes` | Invoice notes |
| `created_at`, `updated_at` | Timestamps |

### `analytics`

Page views and custom events.

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `event_type` | Event name (e.g. `page_view`) |
| `page_path` | URL path |
| `metadata` | JSON event payload |
| `user_id` | Optional FK to `profiles` |
| `session_id` | Anonymous session identifier |
| `created_at` | Timestamp |

### `settings`

Key-value site configuration (admin-managed).

| Column | Description |
|--------|-------------|
| `id` | UUID primary key |
| `key` | Setting key (e.g. `site`) |
| `value` | JSON configuration object |
| `updated_at` | Last modified |

---

## Installation

### 1. Clone and install

```bash
git clone <your-repo-url> deanversedigital
cd deanversedigital
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase and Resend credentials. See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details.

### 3. Database

Run migrations in order — see **[supabase/MIGRATIONS.md](./supabase/MIGRATIONS.md)**:

1. `schema.sql`
2. `cms-upgrade.sql`
3. `storage-upgrade.sql`
4. `portal-client-projects.sql`
5. `roles-and-presence-step1-enums.sql`
6. `roles-and-presence-step2.sql`
7. `roles-expand.sql`
8. `multi-roles.sql`

### 4. Brand assets

Copy your images into `public/images/`:

- `deanverse-digital-logo.svg` — primary logo
- `deanverse-digital-logo.png` — PNG fallback / social previews
- `image0.png`
- `background.png`

See `public/images/README.md` for specs.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Build for production

```bash
npm run build
npm start
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | ESLint |

---

## SEO components

| File | Purpose |
|------|---------|
| `src/app/sitemap.ts` | Generates `/sitemap.xml` with static pages + published portfolio slugs |
| `src/app/robots.ts` | Generates `/robots.txt`; blocks admin, portal, and auth routes |
| `src/components/seo/StructuredData.tsx` | JSON-LD for Organization and LocalBusiness |

Add `<StructuredData />` to your root layout when wiring up the marketing site.

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:

- Cloudflare Workers + GitHub Actions setup
- Supabase configuration
- Environment variables
- Schema migration
- Admin user promotion
- Resend email setup

---

## License

Private — © DeanVerse Digital
