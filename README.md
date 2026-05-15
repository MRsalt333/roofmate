# Roofmate

Mobile-first roofing quote MVP for contractors: **Next.js (App Router)**, **Supabase** (email/password auth + Postgres), **Tailwind CSS**, basic **PDF** export, and **Stripe** scaffolds for later billing.

## Quick look (no Supabase)

1. Omit `NEXT_PUBLIC_SUPABASE_URL` and both public keys from `.env.local` (or leave only `NEXT_PUBLIC_DEMO_MODE=true`). The app runs in **preview mode** with sample quotes.

2. Run `npm install` then `npm run dev` and open [http://localhost:3000](http://localhost:3000).

You’ll land on the dashboard with sample quotes, can open **New quote**, use **Save quote** (redirects to a static sample detail), and try **Download PDF**. When you add a real Supabase URL + anon or publishable key, preview mode turns off automatically and saves go to your project (no need to delete the demo line first).

## Prerequisites (full app)

- Node.js 20+ (recommended)
- A [Supabase](https://supabase.com/) project

## 1. Supabase setup

### Option A — CLI (keeps the remote DB in sync with `supabase/migrations/`)

1. Create a Supabase project if you do not have one yet.
2. One-time login: `npx supabase login` (opens the browser).
3. Link this repo to the project (get **Project ref** from the dashboard URL, and the **Database password** from **Project Settings → Database**):

   ```bash
   npm run db:link -- --project-ref YOUR_PROJECT_REF --password YOUR_DB_PASSWORD
   ```

4. Push all migrations to the hosted database (includes `quotes`, `quote_templates`, RLS, **table grants**, and **schema `public` usage** for the `authenticated` role):

   ```bash
   npm run db:push
   ```

   **No CLI link?** Run `npm run db:sql-bundle`, then paste **`supabase/BUNDLE_migrations_for_sql_editor.sql`** into the SQL Editor as one script (same order as `supabase/migrations/`).

5. Under **Authentication → Providers**, ensure **Email** is enabled.
6. Under **Authentication → URL configuration**, set **Site URL** to `http://localhost:3000` (and redirect URLs as needed).

If `db push` errors on Postgres version, set `major_version` under `[db]` in `supabase/config.toml` to match **Project Settings → Database → Postgres version** (e.g. `15`).

If you previously ran migration SQL only in the SQL Editor, the first `db push` still applies migration files in order; most statements are idempotent. If a step fails because an object already exists, fix the migration or use Supabase’s [migration repair](https://supabase.com/docs/reference/cli/supabase-migration-repair) to align history.

### Option B — SQL Editor only

1. Run `npm run db:sql-bundle`, open **`supabase/BUNDLE_migrations_for_sql_editor.sql`** in your editor, copy all, paste into **SQL Editor → New query → Run**.  
   If Postgres reports a syntax error on `execute function`, replace that clause with `execute procedure` (older instances) in the bundle section for `0001_init.sql` and run again.
2. Complete steps 5–6 from Option A for auth URLs.

*(Alternatively, run each file under `supabase/migrations/` in sorted order by hand.)*

## 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from **Project Settings → API**.

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account on `/signup`, then create quotes from the dashboard.

## Scripts

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Next dev (Turbopack)                             |
| `npm run build`         | Production build                                 |
| `npm run start`         | Start production server                          |
| `npm run lint`          | ESLint                                           |
| `npm run db:link`       | Link repo to a Supabase project (`-- --help`)   |
| `npm run db:push`       | Apply `supabase/migrations/` to the linked DB  |
| `npm run db:pull`       | Pull remote schema changes into migration files  |
| `npm run db:diff`       | Diff local vs remote (advanced)                  |
| `npm run db:migration:list` | List migration status on the linked project  |
| `npm run db:sql-bundle`     | Writes `supabase/BUNDLE_migrations_for_sql_editor.sql` to paste in the SQL Editor if `db:push` is not linked |

## Project layout

- `src/app/(auth)/` — login & signup
- `src/app/(app)/` — authenticated shell (header, dashboard, quotes)
- `src/actions/` — server actions (e.g. save quote)
- `src/lib/pricing.ts` — margin & totals (documented formulas)
- `src/lib/supabase/` — browser + server Supabase clients and session middleware
- `src/lib/pdf/quotePdf.ts` — client-side PDF via jsPDF
- `src/lib/integrations/` — stubs for Google Maps roof measurement, Stripe checkout, subscriptions
- `supabase/` — Supabase CLI config (`config.toml`) and versioned SQL migrations (`npm run db:link`, then `npm run db:push`)

## Pricing rules

For roof size \(m²\), material and labour **per m²**, and margin **percent**:

- `total_material = size × material_per_sqm`
- `total_labour = size × labour_per_sqm`
- `subtotal = total_material + total_labour`
- `margin_amount = subtotal × (margin / 100)`
- `final_price = subtotal + margin_amount`

## Deployment

- **Vercel**: connect the repo, set the same env vars, deploy. Ensure Supabase **Site URL** and redirect URLs include your production domain.
- **Supabase**: keep RLS enabled; never expose the service role key in the browser.

## Future work (scaffolded)

- `src/lib/integrations/google-maps-measurement.ts` — pre-fill roof area from Maps/measurement APIs.
- `src/lib/integrations/stripe.ts` + `src/app/api/stripe/*` — per-quote payments.
- `src/lib/integrations/subscription.ts` — plan tiers / gating.
