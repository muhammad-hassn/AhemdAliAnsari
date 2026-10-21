import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { Redirect } from "@/types";

export const getActiveRedirects = unstable_cache(
  async (): Promise<Redirect[]> => {
    try {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("redirects")
        .select("*")
        .eq("is_active", true);

      if (error || !data) return [];
      return data as Redirect[];
    } catch {
      return [];
    }
  },
  ["active-redirects"],
  { tags: ["redirects"], revalidate: 3600 },
);
