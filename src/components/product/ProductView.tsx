"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Check } from "lucide-react";
import type { Product, Collection } from "@/types";
import { Price } from "@/components/ui/Price";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductGallery } from "./ProductGallery";
import { SizeSelector } from "./SizeSelector";
import { ProductAccordion } from "./ProductAccordion";
import { StickyMobileBar } from "./StickyMobileBar";
import { useCartStore } from "@/store/use-cart-store";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ProductViewProps {
  product: Product;
  collection: Collection | null;
}

export function ProductView({ product, collection }: ProductViewProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes[0] ?? "M",
  );
  const [isAdded, setIsAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const isInWishlist = useWishlistStore((state) =>
    state.isInWishlist(product.id),
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

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
      size: selectedSize,
      price_pkr: product.price_pkr,
      image: product.images[0] ?? "/images/placeholder-product.jpg",
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Left: Image Gallery (7 cols) */}
        <div className="lg:col-span-7">
          <ProductGallery
            images={product.images}
            productName={product.name}
          />
        </div>

        {/* Right: Buy Box & Product Narrative (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
          {/* Breadcrumbs & Collection */}
          <div className="flex items-center gap-2 text-xs font-sans text-stone uppercase tracking-[0.12em]">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-ink transition-colors">
              Shop
            </Link>
            {collection && (
              <>
                <span>/</span>
                <Link
                  href={`/shop?collection=${collection.slug}`}
                  className="hover:text-ink transition-colors"
                >
                  {collection.name}
                </Link>
              </>
            )}
          </div>

          {/* Title & Price */}
          <div className="space-y-3 pb-2 border-b border-hairline">
            <div className="flex items-center gap-2">
              {!product.in_stock && <Badge variant="muted">Sold Out</Badge>}
              {product.compare_at_price_pkr && product.in_stock && (
                <Badge variant="burgundy">Special Offering</Badge>
              )}
              {product.is_featured && product.in_stock && (
                <Badge variant="gold">Editorial Selection</Badge>
              )}
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-light text-ink tracking-tight leading-[1.05]">
              {product.name}
            </h1>

            <Price
              amountPkr={product.price_pkr}
              compareAtAmountPkr={product.compare_at_price_pkr}
              className="text-xl sm:text-2xl pt-1"
            />
          </div>

          {/* Size Selector */}
          <SizeSelector
            availableSizes={product.sizes}
            selectedSize={selectedSize}
            onSelectSize={setSelectedSize}
            stock={product.stock}
          />

          {/* Add to Bag and Wishlist Action Bar */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="solid"
              size="lg"
              disabled={!product.in_stock}
              onClick={handleAddToCart}
              className="flex-1 justify-center h-14 text-xs font-medium tracking-[0.14em]"
            >
              {isAdded ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Added to Shopping Bag
                </span>
              ) : product.in_stock ? (
                "Add to Shopping Bag"
              ) : (
                "Sold Out"
              )}
            </Button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label={
                isInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
              className={cn(
                "h-14 w-14 flex items-center justify-center border border-hairline transition-colors cursor-pointer",
                isInWishlist
                  ? "bg-burgundy text-ivory border-burgundy"
                  : "bg-transparent text-ink hover:border-ink hover:text-gold",
              )}
            >
              <Heart
                className={cn(
                  "h-5 w-5 stroke-[1.5]",
                  isInWishlist && "fill-ivory",
                )}
              />
            </button>
          </div>

          {/* Product Accordion (Overview, Specs, Shipping, Care) */}
          <ProductAccordion
            description={product.description}
            details={product.details}
          />
        </div>
      </div>

      {/* Sticky Mobile Add to Bag Bar */}
      <StickyMobileBar
        product={product}
        selectedSize={selectedSize}
        onAddToCart={handleAddToCart}
        isAdded={isAdded}
      />
    </>
  );
}
