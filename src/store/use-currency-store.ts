"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CurrencyRate } from "@/types";

const DEFAULT_CURRENCY: CurrencyRate = {
  code: "PKR",
  rate_from_pkr: 1.0,
  symbol: "Rs.",
  updated_at: new Date().toISOString(),
};

interface CurrencyStore {
  currency: CurrencyRate;
  rates: CurrencyRate[];
  setCurrency: (currency: CurrencyRate) => void;
  setRates: (rates: CurrencyRate[]) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      rates: [DEFAULT_CURRENCY],
      setCurrency: (currency) => set({ currency }),
      setRates: (rates) =>
        set((state) => {
          const matched = rates.find((r) => r.code === state.currency.code);
          return {
            rates,
            currency: matched ?? state.currency,
          };
        }),
    }),
    {
      name: "ali-ahmed-currency-storage",
    },
  ),
);
