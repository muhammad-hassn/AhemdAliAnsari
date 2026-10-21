import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { PolicyPage } from "@/components/content/PolicyPage";

export async function generateMetadata() {
  const page = await getPageByKey("shipping");
  return buildMetadata({
    title: page?.meta_title ?? "Shipping & Delivery",
    description: page?.meta_description ?? "Domestic and international white-glove couture courier delivery policies.",
    path: "/shipping",
  });
}

export default async function ShippingPage() {
  const page = await getPageByKey("shipping");

  return (
    <PolicyPage
      title={page?.title ?? "Shipping & Delivery Policy"}
      subtitle="Timelines, customs clearance, and insured express dispatch across Pakistan and internationally."
      lastUpdated="January 2026"
      contentHtml={
        page?.content ??
        "<p>Zahra Luxe packages every couture piece in heirloom archival boxes with protective garment covers. Domestic courier is complimentary across Pakistan.</p>"
      }
    />
  );
}
