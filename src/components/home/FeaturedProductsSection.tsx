"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product, Collection } from "@/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { QuickViewDialog } from "@/components/shop/QuickViewDialog";

interface FeaturedProductsSectionProps {
  products: Product[];
  collections: Collection[];
}

export function FeaturedProductsSection({
  products,
  collections,
}: FeaturedProductsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((p) => {
          const col = collections.find((c) => c.slug === activeTab);
          return col ? p.collection_id === col.id : true;
        });

  return (
    <Section className="border-b border-hairline">
      <Container>
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
            <div className="space-y-2">
              <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
                Handcrafted Formals
              </span>
              <Heading as="h2">Featured Ensembles</Heading>
            </div>

            {/* Collection Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-2 sm:pb-0 sm:border-none">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-xs font-sans uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                  activeTab === "all"
                    ? "bg-ink text-ivory font-medium"
                    : "text-stone hover:text-ink bg-transparent"
                }`}
              >
                All
              </button>
              {collections.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setActiveTab(col.slug)}
                  className={`px-4 py-2 text-xs font-sans uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                    activeTab === col.slug
                      ? "bg-ink text-ivory font-medium"
                      : "text-stone hover:text-ink bg-transparent"
                  }`}
                >
                  {col.name}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.slice(0, 8).map((product, idx) => (
            <Reveal key={product.id} delay={idx * 0.08}>
              <ProductCard
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            </Reveal>
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.16em] font-medium text-ink hover:text-gold transition-colors pb-1 border-b border-ink hover:border-gold"
          >
            <span>View Complete Collection</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        isOpen={quickViewProduct !== null}
        onClose={() => setQuickViewProduct(null)}
      />
    </Section>
  );
}
