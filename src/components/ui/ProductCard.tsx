"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye } from "lucide-react";
import type { Product } from "@/types";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
  priority?: boolean;
}

export function ProductCard({
  product,
  onQuickView,
  className,
  priority = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const inWishlistRaw = useWishlistStore((state) => state.isInWishlist(product.id));
  const isInWishlist = mounted && inWishlistRaw;
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const primaryImage = product.images[0] ?? "/images/placeholder-product.jpg";
  const secondaryImage = product.images[1] ?? primaryImage;
  const isSale = product.compare_at_price_pkr !== null;

  return (
    <div
      className={cn("group flex flex-col relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 2:3 Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#EFE9DF]">
        <Link href={`/product/${product.slug}`} className="relative block h-full w-full">
          {/* Primary Image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className={cn(
              "object-cover object-center transition-all duration-700 ease-out",
              isHovered && product.images.length > 1
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100",
            )}
          />

          {/* Secondary Image for cross-fade */}
          {product.images.length > 1 && (
            <Image
              src={secondaryImage}
              alt={`${product.name} - alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover object-center transition-all duration-700 ease-out absolute inset-0",
                isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100",
              )}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {!product.in_stock && (
            <Badge variant="muted">Sold Out</Badge>
          )}
          {isSale && product.in_stock && (
            <Badge variant="burgundy">Special</Badge>
          )}
          {product.is_featured && product.in_stock && !isSale && (
            <Badge variant="gold">Editorial</Badge>
          )}
        </div>

        {/* Action Buttons: Wishlist & Quick View */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
          <button
            type="button"
            suppressHydrationWarning
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "h-9 w-9 flex items-center justify-center transition-colors bg-ivory/80 backdrop-blur-xs border border-hairline hover:bg-ivory cursor-pointer",
              isInWishlist ? "text-burgundy" : "text-ink/80 hover:text-ink",
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4 stroke-[1.5]",
                isInWishlist && "fill-burgundy text-burgundy",
              )}
            />
          </button>

          {onQuickView && (
            <button
              type="button"
              suppressHydrationWarning
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              aria-label="Quick preview"
              className="h-9 w-9 flex items-center justify-center bg-ivory/80 backdrop-blur-xs border border-hairline text-ink/80 hover:text-ink hover:bg-ivory cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Eye className="h-4 w-4 stroke-[1.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Info Block */}
      <div className="pt-3 pb-1 flex flex-col gap-1">
        <Link href={`/product/${product.slug}`} className="group-hover:text-gold transition-colors">
          <h3 className="font-heading text-lg sm:text-xl font-light text-ink tracking-tight line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <Price
          amountPkr={product.price_pkr}
          compareAtAmountPkr={product.compare_at_price_pkr}
          className="text-sm"
        />
      </div>
    </div>
  );
}
