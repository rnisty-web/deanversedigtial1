# Deployment Guide — DeanVerse Digital

Complete instructions for deploying the DeanVerse Digital site to **Cloudflare Workers** (via GitHub) with **Supabase**, Resend email, and admin setup.

---

## Complete walkthrough (start to finish)

You already have **GitHub**, **Cloudflare**, and **Supabase** accounts. This section is the full path in order — do each part once, top to bottom.

**What you are building:**

| Service | Role |
|---------|------|
| **GitHub** | Stores your code; auto-deploys when you push to `main` |
| **Cloudflare Workers** | Hosts the Next.js website (replaces Vercel) |
| **Supabase** | Database, login/signup, file storage |
| **Namecheap** | You keep owning the domain; only nameservers point to Cloudflare |

Replace `deanversedigital.com` below with your real domain if different.

---

### Part A — Supabase (database + login)

**A1. Open or create your project**

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard).
2. Use an existing project or click **New project** (pick a region close to you, save the database password somewhere safe).
3. Wait until status is **Active** (not paused — a paused project causes “Failed to fetch” on login).

**A2. Run the database schema**

1. In Supabase, open **SQL Editor** → **New query**.
2. On your computer, open the file `supabase/schema.sql` from this project.
3. Copy **everything** in that file, paste into the SQL Editor, click **Run**.
4. Go to **Table Editor** — you should see tables like `profiles`, `clients`, `projects`, `leads`, etc.

**A3. Create the storage bucket (for client file uploads)**

1. **Storage** → **New bucket**.
2. Name: `project-files`
3. **Public bucket**: OFF (private).
4. If uploads fail later, run the storage policy block at the bottom of `supabase/schema.sql` in the SQL Editor.

**A4. Copy your API keys**

1. **Project Settings** (gear icon) → **API**.
2. Copy and save these three values (you will use them several times):

| What Supabase shows | Save as |
|---------------------|---------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon / publishable `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role key (secret — never put in client code) | `SUPABASE_SERVICE_ROLE_KEY` |

**A5. Auth settings (local for now)**

1. **Authentication** → **URL Configuration**.
2. Set **Site URL** to: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000/auth/callback`
4. **Authentication** → **Providers** → ensure **Email** is enabled.

You will add production URLs (`https://deanversedigital.com/...`) in Part F after the site is live.

---

### Part B — Run the site on your computer

**B1. Create `.env.local`**

In the project folder:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in at minimum:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
ADMIN_OWNER_EMAIL=your-email@gmail.com
CONTACT_FORM_TO=your-email@gmail.com
```

Use the values from Part A4. `.env.local` stays on your machine — never commit it to GitHub.

`ADMIN_EMAIL` is also accepted as a fallback if `ADMIN_OWNER_EMAIL` is not set.

**B2. Install and test**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Try **Sign up** with the email you put in `ADMIN_EMAIL`. If login fails with “Failed to fetch”, check that the Supabase project is **not paused** and the URL/keys in `.env.local` are correct.

---

### Part C — Put the code on GitHub

**C1. Create a repository**

1. GitHub → **New repository** (e.g. `deanversedigital`).
2. Keep it **Private** if you prefer.
3. Do **not** initialize with a README if you already have local code.

**C2. Push your project**

In your project folder (replace `YOUR_USERNAME` with your GitHub username):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/deanversedigital.git
git push -u origin main
```

The branch **must** be named `main` — the deploy workflow only runs on `main`.

---

### Part D — Cloudflare (hosting)

**D1. Get your Account ID**

1. [dash.cloudflare.com](https://dash.cloudflare.com/) → **Workers & Pages**.
2. On the right, copy **Account ID** — save it for Part E.

**D2. Create an API token (for GitHub to deploy)**

1. Click your profile (top right) → **My Profile** → **API Tokens**.
2. **Create Token** → use template **Edit Cloudflare Workers**.
3. **Continue to summary** → **Create Token**.
4. Copy the token immediately — you only see it once. Save as `CLOUDFLARE_API_TOKEN`.

**D3. Create R2 cache bucket**

On your computer, in the project folder:

```bash
npx wrangler login
npx wrangler r2 bucket create deanversedigital-opennext-cache
```

Or in Cloudflare: **R2** → **Create bucket** → name exactly `deanversedigital-opennext-cache`.

**D4. (Optional) Connect domain to Cloudflare now**

If your domain is on Namecheap, you can do this now or after the first deploy — see **Part F** below. Cloudflare needs to manage DNS for the custom domain to work smoothly.

---

### Part E — GitHub secrets (so deploy can build the app)

GitHub needs secrets because the build embeds `NEXT_PUBLIC_*` values and uses Cloudflare credentials to upload.

1. Open your repo on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** for each row:

| Secret name | What to paste |
|-------------|---------------|
| `CLOUDFLARE_API_TOKEN` | Token from Part D2 |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID from Part D1 |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase (Part A4) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase (Part A4) |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase (Part A4) |
| `NEXT_PUBLIC_SITE_URL` | For first deploy use `https://deanversedigital.com` **or** a temporary workers.dev URL after first deploy |
| `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` | Same domain as above + `/auth/callback` (e.g. `https://deanversedigital.com/auth/callback`) |
| `ADMIN_EMAIL` | Your admin email |
| `CONTACT_FORM_TO` | Email that receives contact form messages |
| `RESEND_API_KEY` | From Resend (optional until contact form email is needed) |

**Tip for first deploy:** If the custom domain is not ready yet, deploy once without it, open **Workers & Pages → deanversedigital** and note the `*.workers.dev` URL. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` to that URL temporarily, then update to your real domain in Part F.

---

### Part F — First deploy + Namecheap domain

**F1. Trigger deploy**

1. GitHub repo → **Actions** → **Deploy to Cloudflare** → **Run workflow**  
   **or** push any commit to `main`.
2. Wait for the green checkmark. If it fails, open the failed job and read the log (usually a missing secret or wrong Cloudflare token).

**F2. Confirm the Worker exists**

Cloudflare → **Workers & Pages** → you should see **deanversedigital**. Open it and visit the `*.workers.dev` link to confirm the site loads.

**F3. Point Namecheap to Cloudflare**

1. **Cloudflare** → **Add a site** → enter `deanversedigital.com` → **Free** plan.
2. Cloudflare shows two nameservers (e.g. `xxx.ns.cloudflare.com` and `yyy.ns.cloudflare.com`).
3. **Namecheap** → **Domain List** → **Manage** → **Nameservers** → **Custom DNS**.
4. Paste both Cloudflare nameservers → **Save**.
5. Wait until Cloudflare shows the domain as **Active** (minutes to a few hours).

**Before changing nameservers:** If you use email on this domain, screenshot any **MX** records in Namecheap and re-add them later in **Cloudflare → DNS**.

**F4. Attach domain to the Worker**

1. **Workers & Pages** → **deanversedigital** → **Settings** → **Domains & Routes**.
2. **Add** → **Custom domain** → add `deanversedigital.com` and `www.deanversedigital.com`.
3. Cloudflare adds DNS records automatically. HTTPS turns on once DNS is active.

Optional: **Rules** → **Redirect Rules** → redirect `www.deanversedigital.com/*` → `https://deanversedigital.com/$1`.

**F5. Update Supabase + GitHub for production**

1. **Supabase** → **Authentication** → **URL Configuration**:
   - **Site URL:** `https://deanversedigital.com`
   - **Redirect URLs:** add `https://deanversedigital.com/auth/callback` (keep localhost URLs too for local dev)
2. **GitHub secrets** — update and redeploy:
   - `NEXT_PUBLIC_SITE_URL` = `https://deanversedigital.com`
   - `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` = `https://deanversedigital.com/auth/callback`
3. Re-run **Deploy to Cloudflare** workflow or push to `main`.

---

### Part G — Make yourself admin

1. Visit `https://deanversedigital.com/register` (or `/signup`) and sign up with the email in `ADMIN_EMAIL`.
2. Supabase → **SQL Editor** → run (replace the email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@gmail.com';
```

3. Sign out and sign back in → open `/admin`.

---

### Part H — Quick verification

- [ ] Site loads at `https://deanversedigital.com`
- [ ] Login and signup work
- [ ] `/admin` loads after admin promotion
- [ ] `/sitemap.xml` and `/robots.txt` load

---

### What happens on every future update

1. Edit code locally → test with `npm run dev`.
2. `git add .` → `git commit` → `git push` to `main`.
3. GitHub Actions builds and deploys to Cloudflare automatically (~5–10 minutes).

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- [GitHub](https://github.com/) account (source control + CI/CD)
- [Cloudflare](https://cloudflare.com/) account
- [Supabase](https://supabase.com/) account
- [Resend](https://resend.com/) account (for contact form emails)
- Custom domain on Namecheap (point nameservers to Cloudflare — see DEPLOYMENT.md)

---

## 1. Supabase project setup

### Create a project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choose a name (e.g. `deanversedigital`), region, and database password.
3. Wait for the project to finish provisioning.

### Run the database schema

1. Open **SQL Editor** in the Supabase dashboard.
2. Copy the full contents of `supabase/schema.sql` from this repo.
3. Paste and click **Run**.
4. Confirm tables appear under **Table Editor**: `profiles`, `clients`, `projects`, `portfolio`, `blog_posts`, `leads`, etc.

The schema includes:

- Row Level Security (RLS) policies
- Auth trigger to auto-create `profiles` on signup
- Default `settings` row for site metadata

### Create storage bucket (project files)

1. Go to **Storage** → **New bucket**.
2. Name: `project-files`
3. Set **Public bucket** to off (private).
4. After creation, add storage policies (uncomment and run the policy block at the bottom of `supabase/schema.sql`, or configure via the Storage UI).

### Get API keys

From **Project Settings → API**:

| Key | Env variable |
|-----|--------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or public repos.

### Configure Auth redirect URLs

Under **Authentication → URL Configuration**:

| Environment | Site URL | Redirect URLs |
|-------------|----------|---------------|
| Local | `http://localhost:3000` | `http://localhost:3000/auth/callback` |
| Production | `https://deanversedigital.com` | `https://deanversedigital.com/auth/callback` |

Enable **Email** provider under **Authentication → Providers** if using email/password or magic links.

---

## 2. Environment variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Fill in every value:

```env
# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Auth
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback

# Email
RESEND_API_KEY=re_xxxxxxxxxxxx
CONTACT_FORM_TO=adean2440@gmail.com

# Stripe (optional)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Admin bootstrap (founder-only actions — either name works; ADMIN_OWNER_EMAIL preferred)
ADMIN_OWNER_EMAIL=adean2440@gmail.com
ADMIN_EMAIL=adean2440@gmail.com

# Rate limiting (recommended for production — Upstash Redis free tier)
UPSTASH_REDIS_REST_URL=https://YOUR_UPSTASH_URL.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Contact form CAPTCHA (optional — Cloudflare Turnstile, free)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

**Rate limiting:** Without Upstash vars, `/api/leads` and `/api/analytics` use an in-memory limiter (fine locally, not reliable on serverless). Create a free database at [upstash.com](https://upstash.com/), copy the REST URL and token into Vercel/Cloudflare env, and redeploy.

**Turnstile:** Create a widget at [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/). Add your site domain. When both keys are set, the contact form shows a CAPTCHA and `/api/leads` verifies the token. Without keys, a honeypot field still blocks basic bots.

For production on Cloudflare, set the same keys with production values (`NEXT_PUBLIC_SITE_URL=https://deanversedigital.com`, etc.) in **GitHub Actions secrets** and/or the **Cloudflare Workers dashboard** (Settings → Variables and Secrets).

---

## 3. Brand assets (before deploy)

Place your image files in `public/images/` (see `public/images/README.md`):

- `deanverse-digital-logo.svg` — logo (primary)
- `deanverse-digital-logo.png` — logo raster fallback
- `image0.png` — profile photo
- `background.png` — site background

These are referenced by `src/lib/constants.ts` and used across the marketing site.

---

## 4. Local verification

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Verify build succeeds:

```bash
npm run build
npm start
```

Check SEO routes:

- [http://localhost:3000/sitemap.xml](http://localhost:3000/sitemap.xml)
- [http://localhost:3000/robots.txt](http://localhost:3000/robots.txt)

---

## 5. Deploy to Cloudflare Workers (GitHub + Supabase)

This project uses [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) to run Next.js on Cloudflare Workers. Supabase remains your database, auth, and storage backend.

### One-time Cloudflare setup

1. Sign in at [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Note your **Account ID** (Workers & Pages → Overview → right sidebar).
3. Create an **API token** with **Edit Cloudflare Workers** permission:
   - My Profile → API Tokens → Create Token → Edit Cloudflare Workers template.
4. Create an **R2 bucket** for Next.js incremental cache:
   ```bash
   npx wrangler r2 bucket create deanversedigital-opennext-cache
   ```
   (Or create `deanversedigital-opennext-cache` in the R2 dashboard — name must match `wrangler.jsonc`.)

### Push to GitHub

1. Create a GitHub repository and push this project.
2. Default branch should be `main` (matches the deploy workflow).

### GitHub Actions secrets

In your repo: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token from above |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `NEXT_PUBLIC_SITE_URL` | `https://deanversedigital.com` (or your `*.workers.dev` URL for first deploy) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` | `https://deanversedigital.com/auth/callback` |
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_FORM_TO` | Inbox for contact form |
| `ADMIN_EMAIL` | First admin email |

Add optional secrets (`STRIPE_*`, `NEXT_PUBLIC_GA_MEASUREMENT_ID`, etc.) if you use those features.

### Deploy

Every push to `main` runs `.github/workflows/deploy-cloudflare.yml` and deploys via:

```bash
npm run deploy
```

You can also deploy manually from your machine (after `wrangler login`):

```bash
npm run deploy
```

Or trigger the workflow from GitHub: **Actions → Deploy to Cloudflare → Run workflow**.

### Alternative: Cloudflare Workers Builds (no GitHub Actions)

Instead of the workflow, connect the repo in the Cloudflare dashboard:

1. **Workers & Pages → Create → Connect to Git**.
2. Select your GitHub repo and `main` branch.
3. Build command: `npm run deploy` (or `opennextjs-cloudflare build && opennextjs-cloudflare deploy`).
4. Add the same environment variables under **Settings → Variables and Secrets**.

### Custom domain (Namecheap → Cloudflare)

If your domain is registered at **Namecheap** (e.g. `deanversedigital.com`), the recommended setup is to use **Cloudflare as your DNS provider**. Cloudflare Workers custom domains work best when DNS is managed in Cloudflare — you do not need to transfer the domain, only point Namecheap’s nameservers to Cloudflare.

#### Step 1 — Add the domain to Cloudflare

1. In [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Add a site**.
2. Enter your domain (e.g. `deanversedigital.com`) → choose the **Free** plan.
3. Cloudflare scans existing DNS records. Review and import any you need (email records, etc.).
4. Cloudflare shows two **nameservers**, for example:
   - `ada.ns.cloudflare.com`
   - `bob.ns.cloudflare.com`

#### Step 2 — Point Namecheap to Cloudflare

1. Log in to [Namecheap](https://www.namecheap.com/) → **Domain List** → **Manage** next to your domain.
2. Open **Domain** → **Nameservers**.
3. Select **Custom DNS** (not “Namecheap BasicDNS”).
4. Enter the two Cloudflare nameservers from Step 1 → **Save**.
5. Propagation can take a few minutes up to 24 hours. Cloudflare will email you when the domain is **Active**.

While waiting, leave any old A/CNAME records in Namecheap — once nameservers switch, Cloudflare controls DNS instead.

#### Step 3 — Attach the domain to your Worker

After the Worker is deployed at least once:

1. **Workers & Pages** → select **deanversedigital** → **Settings** → **Domains & Routes**.
2. Click **Add** → **Custom domain**.
3. Add:
   - `deanversedigital.com` (apex / root)
   - `www.deanversedigital.com` (recommended)
4. Cloudflare creates the required DNS records automatically when DNS is on Cloudflare.

For `www`, add a **Redirect Rule** (optional but recommended):

- **Rules** → **Redirect Rules** → redirect `www.deanversedigital.com/*` → `https://deanversedigital.com/$1` (301).

HTTPS is issued automatically once DNS is active.

#### Step 4 — Update app + Supabase for production

Set these to your live domain (replace with your actual domain if different):

| Where | Variable / setting | Value |
|-------|-------------------|-------|
| GitHub Actions secrets | `NEXT_PUBLIC_SITE_URL` | `https://deanversedigital.com` |
| GitHub Actions secrets | `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` | `https://deanversedigital.com/auth/callback` |
| Supabase → Auth → URL Configuration | Site URL | `https://deanversedigital.com` |
| Supabase → Auth → URL Configuration | Redirect URLs | `https://deanversedigital.com/auth/callback` |

Redeploy after updating GitHub secrets (push to `main` or re-run the deploy workflow).

#### Step 5 — Resend email (optional)

If you send mail from `@deanversedigital.com`, add DNS records in **Cloudflare → DNS** (not Namecheap) after Resend verifies the domain — SPF, DKIM, etc. from the Resend dashboard.

#### Troubleshooting Namecheap + Cloudflare

| Issue | Fix |
|-------|-----|
| Domain stuck on “Pending” in Cloudflare | Confirm Namecheap nameservers match Cloudflare exactly; disable any “URL Redirect” or parking at Namecheap. |
| Site loads on `*.workers.dev` but not custom domain | Wait for DNS propagation; confirm custom domain is added under the Worker’s **Domains & Routes**. |
| Auth redirect errors after going live | Supabase redirect URL must match **exactly** (https, no trailing slash on callback path). |
| Email stops working after nameserver change | Re-add MX/SPF/DKIM records in Cloudflare DNS (export from Namecheap before switching if needed). |

---

## 6. Promote first admin user

New signups default to the `client` role. Promote your account to `admin` after first login/signup.

### Option A — SQL (recommended)

1. Sign up once via `/signup` using the email in `ADMIN_EMAIL`.
2. In Supabase **SQL Editor**, run:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'adean2440@gmail.com';
```

Replace the email with your actual admin email.

3. Sign out and sign back in. You should have access to `/admin`.

### Option B — Supabase Table Editor

1. Go to **Table Editor → profiles**.
2. Find your user row.
3. Change `role` from `client` to `admin`.
4. Save.

### Verify admin access

- Visit `/admin` — should load the admin dashboard.
- Confirm you can create portfolio items, blog posts, and view leads.

---

## 7. Resend email setup

Used for contact form notifications and optional transactional email.

### Create API key

1. Sign up at [resend.com](https://resend.com).
2. **API Keys → Create API Key** with **Sending access**.
3. Copy the key into `RESEND_API_KEY` (local, GitHub secrets, and Cloudflare).

### Verify sending domain (production)

For production emails from `@deanversedigital.com`:

1. **Domains → Add Domain** → enter `deanversedigital.com`.
2. Add the DNS records Resend provides (SPF, DKIM, etc.) at your registrar.
3. Wait for verification.
4. Update your contact form sender address in code (when implemented) to use `noreply@deanversedigital.com` or similar.

For development, Resend allows sending to your own verified email without a custom domain.

### Contact form recipient

Set `CONTACT_FORM_TO` to the inbox that should receive lead/contact submissions (e.g. `adean2440@gmail.com`).

---

## 8. Post-deploy checklist

- [ ] Site loads at production URL
- [ ] `/sitemap.xml` lists static pages and published blog/portfolio slugs
- [ ] `/robots.txt` disallows `/admin`, `/portal`, and auth routes
- [ ] Supabase Auth sign-up and login work
- [ ] Admin user can access `/admin`
- [ ] Contact form sends email via Resend
- [ ] Images from Supabase Storage load (if using uploaded portfolio/blog images)
- [ ] Google Search Console: submit sitemap URL
- [ ] Optional: configure `NEXT_PUBLIC_GA_MEASUREMENT_ID` for analytics

---

## 9. Troubleshooting

### Build fails on Cloudflare / GitHub Actions

- Ensure all required secrets are set in GitHub (and Cloudflare if using Workers Builds).
- Run `npm run build` locally to reproduce Next.js errors.
- Run `npm run preview` locally to test the Cloudflare Worker bundle (requires `.dev.vars` copied from `.dev.vars.example` plus your Supabase keys).

### Auth redirect loop

- Confirm `NEXT_PUBLIC_SUPABASE_REDIRECT_URL` matches Supabase **Redirect URLs** exactly.
- Check middleware is not blocking `/auth/callback`.

### Sitemap missing blog/portfolio URLs

- Confirm items have `published = true` in Supabase.
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in GitHub secrets / Cloudflare.

### Images from Supabase not loading

- Confirm `next.config.ts` includes Supabase storage in `images.remotePatterns`.
- Use public bucket URLs or signed URLs as appropriate.

### Cannot access admin

- Confirm `profiles.role = 'admin'` for your user.
- Sign out and back in to refresh the session.

---

## 10. Ongoing maintenance

- **Schema changes**: edit `supabase/schema.sql`, run migrations in SQL Editor or adopt Supabase CLI migrations.
- **Env updates**: change GitHub secrets and/or Cloudflare Workers variables → redeploy.
- **Content**: manage portfolio, blog, and leads via `/admin` after promotion.

For project structure and table reference, see [README.md](./README.md).
