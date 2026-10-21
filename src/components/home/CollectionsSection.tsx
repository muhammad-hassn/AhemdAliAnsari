import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Collection } from "@/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";

interface CollectionsSectionProps {
  collections: Collection[];
}

export function CollectionsSection({ collections }: CollectionsSectionProps) {
  return (
    <Section className="border-b border-hairline">
      <Container>
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
            <div className="space-y-2">
              <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
                Curated Ateliers
              </span>
              <Heading as="h2">The Collections</Heading>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.12em] text-ink hover:text-gold transition-colors font-medium group"
            >
              <span>Explore All Ensembles</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <Reveal key={collection.id} delay={index * 0.15}>
              <Link
                href={`/shop?collection=${collection.slug}`}
                className="group flex flex-col relative"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#EFE9DF]">
                  <Image
                    src={collection.image_url}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end text-ivory">
                    <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-gold font-medium mb-1">
                      Edition 0{index + 1}
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-light tracking-tight text-ivory">
                      {collection.name}
                    </h3>
                    <p className="text-xs text-ivory/80 font-sans font-light mt-2 line-clamp-2 leading-relaxed">
                      {collection.description}
                    </p>
                    <div className="pt-4 flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.14em] text-ivory/90 group-hover:text-gold transition-colors">
                      <span>View Collection</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
