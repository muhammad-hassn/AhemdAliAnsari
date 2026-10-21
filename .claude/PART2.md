# PART 2 — Commerce & Content Pages

> Prerequisite: Part 1 is complete and passing lint/typecheck/build/knip.
> Do NOT build: /admin UI, blog, sitemap, JSON-LD (those are Part 3).
> Follow the same code standards, design tokens, motion tokens from Part 1. Reuse existing primitives.

## Working Rules
1. Create a task list with Steps 0–8 below and work strictly in order.
2. Write every file ONCE in its final form. No stubs, no "will be completed later", no temporary code.
3. Design for Part 3 now: DB and shared helpers contain everything Part 3 needs, so Part 3 will not rewrite any Part 2 function.
4. Do not reopen files from earlier steps except to fix a real bug, or the explicitly listed integration points in Step 4.
5. After each step run `pnpm typecheck` and `pnpm lint`, fix everything, then mark the step done and move on.
6. Define each zod schema, type, and constant in exactly one place and import it everywhere.

---

## STEP 0: PRE-FLIGHT (Read-Only)
- Inspect the repo
- Confirm Part 1 tables exist: collections, products, currency_rates, testimonials, site_settings, hero_slides, navigation_items, pages
- Confirm contact info, nav, and footer text are read from site_settings / navigation_items
- Output a list of existing files that will be touched in Step 4 and why
- Write no code yet

## STEP 1: DATABASE
**One migration**: `supabase/migrations/0002_commerce.sql` + seed additions.

See DATABASE.md for full schema. Key additions:
- Enums: user_role, order_status, payment_status, payment_option
- Tables: profiles, addresses, wishlist_items, product_stock, shipping_rates, payment_methods, orders, order_items, order_events, payment_proofs, contact_messages, subscribers, rate_limits
- ALTER pages: add hero_image_url
- Functions: current_user_role(), create_order(payload), set_order_status()
- Triggers: profile on signup, product_stock → products.in_stock sync
- RLS for all new tables
- Storage: private bucket payment-proofs
- Do NOT edit this migration after completing Step 1

## STEP 2: SHARED FOUNDATION (Write Once)
- `src/lib/validation/{auth,checkout,contact,newsletter,account}.ts` — zod schemas shared client/server
- `src/server/pricing.ts` — THE ONLY place computing subtotal, shipping, total, deposit
- `src/server/rate-limit.ts` — wraps check_rate_limit DB function
- `src/server/email/` — Resend client + typed HTML templates (order confirmation to customer, new order to admin). Failures never block orders; errors go through `src/lib/report-error.ts`
- `src/lib/safe-redirect.ts` — only same-origin relative paths
- `src/lib/action.ts` — typed result `{ ok: true, data } | { ok: false, error, fieldErrors? }` + wrapper for Server Actions (zod parse, rate limit, error mapping)
- `src/lib/seo.ts` — `buildMetadata({ title, description, path, image, noindex })` used by every page. Auth/account/checkout/order/track pages are noindex
- `src/lib/middleware/` — session refresh + route guard config array `[{ prefix, roles }]`. Part 2 registers only /account. Part 3 adds /admin by adding entries, NOT by rewriting
- Update `env.ts` and `.env.example`: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, EMAIL_FROM, ADMIN_NOTIFY_EMAIL, NEXT_PUBLIC_SITE_URL

## STEP 3: AUTH & ACCOUNT
- **Auth methods**: Email + password, magic link
- **Pages**: /login, /register, /forgot-password, /reset-password
- **Route handler**: /auth/callback
- **Account page**: /account with tabs: Profile, Orders, Addresses, Wishlist
- Validated `?next=` redirect after login
- Header shows logged-in state (user menu vs login link)
- Order list and detail inside /account use the owner's session

## STEP 4: STOCK-AWARE CART + WISHLIST SYNC
**The ONLY edits to Part 1 files happen here:**
- Product queries return per-size stock
- Size chips disable out-of-stock sizes and show "Only N left" when N ≤ 3
- Cart store caps quantity at available stock; revalidates against server when drawer opens
- Quick view uses the same stock logic
- Wishlist: server action syncs and merges local list on login; logged-in toggles write to DB, guests stay local
- Cart drawer's Checkout button links to /checkout

## STEP 5: CHECKOUT & ORDERS
### /checkout
- Guest checkout allowed
- Prefilled for logged-in users with saved addresses
- Sections: Contact, Shipping form, Country select, Shipping rate (from zone), Payment method (filtered by country — COD only for Pakistan), Payment option (full vs 50% deposit)
- Amount-due-now / balance-on-delivery summary
- All orders charged in PKR; converted amount shown as approximate reference only
- Uses react-hook-form + zod with shared schema (client AND server)

### Place Order
- One Server Action, rate-limited
- Re-validates everything with shared schema
- Calls `create_order` via service role
- Sends both emails (customer + admin)
- Clears cart
- Redirects to `/order/[number]?t=<access_token>`

### /order/[number]
- Viewable by owner (session) OR valid access token
- Shows: items, totals, payment instructions from payment_methods
- WhatsApp click-to-chat link prefilled with order number (from site_settings)
- Payment proof uploader (for methods that require proof)

### Payment Proof Upload
- Server action validates order access + file metadata (jpg/png/webp/pdf, max 5 MB)
- Returns signed upload URL → client uploads to private bucket
- Second action records payment_proofs and sets payment_status = proof_submitted + order_event

### /track
- Order number + email lookup (rate-limited, generic error on mismatch)
- Shows status timeline from order_events + tracking number

## STEP 6: CONTENT PAGES
### About (`/about`)
- Editorial layout: hero image from `pages.hero_image_url`, large lead paragraph, sections, parallax artisan imagery
- Renders HTML body from `pages` row key "about"

### Policy Pages (`/privacy`, `/refund`, `/terms`, `/shipping`)
- One shared `PolicyPage` layout
- Reads from `pages` rows by key
- Seed professional content for each

### Contact (`/contact`)
- FAQ accordion (questions in `src/content/faqs.ts` as typed data)
- Contact form saved to `contact_messages` (honeypot + zod + rate limit)
- Contact details from `site_settings`
- WhatsApp button

### Newsletter (Footer)
- Saves to `subscribers`
- Duplicates handled gracefully with friendly message
- All rich HTML sanitized via a single `SafeHtml` component

## STEP 7: STATES, A11Y, RESPONSIVE
- Custom 404 page
- Global `error.tsx`
- `loading.tsx` for data routes
- Empty states for orders, wishlist, cart
- Verify at: 360, 390, 768, 1024, 1440, 1920 px
- No horizontal scroll
- 44px tap targets
- Visible focus rings
- Keyboard-navigable forms
- `prefers-reduced-motion` respected
- Dynamic imports only where a client component is genuinely heavy

## STEP 8: FINAL CLEANUP
- Remove dead code and unused dependencies
- Run and fix until clean:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm build
  pnpm knip
  ```
- Update README: env vars, running migrations and seeds, creating first admin (set `profiles.role = 'admin'` in Supabase), Resend config, deploy to Vercel
- List decisions and limitations
- No TODOs left in code
