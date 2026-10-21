"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import type { Collection } from "@/types";
import { SIZE_ORDER } from "@/lib/constants";
import { Input } from "@/components/ui/Input";

interface ShopFiltersProps {
  collections: Collection[];
  className?: string;
}

export function ShopFilters({ collections, className }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCollection = searchParams.get("collection") ?? "";
  const currentSize = searchParams.get("size") ?? "";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentOnSale = searchParams.get("onSale") === "true";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset page to 1 whenever a filter changes
    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters =
    Boolean(currentCollection) ||
    Boolean(currentSize) ||
    currentInStock ||
    currentOnSale ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  return (
    <aside className={className}>
      <div className="flex items-center justify-between pb-4 border-b border-hairline">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-ink" />
          <h3 className="font-sans text-xs uppercase tracking-[0.14em] font-medium text-ink">
            Filter Ensembles
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-[11px] font-sans uppercase tracking-[0.1em] text-stone hover:text-burgundy transition-colors flex items-center gap-1 cursor-pointer"
          >
            <X className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="py-6 space-y-6">
        {/* Collections */}
        <div className="space-y-3">
          <h4 className="font-sans text-xs uppercase tracking-[0.12em] font-medium text-ink">
            Collection
          </h4>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => updateParam("collection", null)}
              className={`text-left text-xs font-sans transition-colors cursor-pointer ${
                !currentCollection
                  ? "text-ink font-medium"
                  : "text-stone hover:text-ink"
              }`}
            >
              All Collections
            </button>
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => updateParam("collection", col.slug)}
                className={`text-left text-xs font-sans transition-colors cursor-pointer ${
                  currentCollection === col.slug
                    ? "text-ink font-medium"
                    : "text-stone hover:text-ink"
                }`}
              >
                {col.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3 pt-4 border-t border-hairline">
          <h4 className="font-sans text-xs uppercase tracking-[0.12em] font-medium text-ink">
            Size
          </h4>
          <div className="grid grid-cols-4 gap-1.5">
            {SIZE_ORDER.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() =>
                  updateParam("size", currentSize === size ? null : size)
                }
                className={`h-8 flex items-center justify-center text-[11px] font-sans uppercase border transition-colors cursor-pointer ${
                  currentSize === size
                    ? "border-ink bg-ink text-ivory font-medium"
                    : "border-hairline bg-transparent text-ink hover:border-ink"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Availability & Offers */}
        <div className="space-y-3 pt-4 border-t border-hairline">
          <h4 className="font-sans text-xs uppercase tracking-[0.12em] font-medium text-ink">
            Preferences
          </h4>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2.5 text-xs font-sans text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) =>
                  updateParam("inStock", e.target.checked ? "true" : null)
                }
                className="h-4 w-4 rounded-none accent-ink border-hairline cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-sans text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={currentOnSale}
                onChange={(e) =>
                  updateParam("onSale", e.target.checked ? "true" : null)
                }
                className="h-4 w-4 rounded-none accent-ink border-hairline cursor-pointer"
              />
              <span>Special Offerings</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3 pt-4 border-t border-hairline">
          <h4 className="font-sans text-xs uppercase tracking-[0.12em] font-medium text-ink">
            Price Range (PKR)
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                defaultValue={minPrice}
                onBlur={(e) => updateParam("minPrice", e.target.value || null)}
                className="h-9 px-2.5 text-xs"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                defaultValue={maxPrice}
                onBlur={(e) => updateParam("maxPrice", e.target.value || null)}
                className="h-9 px-2.5 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="text-[11px] font-sans text-gold uppercase tracking-[0.1em] pt-2">
          Refreshing results...
        </div>
      )}
    </aside>
  );
}
