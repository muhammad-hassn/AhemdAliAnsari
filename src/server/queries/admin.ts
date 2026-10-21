import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminDashboardStats,
  AdminCustomer,
  Product,
  Order,
  Collection,
  BlogPost,
  AuditLogEntry,
  Redirect,
  Author,
  BlogCategory,
  BlogTag,
} from "@/types";

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [ordersRes, lowStockRes, topProductsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("product_stock")
      .select("id, product_id, size, quantity, product:products(name)")
      .lte("quantity", 5)
      .order("quantity", { ascending: true })
      .limit(10),
    supabase
      .from("order_items")
      .select("product_id, product_name, price_pkr, quantity")
      .limit(100),
  ]);

  const recentOrders = (ordersRes.data as unknown as Order[]) || [];

  const { data: allOrders } = await supabase
    .from("orders")
    .select("total_pkr, status");

  let totalRevenuePkr = 0;
  let pendingOrdersCount = 0;
  const ordersCount = allOrders?.length || 0;

  if (allOrders) {
    allOrders.forEach((o) => {
      if (o.status !== "cancelled") {
        totalRevenuePkr += Number(o.total_pkr || 0);
      }
      if (o.status === "pending") {
        pendingOrdersCount += 1;
      }
    });
  }

  type RawLowStock = {
    id: string;
    product_id: string;
    size: string;
    quantity: number;
    product: { name: string } | null;
  };
  const rawLowStock = (lowStockRes.data as unknown as RawLowStock[]) || [];
  const lowStockProducts = rawLowStock.map((item) => ({
    id: item.id,
    name: item.product?.name || "Product",
    size: item.size,
    quantity: item.quantity,
  }));

  type RawItem = {
    product_id: string;
    product_name: string;
    price_pkr: number;
    quantity: number;
  };
  const rawItems = (topProductsRes.data as unknown as RawItem[]) || [];
  const productAgg: Record<
    string,
    { name: string; pricePkr: number; salesCount: number; revenuePkr: number }
  > = {};

  rawItems.forEach((item) => {
    if (!productAgg[item.product_id]) {
      productAgg[item.product_id] = {
        name: item.product_name,
        pricePkr: Number(item.price_pkr),
        salesCount: 0,
        revenuePkr: 0,
      };
    }
    const qty = Number(item.quantity);
    productAgg[item.product_id].salesCount += qty;
    productAgg[item.product_id].revenuePkr += Number(item.price_pkr) * qty;
  });

  const topProducts = Object.entries(productAgg)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5);

  return {
    totalRevenuePkr,
    ordersCount,
    pendingOrdersCount,
    lowStockCount: lowStockProducts.length,
    recentOrders,
    lowStockProducts,
    topProducts,
  };
}

export async function getAdminProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`*, collection:collections(name, slug)`)
    .order("created_at", { ascending: false });

  if (!data) return [];

  const { data: stockData } = await supabase
    .from("product_stock")
    .select("product_id, size, quantity");

  const stockMap: Record<string, Record<string, number>> = {};
  if (stockData) {
    stockData.forEach((s) => {
      if (!stockMap[s.product_id]) stockMap[s.product_id] = {};
      stockMap[s.product_id][s.size] = s.quantity;
    });
  }

  return (data as unknown as Product[]).map((p) => ({
    ...p,
    stock: stockMap[p.id] || {},
  }));
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(`*, collection:collections(name, slug)`)
    .eq("id", id)
    .single();

  if (!data) return null;

  const { data: stockData } = await supabase
    .from("product_stock")
    .select("size, quantity")
    .eq("product_id", id);

  const stock: Record<string, number> = {};
  if (stockData) {
    stockData.forEach((s) => {
      stock[s.size] = s.quantity;
    });
  }

  return {
    ...(data as unknown as Product),
    stock,
  };
}

export async function getAdminCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data as unknown as Collection[]) || [];
}

export async function getAdminCollectionById(id: string): Promise<Collection | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  return (data as unknown as Collection) || null;
}

export async function getAdminOrders(statusFilter?: string): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*),
      events:order_events(*)
    `,
    )
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data } = await query;
  return (data as unknown as Order[]) || [];
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items(*),
      events:order_events(*)
    `,
    )
    .eq("id", id)
    .single();

  return (data as unknown as Order) || null;
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (!profiles) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("user_id, total_pkr");

  const orderCounts: Record<string, { count: number; spent: number }> = {};
  if (orders) {
    orders.forEach((o) => {
      if (o.user_id) {
        if (!orderCounts[o.user_id]) {
          orderCounts[o.user_id] = { count: 0, spent: 0 };
        }
        orderCounts[o.user_id].count += 1;
        orderCounts[o.user_id].spent += Number(o.total_pkr || 0);
      }
    });
  }

  return profiles.map((p) => ({
    id: p.id,
    fullName: p.full_name || "Customer",
    phone: p.phone,
    ordersCount: orderCounts[p.id]?.count || 0,
    totalSpentPkr: orderCounts[p.id]?.spent || 0,
    createdAt: p.created_at,
  }));
}

export async function getAdminAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data as unknown as AuditLogEntry[]) || [];
}

export async function getAdminRedirects(): Promise<Redirect[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("redirects")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as unknown as Redirect[]) || [];
}

export async function getAdminBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select(
      `
      *,
      author:authors(*),
      category:blog_categories(*),
      post_tags(tag:blog_tags(*))
    `,
    )
    .order("created_at", { ascending: false });

  if (!data) return [];

  type RawPostTag = { tag: BlogTag | null };
  type RawBlogPost = BlogPost & { post_tags?: RawPostTag[] };

  return (data as unknown as RawBlogPost[]).map((post) => ({
    ...post,
    tags: (post.post_tags || [])
      .map((pt) => pt.tag)
      .filter((t): t is BlogTag => Boolean(t)),
  }));
}

export async function getAdminAuthors(): Promise<Author[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("authors")
    .select("*")
    .order("name", { ascending: true });

  return (data as unknown as Author[]) || [];
}

export async function getAdminBlogCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_categories")
    .select("*")
    .order("name", { ascending: true });

  return (data as unknown as BlogCategory[]) || [];
}

export async function getAdminBlogTags(): Promise<BlogTag[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_tags")
    .select("*")
    .order("name", { ascending: true });

  return (data as unknown as BlogTag[]) || [];
}

export async function getAdminHeroSlides(): Promise<import("@/types").HeroSlide[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data as unknown as import("@/types").HeroSlide[]) || [];
}

export async function getAdminNavigationItems(): Promise<import("@/types").NavigationItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("navigation_items")
    .select("*")
    .order("sort_order", { ascending: true });

  return (data as unknown as import("@/types").NavigationItem[]) || [];
}

