"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/use-wishlist-store";
import { ProductCard } from "@/components/ui/ProductCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Button } from "@/components/ui/Button";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  return (
    <div className="w-full bg-ivory">
      {/* Header */}
      <div className="border-b border-hairline bg-[#FAF7F2] py-12 sm:py-16">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
                Saved Ensembles
              </span>
              <Heading as="h1" size="h1">
                Your Wishlist
              </Heading>
              <p className="text-xs text-stone font-sans">
                {items.length === 1
                  ? "1 cherished ensemble saved to your private curation."
                  : `${items.length} cherished ensembles saved to your private curation.`}
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearWishlist}
                className="text-xs font-sans uppercase tracking-[0.12em] text-stone hover:text-burgundy transition-colors self-start sm:self-auto cursor-pointer"
              >
                Clear Wishlist
              </button>
            )}
          </div>
        </Container>
      </div>

      {/* Grid or Empty State */}
      <Section spacing="default">
        <Container>
          {items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center justify-center border border-hairline bg-[#FAF7F2] p-8 sm:p-14">
              <div className="h-16 w-16 border border-hairline flex items-center justify-center text-stone mb-4">
                <Heart className="h-6 w-6 stroke-[1.2]" />
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-light text-ink mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-xs text-stone font-sans max-w-sm mb-8 leading-relaxed">
                As you explore our bridal and luxury formal collections, tap the heart icon on any piece to save it to your bespoke wishlist.
              </p>
              <Button variant="solid" size="default" asChild>
                <Link href="/shop">Explore Collections</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
