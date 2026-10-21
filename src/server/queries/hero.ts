import "server-only";

import { createPublicClient } from "@/lib/supabase/server";
import type { HeroSlide } from "@/types";
import { SEED_HERO_SLIDES } from "./seed-data";

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return SEED_HERO_SLIDES;
    }
    return data as HeroSlide[];
  } catch {
    return SEED_HERO_SLIDES;
  }
}
