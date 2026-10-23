# PROJECT OVERVIEW

## Brand
**Ali Ahmed Ansari** — Pakistani luxury Eastern-wear (embroidered formal wear, kurtis, and premium fabrics) e-commerce brand.
Premium editorial aesthetic — NOT playful, NOT minimal-modern-startup. Think luxury fashion house.

## Tech Stack
| Layer | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript strict |
| Package Manager | pnpm |
| CSS | Tailwind CSS v4 + custom design tokens |
| Database | Supabase (Postgres + Storage) via `@supabase/ssr` |
| Animation | `motion` package + `lenis` (smooth scroll) |
| State | zustand (cart/wishlist/currency, persisted) |
| Validation | zod |
| Icons | lucide-react (thin-stroke only) |
| Email | Resend |
| Forms | react-hook-form + zod |
| Rich Text | Tiptap (admin only) |
| Charts | recharts (admin only) |
| Linting | ESLint + Prettier + knip |
| Image Storage | Supabase Storage (hero-images, product-images, promotions buckets) |
| Image Upload | Direct browser file picker → `/api/admin/upload` → Supabase Storage |

## Project Status
All three build phases are **COMPLETE**:
- ✅ Part 1 — Storefront Foundation (Home, Shop, Product, Cart, Wishlist, Currency)
- ✅ Part 2 — Commerce & Content (Auth, Checkout, Orders, Payment, Contact, Policies)
- ✅ Part 3 — Admin CMS, Blog, Full SEO (Admin panel, Blog, Media Library, SEO)

## Build Verification
```bash
pnpm typecheck   # zero errors
pnpm build       # successful
```

## Env Vars
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
EMAIL_FROM=
ADMIN_NOTIFY_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

## Brand Constants (src/lib/constants.ts)
```
SITE_NAME = "Ahmed Ali Ansari"
WHATSAPP_NUMBER = "+923092045906"
CONTACT_EMAIL = "aahmedaliansariofficial@gmail.com"
INSTAGRAM = "https://instagram.com/ahmedaliansari.official"
```

## Key Admin Features
- All image uploads use direct browser file picker (no manual URL input)
- Homepage carousel, products, collections, media library, blog — all upload via device browser
- Upload API: `/api/admin/upload` → Supabase Storage buckets (hero-images, product-images, promotions)
- Roles: admin (full access), editor (blog, pages, media only)
