import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SafeHtml } from "@/components/ui/SafeHtml";

interface PolicyPageProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  contentHtml: string;
}

export function PolicyPage({
  title,
  subtitle,
  lastUpdated,
  contentHtml,
}: PolicyPageProps) {
  return (
    <main className="min-h-screen bg-ivory pt-8 pb-20">
      <Section className="pt-4">
        <Container className="max-w-4xl">
          <div className="border-b border-stone-light/60 pb-8 mb-10 text-center sm:text-left">
            <span className="text-xs uppercase tracking-widest text-stone block mb-2">
              Legal & Atelier Policy
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ink font-normal">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone mt-2 font-sans max-w-xl">
                {subtitle}
              </p>
            )}
            {lastUpdated && (
              <p className="text-[11px] text-stone/80 mt-4 uppercase tracking-wider">
                Last Revised: {lastUpdated}
              </p>
            )}
          </div>

          <div className="bg-cream border border-stone-light/60 p-6 sm:p-12 shadow-xs">
            <SafeHtml html={contentHtml} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
