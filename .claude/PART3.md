# PART 3 — Admin CMS, Blog, Full SEO

> Prerequisite: Parts 1 and 2 are complete and passing lint/typecheck/build/knip.
> Follow the same code standards, design tokens, motion tokens. Reuse existing primitives. No dead code, no TODOs.

---

## 1. ADMIN SHELL (`/admin`)

### Roles
- **admin**: Full access to everything
- **editor**: Blog, pages, media only
- Enforce in middleware AND inside every Server Action

### Layout
- Left sidebar (collapsible; slide-over drawer on mobile)
- Top bar: breadcrumbs + global search (Cmd+K command palette)
- User menu (top-right)
- Premium UI consistent with storefront tokens (ivory/ink/gold, hairline borders, square corners, Cormorant headings + Jost UI)
- Calm, spacious, no clutter
- Responsive: data tables → stacked cards on mobile; forms → single column; usable at 360px

### Reusable Admin Primitives (`src/components/admin/`)
- **DataTable** — sort, filter, pagination, bulk select
- **FormSection** — styled form wrapper
- **ImageUploader** — multi-image, drag-reorder
- **RichTextEditor** — Tiptap with sanitized output
- **ConfirmDialog** — for destructive actions
- **StatusBadge** — order/post status indicators
- **EmptyState** — consistent empty views
- **Toasts** — success/error notifications

### Mutations
- All via Server Actions
- Every action: zod validation + role check + `revalidateTag`
- Audit log written on every mutation

---

## 2. ADMIN MODULES

| Module | Features |
|---|---|
| **Dashboard** | Revenue, orders by status, low-stock list, recent orders, top products (recharts styled to tokens) |
| **Products** | CRUD, per-size stock, price/compare-at, fabric details, multi-image (reorder + required alt text), collection, active/featured flags, bulk actions (activate/deactivate/delete), duplicate product, SEO panel |
| **Collections** | CRUD with image and SEO panel |
| **Orders** | List with filters, detail view, status workflow (pending→confirmed→shipped→delivered/cancelled), view payment proof, add tracking number, internal notes, CSV export |
| **Customers** | List and order history |
| **Homepage Manager** | Hero slides (desktop+mobile image, text, CTA, reorder), featured products, testimonials |
| **Blog Manager** | Posts, categories, tags, authors (see section 3) |
| **Pages Manager** | About, Privacy, Refund, Terms, Shipping — rich text editor + SEO panel |
| **Navigation Manager** | Header/footer links, reorder, enable/disable |
| **Media Library** | Upload to Supabase Storage, folder-less grid, search, required alt text, usage warning before delete |
| **Site Settings** | Brand, logo, favicon, announcement bar, contact details, social links, WhatsApp number, shipping rates, currency rates, payment instructions, analytics IDs |
| **Messages & Subscribers** | List, mark read, delete, export CSV |
| **Redirects Manager** | from_path, to_path, 301/302, active toggle |

---

## 3. BLOG

### Database Tables (see DATABASE.md)
- blog_posts, blog_categories, blog_tags, post_tags, authors

### Storefront Pages
| Route | Description |
|---|---|
| `/blog` | Featured post hero, category filter, server-rendered pagination, premium editorial card grid |
| `/blog/[slug]` | Cover, title, author, date, reading time, auto table of contents, rich styled typography, share buttons, related posts, related products block, Article JSON-LD |
| `/blog/category/[slug]` | Filtered blog list |
| `/blog/tag/[slug]` | Filtered blog list |
| `/blog/rss.xml` | RSS feed |

### Blog Features
- Scheduled posts publish automatically (filter by `published_at <= now()` at query time)
- Content images use `next/image` with alt text, lazy loaded
- Rich typography for blog content (prose-style)
- Reading time calculated on save

---

## 4. COMPLETE SEO

### Per-Page Metadata
- `generateMetadata` on EVERY route reading DB SEO fields
- Sensible fallbacks: title template `"%s | Brand"`, description from excerpt/description
- Canonical URLs
- `noindex` support
- OpenGraph and Twitter cards

### Dynamic OG Images
- Via `next/og` for products, collections, and blog posts
- Branded design matching the storefront aesthetic

### Sitemap & Robots
- `sitemap.ts`: pages, collections, products, blog posts, categories — excludes noindex
- `robots.ts`: standard configuration

### JSON-LD Schemas
| Schema | Pages |
|---|---|
| Organization | Global |
| WebSite (with SearchAction) | Global |
| Product (price, availability, images) | Product pages |
| BreadcrumbList | Shop, product, blog |
| Article | Blog posts |
| FAQPage | Contact page |

### Breadcrumbs
- Visible breadcrumbs on shop, product, and blog pages
- Matching the BreadcrumbList JSON-LD

### Redirects
- From `redirects` table
- Applied in middleware using tag-cached lookup (no DB hit on every request)
- Slug generator with uniqueness check
- Changing a published slug offers to create a 301 automatically

### Admin SEO Panel
Available on products, collections, posts, pages:
- Meta title (character counter, 60 chars)
- Meta description (character counter, 155 chars)
- OG image picker
- Canonical URL
- Noindex toggle
- Live Google-style search preview
- Simple score checks (title/description length, one H1, images missing alt)

### Semantic HTML
- Exactly one `<h1>` per page
- Correct heading order (h1 → h2 → h3)
- Descriptive link text (no "click here")

### Performance
- LCP image with `priority` prop
- No layout shift (explicit width/height on images)
- Dynamic imports for editor and charts (admin only)
- Target: Lighthouse 90+ mobile on Home, Shop, Product, Blog post

---

## 5. RESPONSIVE QA
Verify every storefront AND admin screen at: 360, 390, 768, 1024, 1440, 1920 px.
- No horizontal scroll
- No overlapping elements
- Tap targets 44px minimum
- `prefers-reduced-motion` respected

## 6. SECURITY
- RLS reviewed for every new table
- Public read only for published content; writes only via server functions with role check
- Sanitize rich text on save AND on render
- Storage policies: public read for media, authenticated admin/editor write
- Validate all inputs with zod
- No secrets in client bundle

## 7. DEFINITION OF DONE
```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm knip
```
All zero errors. Update README:
- How to create the first admin
- How editors are added
- How to manage content
- How to deploy
- Decisions and limitations listed at the end
