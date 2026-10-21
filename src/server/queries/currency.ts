import "server-only";

import { createPublicClient } from "@/lib/supabase/server";
import type { CurrencyRate } from "@/types";
import { SEED_CURRENCIES } from "./seed-data";

export async function getCurrencyRates(): Promise<CurrencyRate[]> {
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




