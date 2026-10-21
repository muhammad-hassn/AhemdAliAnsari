export const SITE_NAME = "Ahmed Ali Ansari";
export const SITE_TAGLINE = "Premium Embroidered Fabrics";
export const SITE_DESCRIPTION =
  "Premium embroidered fabrics crafted with elegance and delivered with trust. Luxurious Pakistani Eastern-wear and kurtis.";

export const ANNOUNCEMENT_TEXT =
  "Complimentary delivery on orders above PKR 15,000 within Pakistan";

export const WHATSAPP_NUMBER = "+923092045906";

export const CONTACT_EMAIL = "aahmedaliansariofficial@gmail.com";
export const CONTACT_PHONE = "+92 309 2045906";
export const CONTACT_ADDRESS =
  "Lahore, Punjab, Pakistan";

export const INSTAGRAM_URL = "https://instagram.com/ahmedaliansari.official";
export const FACEBOOK_URL = "https://www.facebook.com/share/1M1kjqDWHj/";

export const SIZE_ORDER = [
  "XXS",
  "XS",
  "S",
  "M",
  "ML",
  "L",
  "XL",
  "XXL",
] as const;

export type Size = (typeof SIZE_ORDER)[number];

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_POLICY_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Shipping Policy", href: "/shipping" },
] as const;

export const TRUST_SIGNALS = [
  "Handcrafted in Pakistan",
  "Premium Fabrics",
  "Complimentary Packaging",
  "Custom Measurements Available",
  "Worldwide Delivery",
  "Authentic Embroidery",
  "Ethically Made",
  "Bespoke Alterations",
] as const;

export const CRAFTSMANSHIP_POINTS = [
  {
    heading: "Master Artisans",
    body: "Each piece is hand-stitched by craftspeople who have perfected their art across generations.",
  },
  {
    heading: "Finest Fabrics",
    body: "We source only the most luxurious chiffons, silks, and organzas — imported and domestic.",
  },
  {
    heading: "Bespoke Embroidery",
    body: "Our signature motifs are hand-drawn and translated into thread by skilled karigars.",
  },
] as const;

export const WHY_US_PILLARS = [
  {
    label: "Heritage",
    description:
      "Rooted in centuries of South Asian embroidery traditions.",
  },
  {
    label: "Quality",
    description:
      "Every garment passes a rigorous 12-point quality inspection.",
  },
  {
    label: "Authenticity",
    description:
      "No mass production. Every piece is made to order with intent.",
  },
  {
    label: "Care",
    description:
      "From first stitch to final delivery, your order is handled with utmost care.",
  },
] as const;

export const BASE_CURRENCY = "PKR";

export const PRODUCTS_PER_PAGE_OPTIONS = [12, 24, 48] as const;
export const DEFAULT_PRODUCTS_PER_PAGE = 12;

export const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest" },
  { value: "price_pkr:asc", label: "Price: Low to High" },
  { value: "price_pkr:desc", label: "Price: High to Low" },
  { value: "name:asc", label: "Name: A–Z" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
