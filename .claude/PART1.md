# PART 1 — Storefront Foundation

> Build ONLY what is listed here. Do not build Part 2 or Part 3 features.

## Scope
- Stack setup (Next.js, TypeScript, pnpm, Tailwind v4, shadcn/ui)
- Database: Part 1 tables + seed (see DATABASE.md)
- Design system implementation (see DESIGN_SYSTEM.md)
- Motion primitives (see MOTION.md)
- Pages: Home, Shop, Product, Cart, Wishlist, Currency switcher
- Global layout: header, footer, mobile menu, announcement bar

---

## Global Layout

### Announcement Bar
- Delivery note text from `src/lib/constants.ts` (or site_settings)
- Dismissible

### Header
- Logo (left)
- Nav links: Home, Shop, About, Contact
- Right side: Search, Currency Switcher, Wishlist (heart icon), Cart (bag icon with count badge)
- **Sticky** with blur-on-scroll effect
- Mobile: hamburger → slide-over sheet menu

### Footer
- Brand line
- Contact info
- Social links
- Policy links (Privacy, Refund, Terms, Shipping)
- Newsletter placeholder area (actual form in Part 2)

### Mobile Menu
- Sheet/drawer component
- Full nav links
- Close button

---

## Pages

### Home Page
Sections in this exact order:

1. **Hero**: Full-viewport, 3-slide cross-fade with slow zoom (Ken Burns), `<TextReveal>` headline, one CTA button
2. **Trust Marquee**: Scrolling marquee of trust signals (free shipping, handcrafted, etc.)
3. **Collections**: 3 large 2:3 portrait cards linking to shop filtered by collection
4. **Featured Products**: Tabs by collection, showing product cards
5. **Craftsmanship**: Split section — text on one side, parallax image on the other
6. **Why Us**: 4 pillars/USPs in a grid
7. **Testimonials**: Carousel of testimonial cards
8. **Instagram Strip**: Static image strip (links out to Instagram)

### Shop Page
- URL-driven filters via `searchParams`:
  - Collection
  - Price range
  - Size
  - Availability (in stock)
  - On sale
- Sort options
- Per-page options
- **Grid toggle**: 2/3/4 columns
- Server-rendered pagination
- Skeleton loading states
- Empty state when no products match
- **Quick-view dialog**: Opens a product preview without navigating away

### Product Page (`/product/[slug]`)
- **Gallery**: Thumbnail strip + main image with hover zoom + lightbox
- Name, price (currency-aware via selected currency)
- **Details list**: Fabric, Trouser, Dupatta (from `details` jsonb)
- **Size chips**: Clickable size selector + size-guide drawer
- Custom-measurement note
- **Add to Bag** button
- **Wishlist toggle** (heart icon)
- **Accordion sections**: Description, Details, Shipping & Delivery, Care
- **Related Products** section (same collection)
- **Sticky mobile add-to-bag bar** (fixed bottom bar on mobile)

### Cart (Slide-over Drawer)
- Item list with quantity controls and remove button
- Subtotal
- "Checkout" button → links to `/checkout` (Part 2)
- Empty cart state

### Wishlist Page
- Grid of wishlisted products
- Remove from wishlist
- Empty state

### Currency System
- Base currency: PKR
- Format with `Intl.NumberFormat` using `currency_rates` table data
- Currency selection persisted in zustand store (persisted to localStorage)
- Switcher in header

---

## Reusable Primitives to Build First
Build these in `src/components/ui/` before composing pages:
- Button (solid, outline, text-link variants)
- Container (max-w-[1440px], centered, padded)
- Section (generous vertical padding)
- Heading (uses Cormorant Garamond)
- Price (currency-aware formatting)
- Badge (small caps label)
- Input, Select, Dialog, Sheet, Accordion
- ProductCard (image hover effect, price, wishlist toggle)

---

## Seed Data Requirements
- 3 collections (e.g., Bridal, Formals, Pret)
- 12 products with:
  - Generic but realistic names (not lorem)
  - Neutral locally generated 2:3 placeholder images
  - Realistic PKR prices
  - Fabric/trouser/dupatta details
  - Mix of featured/non-featured, in-stock/out-of-stock, on-sale/regular
- 7 currencies: PKR, USD, GBP, EUR, AED, SAR, CAD
- 4 testimonials with realistic names and review text
- Site settings, hero slides, navigation items, pages seeded

---

## Definition of Done
```bash
pnpm lint       # zero errors
pnpm typecheck  # zero errors
pnpm build      # successful
pnpm knip       # zero unused files/exports/deps
```
Provide `.env.example` and a README section "Setup Part 1". Then STOP.
