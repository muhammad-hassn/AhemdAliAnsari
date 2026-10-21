"use client";

import { Check } from "lucide-react";
import type { Product } from "@/types";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";

interface StickyMobileBarProps {
  product: Product;
  selectedSize: string;
  onAddToCart: () => void;
  isAdded: boolean;
}

export function StickyMobileBar({
  product,
  selectedSize,
  onAddToCart,
  isAdded,
}: StickyMobileBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-hairline p-4 shadow-lg flex items-center justify-between gap-4">
      <div className="flex flex-col min-w-0">
        <span className="font-heading text-sm text-ink truncate font-medium">
          {product.name}
        </span>
        <div className="flex items-center gap-2">
          <Price amountPkr={product.price_pkr} className="text-xs" />
          <span className="text-[10px] uppercase font-sans text-stone">
            Size: {selectedSize}
          </span>
        </div>
      </div>

      <Button
        variant="solid"
        size="sm"
        onClick={onAddToCart}
        disabled={!product.in_stock}
        className="shrink-0 h-10 px-5 text-xs font-sans tracking-[0.1em]"
      >
        {isAdded ? (
          <span className="flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Added
          </span>
        ) : product.in_stock ? (
          "Add to Bag"
        ) : (
          "Sold Out"
        )}
      </Button>
    </div>
  );
}
