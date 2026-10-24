# Ali Ahmed Ansari — Pakistani Luxury Eastern-Wear Haute Couture

An editorial, high-performance e-commerce boutique and content management platform for Pakistani luxury bridal, festive, and formal wear, built with Next.js 16 (App Router), Tailwind CSS v4, TypeScript, Supabase, and Motion.

---

## Architecture & Technology Stack

- **Framework**: Next.js 16 (App Router with Server Components by default)
- **Language**: TypeScript Strict Mode
- **Styling**: Tailwind CSS v4 + bespoke luxury design tokens (Ivory, Ink, Gold, Burgundy)
- **Database & Auth**: Supabase (Postgres with Row-Level Security, Database Triggers, and `@supabase/ssr`)
- **Animation & Interaction**: Motion (`motion/react`) + Lenis smooth scrolling
- **State Management**: Zustand (cart & wishlist with client persistence)
- **Validation**: Zod (shared schemas for client & server)
- **Email Delivery**: Resend (asynchronous transactional notifications)
- **SEO & Social**: Next.js Dynamic Metadata, `next/og` Edge Image Generation, Dynamic Sitemap, Robots.txt, and complete JSON-LD Schemas (Organization, WebSite, Product, Article, FAQPage, BreadcrumbList)
- **Quality Gates**: ESLint, Prettier, Knip, TypeScript strict

---

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env.local` and provide your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon public API key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role secret (server-side only)
- `RESEND_API_KEY`: API key from Resend for transactional email notifications
- `EMAIL_FROM`: Verified sender address (e.g. `orders@ahmedaliansari.com`)
- `ADMIN_NOTIFY_EMAIL`: Admin email for new order alerts
- `NEXT_PUBLIC_SITE_URL`: Production site URL (default: `https://ahmedaliansari.com`)

### 2. Database Migrations & Seeds

Execute the migrations in sequential order in your Supabase SQL editor or CLI:

1. **Part 1 Initial Foundation**:
   Run `supabase/migrations/0001_init.sql` followed by `supabase/seed.sql` to populate collections, products, currency rates, testimonials, and site settings.
2. **Part 2 Commerce & Auth**:
   Run `supabase/migrations/0002_commerce.sql` to establish `profiles`, `addresses`, `orders`, `order_items`, `order_events`, `shipping_rates`, `payment_methods`, and RLS policies.
3. **Part 3 Admin CMS, Blog & SEO**:
   Run `supabase/migrations/0003_admin_blog_seo.sql` to establish `authors`, `blog_categories`, `blog_tags`, `blog_posts`, `post_tags`, `redirects`, `audit_log`, and role-based policies.

---

## Administration & Content Management

### 1. Creating Your First Administrator
1. Register an account via `/register` or sign in via `/login`.
2. Open your Supabase Dashboard &rarr; Table Editor &rarr; `profiles`.
3. Locate your record by user ID or email and set the `role` column to `'admin'`.
4. Sign in and navigate directly to `/admin` to access the full management suite.

### 2. Adding Editors
Staff members can be designated as **`editor`**:
- In the Supabase `profiles` table, set their `role` column to `'editor'`.
- **Editors** have dedicated access to:
  - The Blog Manager (`/admin/blog`)
  - Content Pages (`/admin/pages`)
  - The Media Library (`/admin/media`)
- **Admins** retain exclusive rights to modify financial settings, orders, products, collections, navigation menus, and system redirects.

### 3. Managing Storefront & Content
The administrative suite at `/admin` includes:
- **Dashboard**: Real-time sales metrics, order status breakdowns, low-stock alerts, and top products.
- **Products**: Full inventory management, per-size stock allocation (XXS through XXL), fabric specifications, multi-image upload with required alt-text, and dedicated Google Search SEO previews.
- **Collections**: Seasonal catalogs (Velvet, Silk, Chiffon, Lawn) with custom banners and URL slugs.
- **Orders**: Status workflows (`pending` &rarr; `confirmed` &rarr; `shipped` &rarr; `delivered`), bank slip proof verification, courier tracking links, and customer contact details.
- **Customers**: Patron directory tracking lifetime expenditure and historical purchases.
- **Homepage Manager**: Reorderable hero banner carousel, mobile banner overlays, and promotional calls-to-action.
- **Blog Manager**: Rich editorial publishing with reading-time calculation, category/tag taxonomies, author profiles, and automatic Article JSON-LD generation.
- **Pages Manager**: Static editorial policies (About, Shipping, Refund, Terms, Privacy) with built-in metadata controls.
- **Navigation Manager**: Header menus, mobile drawer links, and footer directories.
- **Media Library**: Folder-less image repository with mandatory accessibility alt-text audits and usage warnings before deletion.
- **Site Settings**: Global brand details, announcement banner text, WhatsApp concierge contact, and Google Analytics 4 integration.
- **Redirects**: 301 and 302 URL redirects applied via cached middleware.

---

## Deployment Guide

### Vercel Deployment (Recommended)
1. Push this repository to GitHub or GitLab.
2. Import the project into [Vercel](https://vercel.com).
3. Set the Environment Variables defined in `.env.example`.
4. Ensure the build command is `pnpm build` and the install command is `pnpm install`.
5. Deploy. Vercel automatically deploys the Edge OpenGraph image routes and serverless API handlers.

---

## Quality Verification Commands

Before any production deployment or pull request:

```bash
pnpm lint       # ESLint with zero warnings allowed
pnpm typecheck  # TypeScript compiler check
pnpm knip       # Unused file and export analysis
pnpm build      # Production Next.js compilation
```

---

## Architectural Decisions & Current Limitations

- **Dual Pricing & Multi-Currency**: All ledger transactions, checkout settlements, and order totals are authoritatively recorded in Pakistani Rupees (PKR). Converted currency rates (USD, GBP, EUR, AED, SAR, CAD) provide real-time approximate reference for international clientele.
- **Bespoke 50% Advance Model**: Because bridal and formal ensembles require extensive hand-embroidery hours, the platform natively supports 50% advance deposits alongside full upfront payments.
- **Server Actions & RLS**: All mutations are executed via typed Server Actions wrapped with Zod validation, role authorization guards, and Supabase Row Level Security.
- **Fail-Safe Email Dispatch**: Resend errors are captured via `reportError` and will never abort an ongoing customer order placement.
- **Next.js 16 Edge OpenGraph**: Dynamic OG images for products, collections, and articles are generated on the edge via `next/og` (`ImageResponse`).
