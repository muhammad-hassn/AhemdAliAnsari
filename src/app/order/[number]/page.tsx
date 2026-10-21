import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { getOrderByNumberAndToken, getPaymentMethods } from "@/server/queries/orders";
import { getSiteSettings } from "@/server/queries/settings";
import { OrderDetailView } from "@/components/order/OrderDetailView";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Order Details",
  description: "View couture order confirmation, tailoring timeline, and delivery status.",
  noindex: true,
});

interface OrderPageProps {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { number } = await params;
  const { t: token } = await searchParams;

  const [order, paymentMethods, settings] = await Promise.all([
    getOrderByNumberAndToken(number, token),
    getPaymentMethods(),
    getSiteSettings(),
  ]);

  if (!order) {
    notFound();
  }

  const matchedPaymentMethod = paymentMethods.find(
    (pm) => pm.code === order.payment_method_id,
  );

  const whatsapp = settings.whatsapp_number || WHATSAPP_NUMBER;

  return (
    <main className="min-h-screen bg-ivory pt-8 pb-20">
      <Section className="pt-4">
        <Container>
          <OrderDetailView
            order={order}
            paymentMethod={matchedPaymentMethod}
            whatsappNumber={whatsapp}
            accessToken={token ?? order.access_token}
          />
        </Container>
      </Section>
    </main>
  );
}
