import { WHY_US_PILLARS } from "@/lib/constants";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";

export function WhyUsSection() {
  return (
    <Section className="border-b border-hairline bg-ivory">
      <Container>
        <Reveal>
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
              The Zahra Promise
            </span>
            <Heading as="h2">Excellence in Every Thread</Heading>
          </div>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {WHY_US_PILLARS.map((pillar, index) => (
            <div
              key={pillar.label}
              className="p-8 border border-hairline bg-[#FAF7F2] flex flex-col justify-between h-full space-y-6 hover:border-gold/60 transition-colors"
            >
              <span className="font-heading text-3xl text-gold font-light">
                0{index + 1}
              </span>
              <div className="space-y-2">
                <h3 className="font-heading text-2xl font-light text-ink tracking-tight">
                  {pillar.label}
                </h3>
                <p className="text-xs text-stone font-sans leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
