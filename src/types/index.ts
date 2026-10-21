export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
}

export interface ProductDetails {
  fabric: string;
  trouser: string;
  dupatta: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collection_id: string;
  price_pkr: number;
  compare_at_price_pkr: number | null;
  description: string;
  details: ProductDetails;
  sizes: string[];
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  in_stock: boolean;
  stock?: Record<string, number>;
  created_at: string;
}

export interface CurrencyRate {
  code: string;
  rate_from_pkr: number;
  symbol: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  is_active: boolean;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_at: string;
}

export interface HeroSlide {
  id: string;
  desktop_image_url: string;
  mobile_image_url: string | null;
  heading: string;
  subheading: string | null;
  cta_text: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
}

export interface NavigationItem {
  id: string;
  location: "header" | "footer";
  label: string;
  href: string;
  sort_order: number;
  is_active: boolean;
}

export interface Page {
  id: string;
  key: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  hero_image_url: string | null;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  size: string;
  price_pkr: number;
  image: string;
  quantity: number;
}

export interface ShopFilters {
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
}

export type UserRole = "customer" | "editor" | "admin";
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "proof_submitted" | "deposit_received" | "paid" | "refunded";
export type PaymentOption = "full" | "deposit";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country_code: string;
  is_default: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  size: string;
  quantity: number;
  unit_price_pkr: number;
  product_name: string;
  product_image_url: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface PaymentProof {
  id: string;
  order_id: string;
  file_url: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  status: OrderStatus;
  shipping_address: {
    label?: string;
    full_name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postal_code: string;
    country_code: string;
  };
  currency_code: string;
  currency_rate: number;
  subtotal_pkr: number;
  shipping_pkr: number;
  total_pkr: number;
  payment_method_id: string;
  payment_option: PaymentOption;
  deposit_amount_pkr: number;
  balance_amount_pkr: number;
  payment_status: PaymentStatus;
  tracking_number: string | null;
  notes: string | null;
  access_token: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  events?: OrderEvent[];
}

export interface ShippingRate {
  id: string;
  country_code: string;
  region_name: string;
  rate_pkr: number;
  estimated_days: string;
  is_active: boolean;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  instructions: string;
  requires_proof: boolean;
  allowed_countries: string[];
  is_active: boolean;
}

export interface ProductStock {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  reserved_quantity: number;
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
}

export interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface BlogTag {
  id: string;
  slug: string;
  name: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  cover_alt: string;
  author_id: string | null;
  category_id: string | null;
  status: 'draft' | 'scheduled' | 'published';
  published_at: string | null;
  reading_time: number;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  noindex: boolean;
  created_at: string;
  updated_at: string;
  author?: Author | null;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface Redirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: number;
  is_active: boolean;
  created_at: string;
}

export interface AdminDashboardStats {
  totalRevenuePkr: number;
  ordersCount: number;
  pendingOrdersCount: number;
  lowStockCount: number;
  recentOrders: Order[];
  lowStockProducts: Array<{
    id: string;
    name: string;
    size: string;
    quantity: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    pricePkr: number;
    salesCount: number;
    revenuePkr: number;
  }>;
}

export interface AdminCustomer {
  id: string;
  fullName: string;
  email?: string;
  phone: string | null;
  ordersCount: number;
  totalSpentPkr: number;
  createdAt: string;
}


