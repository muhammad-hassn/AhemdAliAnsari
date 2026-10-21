# PAGES MAP & COMPONENT INVENTORY

> Quick reference for what pages exist and what components they use.

---

## Storefront Pages

| Route | Part | Key Components |
|---|---|---|
| `/` | 1 | Hero, TrustMarquee, CollectionCards, FeaturedProducts, CraftsmanshipSection, WhyUs, TestimonialCarousel, InstagramStrip |
| `/shop` | 1 | ShopFilters, ProductGrid, GridToggle, Pagination, QuickViewDialog, SkeletonGrid, EmptyState |
| `/product/[slug]` | 1 | ProductGallery, SizeSelector, SizeGuideDrawer, ProductAccordion, RelatedProducts, StickyMobileBar |
| `/login` | 2 | AuthForm (email+password, magic link) |
| `/register` | 2 | AuthForm |
| `/forgot-password` | 2 | ForgotPasswordForm |
| `/reset-password` | 2 | ResetPasswordForm |
| `/account` | 2 | AccountTabs (Profile, Orders, Addresses, Wishlist) |
| `/checkout` | 2 | CheckoutForm, ShippingForm, PaymentMethodList, PaymentOptionSelector, OrderSummary |
| `/order/[number]` | 2 | OrderDetail, PaymentInstructions, ProofUploader, WhatsAppLink |
| `/track` | 2 | TrackingForm, StatusTimeline |
| `/about` | 2 | AboutHero, AboutSections, ParallaxImage |
| `/contact` | 2 | FAQAccordion, ContactForm, WhatsAppButton |
| `/privacy` | 2 | PolicyPage (shared layout) |
| `/refund` | 2 | PolicyPage |
| `/terms` | 2 | PolicyPage |
| `/shipping` | 2 | PolicyPage |
| `/blog` | 3 | FeaturedPostHero, CategoryFilter, BlogCardGrid, Pagination |
| `/blog/[slug]` | 3 | BlogCover, TableOfContents, BlogContent, ShareButtons, RelatedPosts, RelatedProducts |
| `/blog/category/[slug]` | 3 | CategoryHeader, BlogCardGrid, Pagination |
| `/blog/tag/[slug]` | 3 | TagHeader, BlogCardGrid, Pagination |
| `/blog/rss.xml` | 3 | (Route handler) |

## Global Components (Part 1)

| Component | Location | Notes |
|---|---|---|
| AnnouncementBar | layout/AnnouncementBar.tsx | Dismissible, text from constants/settings |
| Header | layout/Header.tsx | Sticky + blur, logo, nav, actions |
| MobileMenu | layout/MobileMenu.tsx | Sheet/drawer |
| Footer | layout/Footer.tsx | Brand, contact, social, policies, newsletter (Part 2) |
| CartDrawer | cart/CartDrawer.tsx | Slide-over, qty, remove, subtotal |
| CurrencySwitcher | layout/CurrencySwitcher.tsx | Dropdown, persisted |

## UI Primitives (Part 1)

| Component | Variants |
|---|---|
| Button | solid, outline, text-link; hover fill-slide |
| Container | max-w-1440, centered |
| Section | generous vertical padding |
| Heading | Cormorant Garamond |
| Price | Currency-aware formatting |
| Badge | Small caps label |
| ProductCard | Image hover cross-fade + scale |

## Motion Primitives (Part 1)

| Component | Effect |
|---|---|
| Reveal | Fade + 24px rise on viewport enter |
| StaggerGroup | Staggered entrance |
| TextReveal | Line/word mask reveal |
| ParallaxImage | Scroll parallax |

## Overlay / Interactive (Part 1)

| Component | Notes |
|---|---|
| Dialog | For quick view, lightbox |
| Sheet | For mobile menu, cart drawer, size guide |
| Accordion | For product details, FAQs |

## Admin Components (Part 3)

| Component | Notes |
|---|---|
| AdminLayout | Sidebar + topbar + breadcrumbs |
| DataTable | Sort, filter, pagination, bulk select |
| FormSection | Styled form wrapper |
| ImageUploader | Multi, drag-reorder |
| RichTextEditor | Tiptap, sanitized |
| ConfirmDialog | Destructive action confirmation |
| StatusBadge | Order/post status |
| EmptyState | Consistent empty views |
| SEOPanel | Meta title/desc, OG image, preview, scoring |
| CommandPalette | Cmd+K global search |
