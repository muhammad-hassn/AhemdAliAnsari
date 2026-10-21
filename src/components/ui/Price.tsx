"use client";

import { useCurrencyStore } from "@/store/use-currency-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  amountPkr: number;
  compareAtAmountPkr?: number | null;
  className?: string;
  compareClassName?: string;
}

export function Price({
  amountPkr,
  compareAtAmountPkr,
  className,
  compareClassName,
}: PriceProps) {
  const currency = useCurrencyStore((state) => state.currency);

  const formattedPrice = formatPrice(amountPkr, currency);
  const formattedCompare = compareAtAmountPkr
    ? formatPrice(compareAtAmountPkr, currency)
    : null;

  return (
    <div className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-sans font-medium text-ink tracking-tight">
        {formattedPrice}
      </span>
      {formattedCompare && (
        <span
          className={cn(
            "text-xs line-through text-stone font-normal",
            compareClassName,
          )}
        >
          {formattedCompare}
        </span>
      )}
    </div>
  );
}
