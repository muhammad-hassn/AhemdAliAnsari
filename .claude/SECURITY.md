# SECURITY & RLS CHECKLIST

> Reference for every security decision across the project.

---

## Core Principles
1. **RLS ON** for every table — no exceptions
2. **Public can only SELECT** active/published rows — never INSERT/UPDATE/DELETE
3. **Service role key** used server-side only — never exposed to client
4. **No secrets in client bundles** — all sensitive env vars are server-only (no NEXT_PUBLIC_ prefix)
5. **Validate all inputs** with zod — client AND server
6. **Never trust client prices** — `create_order()` re-reads prices from DB
7. **Sanitize rich text** on save AND on render

---

## RLS Policy Summary

### Part 1 Tables (Public Read)
| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| collections | Active rows only (public) | ❌ | ❌ | ❌ |
| products | Active rows only (public) | ❌ | ❌ | ❌ |
| currency_rates | All (public) | ❌ | ❌ | ❌ |
| testimonials | Active rows only (public) | ❌ | ❌ | ❌ |
| site_settings | All (public) | ❌ | ❌ | ❌ |
| hero_slides | Active rows only (public) | ❌ | ❌ | ❌ |
| navigation_items | Active rows only (public) | ❌ | ❌ | ❌ |
| pages | All (public) | ❌ | ❌ | ❌ |

### Part 2 Tables (Owner / Server Only)
| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| profiles | Owner only | Trigger only | Owner only | ❌ |
| addresses | Owner only | Owner | Owner | Owner |
| wishlist_items | Owner only | Owner | ❌ | Owner |
| product_stock | Public read | ❌ | ❌ | ❌ |
| shipping_rates | Active rows (public) | ❌ | ❌ | ❌ |
| payment_methods | Active rows (public) | ❌ | ❌ | ❌ |
| orders | Owner only | Service role | Service role | ❌ |
| order_items | Owner only | Service role | ❌ | ❌ |
| order_events | Owner only | Service role | ❌ | ❌ |
| payment_proofs | Owner only | Service role | ❌ | ❌ |
| contact_messages | Service role only | Service role | Service role | Service role |
| subscribers | Service role only | Service role | Service role | ❌ |
| rate_limits | Service role only | Service role | Service role | ❌ |

### Part 3 Tables (Admin/Editor + Public Read)
| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| blog_posts | Published only (public) / All (admin/editor) | Admin/editor | Admin/editor | Admin |
| blog_categories | All (public) | Admin/editor | Admin/editor | Admin |
| blog_tags | All (public) | Admin/editor | Admin/editor | Admin |
| post_tags | All (public) | Admin/editor | Admin/editor | Admin |
| authors | All (public) | Admin/editor | Admin/editor | Admin |
| audit_log | Admin only | Service role | ❌ | ❌ |
| redirects | Admin only | Admin | Admin | Admin |

---

## Auth Security
- Passwords hashed by Supabase Auth (bcrypt)
- Magic link tokens expire
- Session refresh in middleware
- Route guards: `/account` (any authenticated), `/admin` (admin/editor only)
- `?next=` redirect validated via `safe-redirect.ts` (same-origin relative paths only)

## Form Security
- Honeypot field on contact form
- Rate limiting via `check_rate_limit()` DB function
- Generic error messages on auth failures (no user enumeration)
- File upload validation: type (jpg/png/webp/pdf), size (max 5 MB)

## Storage Security
- `product-images` bucket: public read
- `payment-proofs` bucket: private, authenticated upload only
- Part 3 media bucket: public read, admin/editor write only

## Order Security
- Guest orders accessible only via `access_token` (UUID)
- Owner orders accessible via session (`user_id` match)
- `create_order()` runs as security definer with service role
- Stock locked with `FOR UPDATE` to prevent overselling
- Prices re-read from DB, never trusted from client
- Order status transitions validated (no skipping states)
- Cancelled orders restore stock
