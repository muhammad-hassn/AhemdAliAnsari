# CODE STANDARDS (Non-Negotiable)

## Component Architecture
- **Server Components by default**; `"use client"` only where interactivity is required
- One component per file
- PascalCase filenames for components (e.g., `ProductCard.tsx`)
- kebab-case for everything else (e.g., `format.ts`, `use-cart.ts`)

## TypeScript
- Strict mode enabled
- No `any` type — ever
- No unused code, variables, imports
- No commented-out code
- No `console.log` (only `src/lib/report-error.ts` may call `console.error`)
- No TODO comments in shipped code
- No placeholder "lorem ipsum" in shipped components

## Data Access
- All Supabase queries live in `src/server/queries/*.ts`
- Every query file must `import "server-only"` at the top
- Components NEVER call Supabase directly — always go through query files
- Service role key used server-side only, never exposed to client

## Organization Rules
- Types live in `src/types/` — DB row types defined once, reused everywhere
- Constants, nav links, copy live in `src/lib/constants.ts` — never inline
- Env vars validated with zod in `src/lib/env.ts`
- Zod schemas defined in exactly ONE place (`src/lib/validation/`) and imported everywhere
- Reusable primitives first (Button, Container, Section, Heading, Price, Badge), then compose

## Server Actions
- All use a typed result shape: `{ ok: true, data } | { ok: false, error, fieldErrors? }`
- Wrapped via `src/lib/action.ts` helper (zod parse, rate limit, error mapping)
- Always include zod validation + role check where applicable
- Use `revalidateTag` for cache invalidation after mutations

## Folder Structure
```
src/
├── app/
│   ├── (site)/              # Public storefront
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Home
│   │   ├── shop/page.tsx
│   │   ├── product/[slug]/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── account/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── order/[number]/page.tsx
│   │   ├── track/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── refund/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── shipping/page.tsx
│   │   ├── blog/...
│   │   ├── not-found.tsx
│   │   ├── loading.tsx
│   │   └── error.tsx
│   ├── auth/
│       └── callback/route.ts
│   ├── admin/...
├── components/
│   ├── ui/                   # Primitives (Button, Input, Badge, etc.)
│   ├── layout/               # Header, Footer, MobileMenu, AnnouncementBar
│   ├── motion/               # Reveal, StaggerGroup, TextReveal, ParallaxImage
│   ├── home/                 # Hero, Collections, FeaturedProducts, etc.
│   ├── shop/                 # ProductGrid, Filters, QuickView, etc.
│   ├── product/              # Gallery, SizeSelector, ProductAccordion, etc.
│   ├── cart/                  # CartDrawer, CartItem, etc.
│   ├── account/              # ProfileForm, OrderList, AddressForm, etc.
│   ├── checkout/             # CheckoutForm, PaymentMethods, OrderSummary, etc.
│   └── admin/
├── content/                  # Typed content (FAQs, etc.)
├── lib/
│   ├── supabase/             # Client/server Supabase helpers
│   ├── middleware/            # Session refresh, route guards
│   ├── validation/           # Zod schemas (auth, checkout, contact, etc.)
│   ├── env.ts
│   ├── format.ts             # Currency formatting, dates, etc.
│   ├── constants.ts
│   ├── utils.ts              # cn() and other utilities
│   ├── safe-redirect.ts
│   ├── action.ts             # Server Action wrapper
│   ├── seo.ts                # buildMetadata helper
│   └── report-error.ts       # Only file that may console.error
├── server/
│   ├── queries/              # All DB queries (import "server-only")
│   ├── pricing.ts            # Subtotal, shipping, total, deposit calc
│   ├── rate-limit.ts
│   └── email/                # Resend client + templates
├── store/                    # Zustand stores (cart, wishlist, currency)
└── types/                    # All TypeScript types/interfaces

supabase/
├── migrations/
│   ├── 0001_init.sql
│   └── 0002_commerce.sql
└── seed.sql
```

## Naming Conventions
| Thing | Convention | Example |
|---|---|---|
| Component file | PascalCase | `ProductCard.tsx` |
| Non-component file | kebab-case | `use-cart.ts` |
| Type/Interface | PascalCase | `Product`, `OrderRow` |
| Constant | SCREAMING_SNAKE | `SITE_NAME` |
| Zustand store | camelCase hook | `useCartStore` |
| CSS variable | kebab-case | `--color-ivory` |
| DB table | snake_case plural | `order_items` |
| DB column | snake_case | `created_at` |
| URL slug | kebab-case | `/product/emerald-bridal` |
