"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportError } from "@/lib/report-error";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    reportError(error, "GlobalErrorBoundary");
  }, [error]);

  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-ivory">
      <Section className="w-full text-center">
        <Container className="max-w-md space-y-6">
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-red-800 font-medium block">
            Atelier Interruption
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-ink font-light">
            An Unexpected Disruption
          </h1>
          <p className="text-xs sm:text-sm text-stone font-sans leading-relaxed">
            Our atelier encountered a temporary transmission failure. Our technical guardians have been notified.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button variant="solid" onClick={() => reset()}>
              Attempt Recovery
            </Button>
            <Link href="/contact">
              <Button variant="outline">
                Contact Concierge
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </main>
  );
}
