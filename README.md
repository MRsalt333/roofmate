# Roofmate

Mobile-first roofing quote MVP for contractors: **Next.js (App Router)**, **Supabase** (email/password auth + Postgres), **Tailwind CSS**, basic **PDF** export, and **Stripe** scaffolds for later billing.

## Quick look (no Supabase)

1. Create `.env.local` with a single line:

   `NEXT_PUBLIC_DEMO_MODE=true`

2. Run `npm install` then `npm run dev` and open [http://localhost:3000](http://localhost:3000).

You’ll land on the dashboard with sample quotes, can open **New quote**, use **Save quote** (redirects to a static sample detail), and try **Download PDF**. Turn off demo mode and add Supabase keys when you want real auth and saving.

## Prerequisites (full app)

- Node.js 20+ (recommended)
- A [Supabase](https://supabase.com/) project

## 1. Supabase setup

1. Create a new Supabase project.
2. In the dashboard, open **SQL Editor** and paste the contents of `supabase/migrations/0001_init.sql`, then run it.  
   If Postgres reports a syntax error on `execute function`, replace that clause with `execute procedure` (older instances) and run again.  
   This creates:
   - `public.profiles` — one row per auth user (triggered on signup; extends `auth.users` as your “users” table for app data).
   - `public.quotes` — saved jobs/quotes with RLS so each user only sees their own rows.
3. Under **Authentication → Providers**, ensure **Email** is enabled.
4. For local development, under **Authentication → URL configuration**, set **Site URL** to `http://localhost:3000` and add the same to **Redirect URLs** if you use email confirmation links.

## 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API**.

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account on `/signup`, then create quotes from the dashboard.

## Scripts

| Command       | Description           |
| ------------- | --------------------- |
| `npm run dev` | Next dev (Turbopack)  |
| `npm run build` | Production build    |
| `npm run start` | Start production server |
| `npm run lint`  | ESLint                |

## Project layout

- `src/app/(auth)/` — login & signup
- `src/app/(app)/` — authenticated shell (header, dashboard, quotes)
- `src/actions/` — server actions (e.g. save quote)
- `src/lib/pricing.ts` — margin & totals (documented formulas)
- `src/lib/supabase/` — browser + server Supabase clients and session middleware
- `src/lib/pdf/quotePdf.ts` — client-side PDF via jsPDF
- `src/lib/integrations/` — stubs for Google Maps roof measurement, Stripe checkout, subscriptions
- `src/app/api/stripe/` — HTTP scaffolds returning `501` until Stripe is wired

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
