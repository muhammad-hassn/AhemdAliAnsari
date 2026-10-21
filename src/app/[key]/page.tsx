import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageByKey } from "@/server/queries/pages";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";

interface StaticPageProps {
  params: Promise<{ key: string }>;
}

const ALLOWED_PAGES = ["about", "privacy", "refund", "terms", "shipping"];

export async function generateMetadata({
  params,
}: StaticPageProps): Promise<Metadata> {
  const { key } = await params;
  if (!ALLOWED_PAGES.includes(key)) {
    return { title: "Page Not Found | Zahra Luxe" };
  }
  const page = await getPageByKey(key);
  if (!page) {
    return { title: "Page Not Found | Zahra Luxe" };
  }
  return {
    title: page.meta_title ?? `${page.title} | Zahra Luxe`,
    description: page.meta_description ?? undefined,
  };
}

export default async function StaticContentPage({ params }: StaticPageProps) {
  const { key } = await params;

  if (!ALLOWED_PAGES.includes(key)) {
    notFound();
  }

  const page = await getPageByKey(key);
  if (!page) {
    notFound();
  }

  return (
    <div className="w-full bg-ivory">
      {/* Editorial Header */}
      <div className="border-b border-hairline bg-[#FAF7F2] py-14 sm:py-20">
        <Container size="narrow">
          <div className="space-y-3">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
              The House of Zahra
            </span>
            <Heading as="h1" size="h1">
              {page.title}
            </Heading>
          </div>
        </Container>
      </div>

      {/* Content Section */}
      <Section spacing="default">
        <Container size="narrow">
          <div
            className="prose prose-stone max-w-none text-xs sm:text-sm text-stone font-sans leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </Container>
      </Section>
    </div>
  );
}
