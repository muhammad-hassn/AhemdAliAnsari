"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import type { Product } from "@/types";
import { Price } from "@/components/ui/Price";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { useCartStore } from "@/store/use-cart-store";
import { createClient } from "@/lib/supabase/client";

interface QuickViewDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewDialog({
  product,
  isOpen,
  onClose,
}: QuickViewDialogProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  if (!product) return null;

  const currentSize = selectedSize || product.sizes[0] || "M";

  const handleAddToCart = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(returnUrl)}`);
      return;
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: currentSize,
      price_pkr: product.price_pkr,
      image: product.images[0] ?? "/images/placeholder-product.jpg",
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-ivory">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-[2/3] w-full bg-[#EFE9DF]">
            <Image
              src={product.images[0] ?? "/images/placeholder-product.jpg"}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          {/* Product Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <Badge variant="gold" className="mb-1">
                  Quick View
                </Badge>
                <DialogTitle className="font-heading text-2xl font-light text-ink">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Quick preview of {product.name}
                </DialogDescription>
                <Price
                  amountPkr={product.price_pkr}
                  compareAtAmountPkr={product.compare_at_price_pkr}
                  className="text-base pt-1"
                />
              </div>

              <p className="text-xs text-stone font-sans leading-relaxed line-clamp-3">
                {product.description}
              </p>

              {/* Craftsmanship attributes */}
              <div className="border-t border-b border-hairline py-3 space-y-1.5 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-stone">Fabric:</span>
                  <span className="text-ink font-medium">{product.details.fabric}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Trouser:</span>
                  <span className="text-ink font-medium">{product.details.trouser}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone">Dupatta:</span>
                  <span className="text-ink font-medium">{product.details.dupatta}</span>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <span className="text-xs font-sans uppercase tracking-[0.12em] text-stone">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const sizeStock = product.stock ? product.stock[size] : undefined;
                    const isOutOfStock = sizeStock !== undefined && sizeStock <= 0;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => setSelectedSize(size)}
                        className={`h-9 px-3 text-xs font-sans font-medium uppercase tracking-[0.1em] border transition-colors cursor-pointer ${
                          currentSize === size
                            ? "border-ink bg-ink text-ivory"
                            : !isOutOfStock
                              ? "border-hairline text-ink hover:border-ink"
                              : "border-hairline/40 text-stone/40 bg-hairline/10 cursor-not-allowed line-through"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-2 border-t border-hairline mt-6">
              <Button
                variant="solid"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full justify-center"
              >
                {isAdded ? (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Added to Bag
                  </span>
                ) : product.in_stock ? (
                  "Add to Shopping Bag"
                ) : (
                  "Sold Out"
                )}
              </Button>

              <Link
                href={`/product/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 text-xs font-sans uppercase tracking-[0.12em] text-stone hover:text-ink transition-colors py-2"
              >
                <span>View Full Ensemble Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
