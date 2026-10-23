import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
} from "@/server/queries/products";
import { getCollections } from "@/server/queries/collections";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ProductView } from "@/components/product/ProductView";
import { RelatedProducts } from "@/components/product/RelatedProducts";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Zahra Luxe",
    };
  }

  return {
    title: `${product.name} | Zahra Luxe`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | Zahra Luxe`,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, collections] = await Promise.all([
    getProductBySlug(slug),
    getCollections(),
  ]);

  if (!product) {
    notFound();
  }

  const collection =
    collections.find((c) => c.id === product.collection_id) ?? null;

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.collection_id,
    4,
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Zahra Luxe",
    },
    offers: {
      "@type": "Offer",
      url: `https://zahraluxe.com/product/${product.slug}`,
      priceCurrency: "PKR",
      price: product.price_pkr,
      availability: product.in_stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Zahra Luxe",
      },
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://zahraluxe.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: collection?.name || "Shop",
        item: collection ? `https://zahraluxe.com/collections/${collection.slug}` : "https://zahraluxe.com/shop",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `https://zahraluxe.com/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <div className="w-full bg-ivory">
        <Section spacing="tight">
          <Container>
            <ProductView product={product} collection={collection} />
          </Container>
        </Section>

        <RelatedProducts products={relatedProducts} />
      </div>
    </>
  );
}
