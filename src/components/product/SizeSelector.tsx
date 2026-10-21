"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { SIZE_ORDER } from "@/lib/constants";
import { SizeGuideDrawer } from "./SizeGuideDrawer";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  availableSizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
  stock?: Record<string, number>;
  className?: string;
}

export function SizeSelector({
  availableSizes,
  selectedSize,
  onSelectSize,
  stock,
  className,
}: SizeSelectorProps) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-sans uppercase tracking-[0.14em] text-ink font-medium">
          Select Size
        </span>
        <button
          type="button"
          onClick={() => setIsGuideOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-[0.1em] text-stone hover:text-ink transition-colors cursor-pointer"
        >
          <Ruler className="h-3.5 w-3.5" />
          <span>Size Guide</span>
        </button>
      </div>

      {/* Ordered Size Chips */}
      <div className="flex flex-wrap gap-2">
        {SIZE_ORDER.map((size) => {
          const isConfigured = availableSizes.includes(size);
          const sizeStock = stock ? stock[size] : undefined;
          const isOutOfStock = !isConfigured || (sizeStock !== undefined && sizeStock <= 0);
          const isSelected = selectedSize === size;
          const isLowStock = sizeStock !== undefined && sizeStock > 0 && sizeStock <= 3;

          return (
            <div key={size} className="relative flex flex-col items-center">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => onSelectSize(size)}
                className={cn(
                  "h-11 min-w-[48px] px-3.5 text-xs font-sans font-medium uppercase tracking-[0.1em] border transition-all cursor-pointer relative",
                  isSelected
                    ? "border-ink bg-ink text-ivory shadow-xs"
                    : !isOutOfStock
                      ? "border-hairline bg-transparent text-ink hover:border-ink"
                      : "border-hairline/40 text-stone/40 bg-hairline/10 cursor-not-allowed line-through",
                )}
              >
                {size}
              </button>
              {isLowStock && (
                <span className="text-[9px] font-sans text-amber-700 tracking-tight mt-1 whitespace-nowrap">
                  Only {sizeStock} left
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Measurement Note */}
      <p className="text-[11px] text-stone font-sans pt-1">
        Complimentary custom measurements available. Select closest size or request bespoke tailoring.
      </p>

      {/* Size Guide Drawer */}
      <SizeGuideDrawer
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
