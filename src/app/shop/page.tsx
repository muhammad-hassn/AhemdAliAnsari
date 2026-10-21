import { Suspense } from "react";
import type { Metadata } from "next";
import { getCollections } from "@/server/queries/collections";
import { getProducts } from "@/server/queries/products";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Pagination } from "@/components/shop/Pagination";
import { SkeletonGrid } from "@/components/shop/SkeletonGrid";

export const metadata: Metadata = {
  title: "Shop All Ensembles | Zahra Luxe",
  description:
    "Explore our complete couture catalog of handcrafted Pakistani bridal wear, formal peshwas, velvet anarkalis, and festive pret.",
};

interface ShopPageProps {
  searchParams: Promise<{
    collection?: string;
    minPrice?: string;
    maxPrice?: string;
    size?: string;
    inStock?: string;
    onSale?: string;
    sort?: string;
    page?: string;
    perPage?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;

  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const perPage = resolvedParams.perPage
    ? parseInt(resolvedParams.perPage, 10)
    : 12;
  const minPrice = resolvedParams.minPrice
    ? parseFloat(resolvedParams.minPrice)
    : undefined;
  const maxPrice = resolvedParams.maxPrice
    ? parseFloat(resolvedParams.maxPrice)
    : undefined;

  const [collections, { products, total, totalPages }] = await Promise.all([
    getCollections(),
    getProducts({
      collection: resolvedParams.collection,
      minPrice,
      maxPrice,
      size: resolvedParams.size,
      inStock: resolvedParams.inStock === "true",
      onSale: resolvedParams.onSale === "true",
      sort: resolvedParams.sort,
      page,
      perPage,
    }),
  ]);

  const activeCollection = collections.find(
    (c) => c.slug === resolvedParams.collection,
  );

  return (
    <div className="w-full bg-ivory">
      {/* Header Banner */}
      <div className="border-b border-hairline bg-[#FAF7F2] py-12 sm:py-16">
        <Container>
          <div className="max-w-2xl space-y-3">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
              The Atelier Catalog
            </span>
            <Heading as="h1" size="h1">
              {activeCollection ? activeCollection.name : "All Creations"}
            </Heading>
            <p className="text-xs sm:text-sm text-stone font-sans leading-relaxed">
              {activeCollection
                ? activeCollection.description
                : "Handcrafted heirloom bridal, luxury formals, and festive pret cut from the world’s finest silks, tissue, and velvets."}
            </p>
          </div>
        </Container>
      </div>

      {/* Main Content: Sidebar Filters + Products Grid */}
      <Section spacing="tight">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Desktop Filters (3 columns) */}
            <div className="lg:col-span-3">
              <Suspense fallback={<div className="h-64 bg-hairline/20 animate-pulse" />}>
                <ShopFilters collections={collections} />
              </Suspense>
            </div>

            {/* Products Grid (9 columns) */}
            <div className="lg:col-span-9">
              <Suspense fallback={<SkeletonGrid count={8} />}>
                <ProductGrid products={products} total={total} />
              </Suspense>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                searchParams={resolvedParams}
              />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
