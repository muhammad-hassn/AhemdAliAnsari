import "server-only";

import { createPublicClient } from "@/lib/supabase/server";
import type { NavigationItem } from "@/types";
import { SEED_NAV_ITEMS } from "./seed-data";

export async function getNavigationItems(
  location?: "header" | "footer",
): Promise<NavigationItem[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("navigation_items")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (location) {
      query = query.eq("location", location);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return location
        ? SEED_NAV_ITEMS.filter((i) => i.location === location && i.is_active)
        : SEED_NAV_ITEMS.filter((i) => i.is_active);
    }
    return data as NavigationItem[];
  } catch {
    return location
      ? SEED_NAV_ITEMS.filter((i) => i.location === location && i.is_active)
      : SEED_NAV_ITEMS.filter((i) => i.is_active);
  }
}
