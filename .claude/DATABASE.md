# DATABASE SCHEMA

> All tables across all 3 parts. Each part adds its own migration file. RLS is ON for every table.

---

## Part 1 Migration: `supabase/migrations/0001_init.sql`

### `collections`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default gen_random_uuid() |
| slug | text unique | URL slug |
| name | text | Display name |
| description | text | |
| image_url | text | 2:3 portrait |
| sort_order | int | For ordering |

### `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | |
| name | text | |
| collection_id | uuid FK → collections | |
| price_pkr | numeric | Base price in PKR |
| compare_at_price_pkr | numeric | nullable, for "on sale" |
| description | text | |
| details | jsonb | `{ fabric, trouser, dupatta }` |
| sizes | text[] | Always ordered: XXS, XS, S, M, ML, L, XL, XXL |
| images | text[] | Array of image URLs |
| is_active | boolean | |
| is_featured | boolean | |
| in_stock | boolean | Part 2 adds trigger to sync from product_stock |
| created_at | timestamptz | |

### `currency_rates`
| Column | Type | Notes |
|---|---|---|
| code | text PK | e.g., 'USD', 'GBP' |
| rate_from_pkr | numeric | 1 PKR = X of this currency |
| symbol | text | e.g., '$', '£' |
| updated_at | timestamptz | |

### `testimonials`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| text | text | |
| rating | int | 1–5 |
| is_active | boolean | |

### `site_settings` (key-value)
| Column | Type | Notes |
|---|---|---|
| key | text PK | e.g., 'brand_name', 'whatsapp_number', 'announcement_text' |
| value | text | |
| updated_at | timestamptz | |

### `hero_slides`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| desktop_image_url | text | |
| mobile_image_url | text | nullable |
| heading | text | |
| subheading | text | nullable |
| cta_text | text | |
| cta_link | text | |
| sort_order | int | |
| is_active | boolean | |

### `navigation_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| location | text | 'header' or 'footer' |
| label | text | |
| href | text | |
| sort_order | int | |
| is_active | boolean | |

### `pages`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| key | text unique | 'about', 'privacy', 'refund', 'terms', 'shipping' |
| title | text | |
| content | text | HTML body |
| meta_title | text | nullable |
| meta_description | text | nullable |
| hero_image_url | text | nullable, added in Part 2 (ALTER) |
| updated_at | timestamptz | |

### RLS (Part 1)
- All tables: public `SELECT` only on active/published rows
- No public `INSERT`, `UPDATE`, `DELETE`
- Products filtered by `is_active = true`

### Seed Data (Part 1)
- 3 collections
- 12 products with generic names and neutral locally generated 2:3 placeholder images
- 7 currencies (PKR, USD, GBP, EUR, AED, SAR, CAD)
- 4 testimonials
- Storage bucket `product-images` (public read)

---

## Part 2 Migration: `supabase/migrations/0002_commerce.sql`

### Enums
```sql
CREATE TYPE user_role AS ENUM ('customer', 'editor', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'proof_submitted', 'deposit_received', 'paid', 'refunded');
CREATE TYPE payment_option AS ENUM ('full', 'deposit');
```

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK = auth.users.id | |
| full_name | text | |
| phone | text | nullable |
| role | user_role | default 'customer' |
| created_at | timestamptz | |

**Trigger**: Automatically creates a profile row on user signup.

### `addresses`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| label | text | e.g., 'Home', 'Office' |
| full_name | text | |
| phone | text | |
| line1 | text | |
| line2 | text | nullable |
| city | text | |
| state | text | |
| postal_code | text | |
| country_code | text | |
| is_default | boolean | |

### `wishlist_items`
| Column | Type | Notes |
|---|---|---|
| user_id | uuid FK → profiles | |
| product_id | uuid FK → products | |
| created_at | timestamptz | |
| **PK** | (user_id, product_id) | unique pair |

### `product_stock`
| Column | Type | Notes |
|---|---|---|
| product_id | uuid FK → products | |
| size | text | |
| quantity | int CHECK >= 0 | |
| **PK** | (product_id, size) | |

**Trigger**: Keeps `products.in_stock` in sync — `true` when `SUM(quantity) > 0`.
**Seed**: Populated from existing products/sizes.

### `shipping_rates`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| zone_name | text | |
| country_codes | text[] | |
| price_pkr | numeric | |
| free_over_pkr | numeric | nullable |
| est_days_min | int | |
| est_days_max | int | |
| is_active | boolean | |

**Seed**: Pakistan zone (domestic) + International zone.

### `payment_methods`
| Column | Type | Notes |
|---|---|---|
| code | text PK | 'cod', 'bank_transfer', 'easypaisa', 'jazzcash' |
| label | text | |
| instructions | text | |
| details | jsonb | Account numbers etc. |
| allowed_country_codes | text[] | nullable (null = all countries) |
| requires_proof | boolean | |
| is_active | boolean | |
| sort_order | int | |

**Seed**: COD (Pakistan only), bank_transfer, easypaisa, jazzcash with clearly fake account values.

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_number | text unique | From sequence, formatted ORD-000123 |
| user_id | uuid FK nullable | null for guests |
| access_token | uuid | For guest order access |
| email | text | |
| phone | text | |
| status | order_status | |
| payment_status | payment_status | |
| payment_method_code | text FK | |
| payment_option | payment_option | |
| currency_code | text | Display currency |
| currency_rate | numeric | Rate at time of order |
| subtotal_pkr | numeric | |
| shipping_pkr | numeric | |
| total_pkr | numeric | |
| amount_due_now_pkr | numeric | |
| amount_balance_pkr | numeric | |
| shipping_address | jsonb | Snapshot |
| customer_note | text | nullable |
| tracking_number | text | nullable |
| courier | text | nullable |
| internal_notes | text | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK → orders | |
| product_id | uuid FK | |
| name | text | Snapshot |
| size | text | |
| quantity | int | |
| unit_price_pkr | numeric | Snapshot |
| image_url | text | Snapshot |

### `order_events`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| type | text | e.g., 'status_change', 'created' |
| from_status | text | nullable |
| to_status | text | nullable |
| note | text | nullable |
| created_at | timestamptz | |

### `payment_proofs`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| storage_path | text | |
| uploaded_at | timestamptz | |

### `contact_messages`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| email | text | |
| phone | text | nullable |
| message | text | |
| is_read | boolean | default false |
| created_at | timestamptz | |

### `subscribers`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| email | text unique (case-insensitive) | |
| is_active | boolean | default true |
| created_at | timestamptz | |
| unsubscribed_at | timestamptz | nullable |

### `rate_limits`
| Column | Type | Notes |
|---|---|---|
| key | text PK | |
| window_start | timestamptz | |
| count | int | |

**Function**: `check_rate_limit(key, max, window_seconds)` → boolean.

### DB Functions (Part 2, security definer)
1. **`current_user_role()`** — Returns the role of the current authenticated user, used in RLS.
2. **`create_order(payload jsonb)`** — One transaction: locks product_stock FOR UPDATE, re-reads prices from products (never trust client), verifies stock/shipping/payment/deposit, decrements stock, inserts order + items + event, returns order_number + access_token.
3. **`set_order_status(order_id, new_status, note)`** — Validates allowed status transitions, restores stock on cancel, writes order_events. Part 3 admin uses this as-is.

### RLS (Part 2)
- profiles, addresses, wishlist_items: owner-only (user_id = auth.uid())
- orders, order_items, order_events, payment_proofs: readable only by owner
- contact_messages, subscribers, rate_limits: reachable only via server code (service role)
- No public writes to any table
- Admin policies added in Part 3

### Storage (Part 2)
- Private bucket `payment-proofs` (authenticated upload, no public read)

---

## Part 3 Additions

### `audit_log`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | who |
| action | text | what (create, update, delete) |
| entity_type | text | which table |
| entity_id | text | which row |
| details | jsonb | nullable |
| created_at | timestamptz | |

### Blog Tables

#### `authors`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| bio | text | |
| avatar_url | text | nullable |

#### `blog_categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | |
| name | text | |
| description | text | nullable |

#### `blog_tags`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | |
| name | text | |

#### `blog_posts`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| slug | text unique | |
| title | text | |
| excerpt | text | |
| content | text | HTML |
| cover_image_url | text | |
| cover_alt | text | |
| author_id | uuid FK → authors | |
| category_id | uuid FK → blog_categories | |
| status | text | 'draft', 'scheduled', 'published' |
| published_at | timestamptz | nullable |
| reading_time | int | minutes |
| is_featured | boolean | |
| meta_title | text | nullable |
| meta_description | text | nullable |
| og_image_url | text | nullable |
| canonical_url | text | nullable |
| noindex | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `post_tags`
| Column | Type | Notes |
|---|---|---|
| post_id | uuid FK | |
| tag_id | uuid FK | |
| **PK** | (post_id, tag_id) | |

### `redirects`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| from_path | text unique | |
| to_path | text | |
| status_code | int | 301 or 302 |
| is_active | boolean | |

### RLS (Part 3)
- Admin/editor RLS policies for all tables
- Blog tables: public read only for published posts where `published_at <= now()`
- Audit log: admin read only
- Redirects: admin only

---

## Size Order (Universal)
```
XXS, XS, S, M, ML, L, XL, XXL
```
Always display sizes in this order. Never alphabetical.
