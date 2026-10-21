import "server-only";

import { createPublicClient } from "@/lib/supabase/server";
import type { Page } from "@/types";
import { SEED_PAGES } from "./seed-data";

export async function getPageByKey(key: string): Promise<Page | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("key", key)
      .maybeSingle();

    if (error || !data) {
      return SEED_PAGES[key] ?? null;
    }
    return data as Page;
  } catch {
    return SEED_PAGES[key] ?? null;
  }
}
