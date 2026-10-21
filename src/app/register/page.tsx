import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AuthForm } from "@/components/account/AuthForm";
import { Suspense } from "react";

export const metadata = buildMetadata({
  title: "Create Account",
  description: "Create an account with Zahra Luxe to save addresses, track orders, and curate your wishlist.",
  path: "/register",
  noindex: true,
});

export default function RegisterPage() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-ivory">
      <Section className="w-full">
        <Container>
          <Suspense fallback={<div className="text-center text-xs text-stone">Loading...</div>}>
            <AuthForm mode="register" />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
}
