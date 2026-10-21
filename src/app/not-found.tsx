import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-ivory">
      <Section className="w-full text-center">
        <Container className="max-w-lg space-y-6">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-gold font-medium block">
            404 • Page Not Found
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-ink font-light">
            An Uncharted Creation
          </h1>
          <p className="text-xs sm:text-sm text-stone font-sans leading-relaxed">
            The atelier page or piece you are seeking does not exist or has been retired to our private couture archives.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/">
              <Button variant="solid" size="lg">
                Return Home
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" size="lg">
                Explore Current Collection
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
