"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Product } from "@/types";
import { ProductCard } from "@/components/ui/ProductCard";
import { GridToggle, type GridColumns } from "./GridToggle";
import { QuickViewDialog } from "./QuickViewDialog";
import { EmptyState } from "./EmptyState";
import { SORT_OPTIONS } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  total: number;
}

export function ProductGrid({ products, total }: ProductGridProps) {
  const [columns, setColumns] = useState<GridColumns>(3);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "created_at:desc";

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", newSort);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  }[columns];

  return (
    <div className="flex-1 flex flex-col">
      {/* Grid Toolbar: Item count, Sort, and Grid Columns */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-hairline gap-4 flex-wrap">
        <span className="text-xs font-sans uppercase tracking-[0.12em] text-stone">
          Showing <span className="text-ink font-medium">{products.length}</span> of{" "}
          <span className="text-ink font-medium">{total}</span> Ensembles
        </span>

        <div className="flex items-center gap-4">
          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-sans uppercase tracking-[0.1em] text-stone">
              Sort:
            </span>
            <Select value={currentSort} onValueChange={handleSortChange}>
              <SelectTrigger className="h-9 w-44 text-xs font-sans">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent align="end">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid Columns Toggle (Desktop) */}
          <GridToggle columns={columns} onChange={setColumns} />
        </div>
      </div>

      {/* Grid of Product Cards or Empty State */}
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={cn("grid gap-4 sm:gap-6 lg:gap-8", gridColsClass)}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
