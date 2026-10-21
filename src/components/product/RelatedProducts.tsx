import type { Product } from "@/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/motion/Reveal";

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <Section className="border-t border-hairline bg-[#FAF7F2]">
      <Container>
        <Reveal>
          <div className="text-center mb-12 space-y-2">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
              Harmonious Complements
            </span>
            <Heading as="h2">You May Also Admire</Heading>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {products.map((product, idx) => (
            <Reveal key={product.id} delay={idx * 0.1}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
