import "server-only";

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/types";
import { SEED_TESTIMONIALS } from "./seed-data";

async function fetchActiveTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      return SEED_TESTIMONIALS;
    }
    return data as Testimonial[];
  } catch {
    return SEED_TESTIMONIALS;
  }
}

export const getActiveTestimonials = unstable_cache(
  fetchActiveTestimonials,
  ["testimonials"],
  { tags: ["testimonials"], revalidate: 3600 },
);
