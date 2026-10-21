import "server-only";

import { createPublicClient } from "@/lib/supabase/server";
import type { Product, ShopFilters } from "@/types";
import { SEED_PRODUCTS, SEED_COLLECTIONS } from "./seed-data";

export async function getProducts(
  filters: ShopFilters = {},
): Promise<{ products: Product[]; total: number; totalPages: number }> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = Math.max(1, filters.perPage ?? 12);

  try {
    const supabase = createPublicClient();
    let query = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true);

    if (filters.collection) {
      const collection = SEED_COLLECTIONS.find((c) => c.slug === filters.collection);
      if (collection) {
        query = query.eq("collection_id", collection.id);
      }
    }

    if (typeof filters.minPrice === "number") {
      query = query.gte("price_pkr", filters.minPrice);
    }

    if (typeof filters.maxPrice === "number") {
      query = query.lte("price_pkr", filters.maxPrice);
    }

    if (filters.inStock) {
      query = query.eq("in_stock", true);
    }

    if (filters.onSale) {
      query = query.not("compare_at_price_pkr", "is", null);
    }

    if (filters.size) {
      query = query.contains("sizes", [filters.size]);
    }

    // Sort
    const [sortCol, sortDir] = (filters.sort ?? "created_at:desc").split(":");
    const ascending = sortDir === "asc";
    if (sortCol) {
      query = query.order(sortCol, { ascending });
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error || !data || data.length === 0) {
      return getFilteredSeedProducts(filters, page, perPage);
    }

    const total = count ?? data.length;
    return {
      products: data as Product[],
      total,
      totalPages: Math.ceil(total / perPage),
    };
  } catch {
    return getFilteredSeedProducts(filters, page, perPage);
  }
}

function getFilteredSeedProducts(
  filters: ShopFilters,
  page: number,
  perPage: number,
): { products: Product[]; total: number; totalPages: number } {
  let list = [...SEED_PRODUCTS].filter((p) => p.is_active);

  if (filters.collection) {
    const matchedCol = SEED_COLLECTIONS.find((c) => c.slug === filters.collection);
    if (matchedCol) {
      list = list.filter((p) => p.collection_id === matchedCol.id);
    }
  }

  if (typeof filters.minPrice === "number") {
    list = list.filter((p) => p.price_pkr >= (filters.minPrice ?? 0));
  }

  if (typeof filters.maxPrice === "number") {
    list = list.filter((p) => p.price_pkr <= (filters.maxPrice ?? Infinity));
  }

  if (filters.inStock) {
    list = list.filter((p) => p.in_stock);
  }

  if (filters.onSale) {
    list = list.filter((p) => p.compare_at_price_pkr !== null);
  }

  if (filters.size) {
    list = list.filter((p) => p.sizes.includes(filters.size as string));
  }

  const [sortCol, sortDir] = (filters.sort ?? "created_at:desc").split(":");
  const asc = sortDir === "asc";

  list.sort((a, b) => {
    if (sortCol === "price_pkr") {
      return asc ? a.price_pkr - b.price_pkr : b.price_pkr - a.price_pkr;
    }
    if (sortCol === "name") {
      return asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    return asc
      ? a.created_at.localeCompare(b.created_at)
      : b.created_at.localeCompare(a.created_at);
  });

  const total = list.length;
  const start = (page - 1) * perPage;
  const products = list.slice(start, start + perPage);

  return {
    products,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
    }
    return data as Product;
  } catch {
    return SEED_PRODUCTS.find((p) => p.slug === slug && p.is_active) ?? null;
  }
}

export async function getFeaturedProducts(collectionSlug?: string): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true);

    if (collectionSlug) {
      const col = SEED_COLLECTIONS.find((c) => c.slug === collectionSlug);
      if (col) {
        query = query.eq("collection_id", col.id);
      }
    }

    const { data, error } = await query.limit(8);

    if (error || !data || data.length === 0) {
      return getFeaturedSeedProducts(collectionSlug);
    }
    return data as Product[];
  } catch {
    return getFeaturedSeedProducts(collectionSlug);
  }
}

function getFeaturedSeedProducts(collectionSlug?: string): Product[] {
  let list = SEED_PRODUCTS.filter((p) => p.is_active && p.is_featured);
  if (collectionSlug) {
    const col = SEED_COLLECTIONS.find((c) => c.slug === collectionSlug);
    if (col) {
      list = list.filter((p) => p.collection_id === col.id);
    }
  }
  return list.slice(0, 8);
}

export async function getRelatedProducts(
  currentProductId: string,
  collectionId: string,
  limit = 4,
): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("collection_id", collectionId)
      .eq("is_active", true)
      .neq("id", currentProductId)
      .limit(limit);

    if (error || !data || data.length === 0) {
      return SEED_PRODUCTS.filter(
        (p) => p.collection_id === collectionId && p.id !== currentProductId && p.is_active,
      ).slice(0, limit);
    }
    return data as Product[];
  } catch {
    return SEED_PRODUCTS.filter(
      (p) => p.collection_id === collectionId && p.id !== currentProductId && p.is_active,
    ).slice(0, limit);
  }
}

export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("slug")
      .eq("is_active", true);

    if (!data || data.length === 0) {
      return SEED_PRODUCTS.filter((p) => p.is_active).map((p) => p.slug);
    }
    return data.map((p) => p.slug);
  } catch {
    return SEED_PRODUCTS.filter((p) => p.is_active).map((p) => p.slug);
  }
}

