"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/store/use-currency-store";
import type { CurrencyRate } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface CurrencySwitcherProps {
  rates?: CurrencyRate[];
  className?: string;
}

export function CurrencySwitcher({ rates, className }: CurrencySwitcherProps) {
  const currentCurrency = useCurrencyStore((state) => state.currency);
  const setCurrency = useCurrencyStore((state) => state.setCurrency);
  const setRates = useCurrencyStore((state) => state.setRates);
  const storedRates = useCurrencyStore((state) => state.rates);

  useEffect(() => {
    if (rates && rates.length > 0) {
      setRates(rates);
    }
  }, [rates, setRates]);

  const activeRates = rates && rates.length > 0 ? rates : storedRates;

  return (
    <div className={className}>
      <Select
        value={currentCurrency.code}
        onValueChange={(code) => {
          const selected = activeRates.find((r) => r.code === code);
          if (selected) {
            setCurrency(selected);
          }
        }}
      >
        <SelectTrigger className="h-8 border-none bg-transparent px-2 py-0 text-xs font-sans uppercase tracking-[0.1em] text-ink focus:ring-0">
          <SelectValue placeholder={currentCurrency.code}>
            {currentCurrency.code}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {activeRates.map((rate) => (
            <SelectItem key={rate.code} value={rate.code} className="text-xs uppercase">
              <span className="font-medium mr-1.5">{rate.code}</span>
              <span className="text-stone">({rate.symbol})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
