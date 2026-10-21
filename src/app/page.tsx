import { getHeroSlides } from "@/server/queries/hero";
import { getCollections } from "@/server/queries/collections";
import { getFeaturedProducts } from "@/server/queries/products";
import { getActiveTestimonials } from "@/server/queries/testimonials";

import { Hero } from "@/components/home/Hero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { FeaturedProductsSection } from "@/components/home/FeaturedProductsSection";
import { CraftsmanshipSection } from "@/components/home/CraftsmanshipSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { InstagramStrip } from "@/components/home/InstagramStrip";

export default async function HomePage() {
  const [slides, collections, products, testimonials] = await Promise.all([
    getHeroSlides(),
    getCollections(),
    getFeaturedProducts(),
    getActiveTestimonials(),
  ]);

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero */}
      <Hero slides={slides} />

      {/* 2. Trust Marquee */}
      <TrustMarquee />

      {/* 3. Collections */}
      <CollectionsSection collections={collections} />

      {/* 4. Featured Products */}
      <FeaturedProductsSection
        products={products}
        collections={collections}
      />

      {/* 5. Craftsmanship */}
      <CraftsmanshipSection />

      {/* 6. Why Us */}
      <WhyUsSection />

      {/* 7. Testimonials */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 8. Instagram Strip */}
      <InstagramStrip />
    </div>
  );
}
