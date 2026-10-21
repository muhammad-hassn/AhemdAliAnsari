# PROJECT OVERVIEW

## Brand
Pakistani luxury Eastern-wear (embroidered formal wear) e-commerce brand.
Premium editorial aesthetic — NOT playful, NOT minimal-modern-startup. Think luxury fashion house.

## Tech Stack
| Layer | Tool |
|---|---|
| Framework | Next.js (latest stable, App Router) |
| Language | TypeScript strict |
| Package Manager | pnpm |
| CSS | Tailwind CSS v4 + shadcn/ui (restyled to brand tokens) |
| Database | Supabase (Postgres + Storage) via `@supabase/ssr` |
| Animation | `motion` package + `lenis` (smooth scroll) |
| State | zustand (cart/wishlist/currency, persisted) |
| Validation | zod |
| Icons | lucide-react (thin-stroke only) |
| Email | Resend |
| Forms | react-hook-form + zod |
| Rich Text | Tiptap (admin only, Part 3) |
| Charts | recharts (admin only, Part 3) |
| Linting | ESLint + Prettier + knip |

## Build Order

### Part 1 — Storefront Foundation
- Stack setup, design system, motion primitives
- Database: collections, products, currency_rates, testimonials, site_settings, hero_slides, navigation_items, pages
- Pages: Home, Shop, Product, Cart drawer, Wishlist, Currency switcher
- Status: **NOT STARTED**

### Part 2 — Commerce & Content
- Database: profiles, addresses, wishlist_items, product_stock, shipping_rates, payment_methods, orders, order_items, order_events, payment_proofs, contact_messages, subscribers, rate_limits
- Auth (email+password, magic link), Account pages
- Checkout (guest allowed), Orders, Payment proof upload, Order tracking
- Content pages: About, Contact, Privacy, Refund, Terms, Shipping
- Newsletter, 404, error states
- Status: **NOT STARTED**

### Part 3 — Admin CMS, Blog, Full SEO
- Admin panel (roles: admin, editor)
- Blog system (posts, categories, tags, authors)
- Full SEO (JSON-LD, OG images, sitemap, robots, redirects)
- Media library, Navigation manager, Site settings editor
- Audit log, Homepage manager, Pages manager
- Status: **NOT STARTED**

## Definition of Done (every part)
All of these must pass with zero errors before a part is considered complete:
```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm knip
```
No TODOs, no console.log, no placeholder lorem, no commented-out code, no unused code/deps/exports.

## Env Vars (cumulative)
```env
# Part 1
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Part 2
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=
ADMIN_NOTIFY_EMAIL=
NEXT_PUBLIC_SITE_URL=

# Part 3
# (none additional expected)
```
