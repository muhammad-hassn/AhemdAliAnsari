import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getCurrentUser, getUserAddresses } from "@/server/queries/account";
import { getShippingRates, getPaymentMethods } from "@/server/queries/orders";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = buildMetadata({
  title: "Checkout",
  description: "Securely finalize your order of Pakistani luxury Eastern formal wear.",
  path: "/checkout",
  noindex: true,
});

export default async function CheckoutPage() {
  const [user, addresses, shippingRates, paymentMethods] = await Promise.all([
    getCurrentUser(),
    getUserAddresses(),
    getShippingRates(),
    getPaymentMethods(),
  ]);

  return (
    <main className="min-h-screen bg-ivory pt-8 pb-20">
      <Section className="pt-4">
        <Container>
          <div className="mb-10 border-b border-stone-light/60 pb-6 text-center max-w-xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal">
              Bespoke Checkout
            </h1>
            <p className="text-xs uppercase tracking-widest text-stone mt-2">
              Complimentary White-Glove Shipping Across Pakistan • Worldwide Courier
            </p>
          </div>

          <CheckoutForm
            initialEmail={user?.email ?? ""}
            savedAddresses={addresses}
            shippingRates={shippingRates}
            paymentMethods={paymentMethods}
          />
        </Container>
      </Section>
    </main>
  );
}
