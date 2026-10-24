import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AuthForm } from "@/components/account/AuthForm";
import { Suspense } from "react";

export const metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to your Ali Ahmed Ansari account to view orders, saved addresses, and wishlist.",
  path: "/login",
  noindex: true,
});

export default function LoginPage() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-ivory">
      <Section className="w-full">
        <Container>
          <Suspense fallback={<div className="text-center text-xs text-stone">Loading...</div>}>
            <AuthForm mode="login" />
          </Suspense>
        </Container>
      </Section>
    </main>
  );
}
