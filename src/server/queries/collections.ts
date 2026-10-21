import "server-only";

import { createPublicClient } from "@/lib/supabase/server";
import type { Collection } from "@/types";
import { SEED_COLLECTIONS } from "./seed-data";

export async function getCollections(): Promise<Collection[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return SEED_COLLECTIONS;
    }
    return data as Collection[];
  } catch {
    return SEED_COLLECTIONS;
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return SEED_COLLECTIONS.find((c) => c.slug === slug) ?? null;
    }
    return data as Collection;
  } catch {
    return SEED_COLLECTIONS.find((c) => c.slug === slug) ?? null;
  }
}
