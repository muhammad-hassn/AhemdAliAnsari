import Image from "next/image";
import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { SafeHtml } from "@/components/ui/SafeHtml";

export async function generateMetadata() {
  const page = await getPageByKey("about");
  return buildMetadata({
    title: page?.meta_title ?? "About The House",
    description: page?.meta_description ?? "Artisanal embroidery, heritage silks, and Pakistani couture.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const page = await getPageByKey("about");

  return (
    <main className="min-h-screen bg-ivory">
      {/* Editorial Hero */}
      <section className="relative w-full h-[65vh] min-h-[440px] flex items-center justify-center overflow-hidden bg-ink text-ivory">
        <Image
          src={page?.hero_image_url ?? "/images/craftsmanship.jpg"}
          alt="Zahra Luxe Handcrafting Atelier"
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.2em] text-gold font-sans">
            Heritage & Craftsmanship
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-ivory">
            {page?.title ?? "The House of Zahra Luxe"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-light/80 font-sans tracking-wide uppercase">
            Preserving South Asian Haute Couture lineage
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <Section className="py-16 sm:py-24">
        <Container className="max-w-4xl space-y-12">
          {page?.content && (
            <div className="bg-cream border border-stone-light/60 p-8 sm:p-14 shadow-xs">
              <SafeHtml
                html={page.content}
                className="prose-headings:font-serif prose-headings:text-ink prose-p:font-sans prose-p:text-stone prose-p:leading-relaxed"
              />
            </div>
          )}

          {/* Artisan Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-stone-light/60">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">
                01. Lineage Needlework
              </span>
              <h3 className="font-serif text-xl text-ink font-normal">Authentic Zardozi</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                Passed down across generations, our zardozi and dabka artisans sculpt gold metallic bullion wires by hand onto woven silk organza.
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">
                02. Pure Weaves
              </span>
              <h3 className="font-serif text-xl text-ink font-normal">Uncompromised Textiles</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                We craft only upon authentic 80g pure raw silks, gossamer chiffon, hand-spun lawn, and hand-loomed jamawar fabrics.
              </p>
            </div>
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">
                03. Bespoke Silhouette
              </span>
              <h3 className="font-serif text-xl text-ink font-normal">Individual Tailoring</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                Every piece is tailored to your exact measurements, ensuring a couture drape that flatters effortlessly.
              </p>
            </div>
          </div>

          {/* Parallax Artisan Image Strip */}
          <div className="pt-8">
            <ParallaxImage
              src="/images/craftsmanship.jpg"
              alt="Artisans at work in our atelier"
              className="aspect-[21/9] relative"
              speed={0.15}
            />
          </div>
        </Container>
      </Section>
    </main>
  );
}
