import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { TrackingView } from "@/components/order/TrackingView";

export const metadata = buildMetadata({
  title: "Track Order",
  description: "Track your Ali Ahmed Ansari order status, atelier tailoring, and courier tracking number.",
  path: "/track",
  noindex: true,
});

export default function TrackPage() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-ivory pt-8 pb-16">
      <Section className="w-full">
        <Container>
          <TrackingView />
        </Container>
      </Section>
    </main>
  );
}
