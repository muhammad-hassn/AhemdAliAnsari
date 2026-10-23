# PAGES MAP & COMPONENT INVENTORY

> Quick reference for Ali Ahmed Ansari website — all pages and components.
> All build phases complete.

---

## Storefront Pages

| Route | Key Components |
|---|---|
| `/` | Hero, TrustMarquee, CollectionCards, FeaturedProducts, CraftsmanshipSection, WhyUs, TestimonialCarousel, InstagramStrip |
| `/shop` | ShopFilters, ProductGrid, GridToggle, Pagination, QuickViewDialog, SkeletonGrid, EmptyState |
| `/product/[slug]` | ProductGallery, SizeSelector, SizeGuideDrawer, ProductAccordion, RelatedProducts, StickyMobileBar |
| `/login` | AuthForm (email+password, magic link) |
| `/register` | AuthForm |
| `/forgot-password` | ForgotPasswordForm |
| `/reset-password` | ResetPasswordForm |
| `/account` | AccountTabs (Profile, Orders, Addresses, Wishlist) |
| `/checkout` | CheckoutForm, ShippingForm, PaymentMethodList, PaymentOptionSelector, OrderSummary |
| `/order/[number]` | OrderDetail, PaymentInstructions, ProofUploader, WhatsAppLink |
| `/track` | TrackingForm, StatusTimeline |
| `/about` | AboutHero, AboutSections, ParallaxImage |
| `/contact` | FAQAccordion, ContactForm, WhatsAppButton |
| `/privacy` | PolicyPage (shared layout) |
| `/refund` | PolicyPage |
| `/terms` | PolicyPage |
| `/shipping` | PolicyPage |
| `/blog` | FeaturedPostHero, CategoryFilter, BlogCardGrid, Pagination |
| `/blog/[slug]` | BlogCover, TableOfContents, BlogContent, ShareButtons, RelatedPosts, RelatedProducts |
| `/blog/category/[slug]` | CategoryHeader, BlogCardGrid, Pagination |
| `/blog/tag/[slug]` | TagHeader, BlogCardGrid, Pagination |
| `/blog/rss.xml` | (Route handler) |

## Global Components

| Component | Location | Notes |
|---|---|---|
| AnnouncementBar | layout/AnnouncementBar.tsx | Dismissible, text from constants/settings |
| Header | layout/Header.tsx | Sticky + blur, logo, nav, actions |
| MobileMenu | layout/MobileMenu.tsx | Sheet/drawer |
| Footer | layout/Footer.tsx | Brand, contact, social, policies, newsletter (Part 2) |
| CartDrawer | cart/CartDrawer.tsx | Slide-over, qty, remove, subtotal |
| CurrencySwitcher | layout/CurrencySwitcher.tsx | Dropdown, persisted |

## UI Primitives

| Component | Variants |
|---|---|
| Button | solid, outline, text-link; hover fill-slide |
| Container | max-w-1440, centered |
| Section | generous vertical padding |
| Heading | Cormorant Garamond |
| Price | Currency-aware formatting |
| Badge | Small caps label |
| ProductCard | Image hover cross-fade + scale |

## Motion Primitives

| Component | Effect |
|---|---|
| Reveal | Fade + 24px rise on viewport enter |
| StaggerGroup | Staggered entrance |
| TextReveal | Line/word mask reveal |
| ParallaxImage | Scroll parallax |

## Overlay / Interactive

| Component | Notes |
|---|---|
| Dialog | For quick view, lightbox |
| Sheet | For mobile menu, cart drawer, size guide |
| Accordion | For product details, FAQs |

## Admin Components

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
