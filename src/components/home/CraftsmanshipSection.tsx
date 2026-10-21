import { CRAFTSMANSHIP_POINTS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Reveal } from "@/components/motion/Reveal";

export function CraftsmanshipSection() {
  return (
    <Section className="border-b border-hairline bg-[#F8F5EE]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Text Story & Craftsmanship Pillars */}
          <div className="lg:col-span-6 space-y-8">
            <Reveal>
              <div className="space-y-3">
                <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
                  Heritage & Metier
                </span>
                <Heading as="h2">The Art of Pakistani Embroidery</Heading>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="text-sm sm:text-base text-stone font-sans font-light leading-relaxed">
                In an era of fleeting fast fashion, Zahra Luxe preserves the slow, deliberate rhythm of artisanal needlecraft. From the antique zardozi wires spun on traditional wooden looms to hand-cut mirror embellishments, every garment is an enduring work of cultural pride.
              </p>
            </Reveal>

            <div className="space-y-6 pt-4 border-t border-hairline">
              {CRAFTSMANSHIP_POINTS.map((point, index) => (
                <Reveal key={point.heading} delay={0.15 + index * 0.1}>
                  <div className="flex gap-4 items-start">
                    <span className="font-heading text-xl text-gold font-light mt-0.5">
                      0{index + 1}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-sans text-xs uppercase tracking-[0.12em] font-medium text-ink">
                        {point.heading}
                      </h4>
                      <p className="text-xs text-stone font-sans leading-relaxed">
                        {point.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: Parallax Image */}
          <div className="lg:col-span-6">
            <Reveal delay={0.2}>
              <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden border border-hairline shadow-sm">
                <ParallaxImage
                  src="/images/craftsmanship.jpg"
                  alt="Master artisan hand-stitching intricate zardozi embroidery"
                  containerClassName="h-full w-full"
                  className="object-cover object-center"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
