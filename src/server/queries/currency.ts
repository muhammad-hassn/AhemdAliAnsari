import "server-only";

import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import type { CurrencyRate } from "@/types";
import { SEED_CURRENCIES } from "./seed-data";

async function fetchCurrencyRates(): Promise<CurrencyRate[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("currency_rates").select("*");

    if (error || !data || data.length === 0) {
      return SEED_CURRENCIES;
    }
    return data as CurrencyRate[];
  } catch {
    return SEED_CURRENCIES;
  }
}

export const getCurrencyRates = unstable_cache(fetchCurrencyRates, ["currency_rates"], {
  tags: ["currency_rates"],
  revalidate: 3600,
});




