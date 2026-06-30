# Supabase SQL migrations

Run these scripts **in order** in the Supabase SQL Editor (or via CLI). Each file builds on the previous one.

## Run order

| # | File | Purpose |
|---|------|---------|
| 1 | `schema.sql` | Base tables, RLS policies, triggers, seed data |
| 2 | `cms-upgrade.sql` | CMS content tables and settings |
| 3 | `storage-upgrade.sql` | Storage buckets and file policies |
| 4 | `portal-client-projects.sql` | Client portal project access |
| 5 | `roles-and-presence-step1-enums.sql` | Role enum types (step 1) |
| 6 | `roles-and-presence-step2.sql` | Profiles roles, presence columns |
| 7 | `roles-expand.sql` | Extended role values |
| 8 | `multi-roles.sql` | Multi-role support via junction table |
| 9 | `role-catalog.sql` | Custom roles, enum extension, catalog settings |
| 10 | `dashboard-theme.sql` | Dashboard color theme setting seed |
| 9 | `storage-email-clients.sql` | Storage read access for email-matched clients (optional) |

## Notes

- **Fresh install:** Run all nine files in sequence on a new Supabase project.
- **`reset.sql`:** Destructive — drops and recreates the database. Use only in development.
- **`roles-and-presence.sql`:** Legacy combined script; prefer the step1 + step2 files above.
- Re-run individual files only if you know what changed — most scripts are not idempotent.

## Storage and email-matched clients

`storage-upgrade.sql` grants file read access only when `clients.profile_id = auth.uid()`. After lead conversion, clients often exist before the user signs up — `portal-client-projects.sql` adds `get_my_client_id()` to match by email.

If portal users converted from leads cannot download project files, run `storage-email-clients.sql` to align storage policies with that helper (same logic as project RLS via `client_owns_project()`).

## After migrations

1. Create your first admin user via Supabase Auth signup, then promote their profile role in the SQL editor or admin UI.
2. Configure Storage bucket policies if uploading media from the admin dashboard.
3. Set environment variables in `.env.local` (see `.env.example` and `DEPLOYMENT.md`).
