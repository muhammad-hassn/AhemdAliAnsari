import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { PolicyPage } from "@/components/content/PolicyPage";

export async function generateMetadata() {
  const page = await getPageByKey("shipping");
  return buildMetadata({
    title: page?.meta_title ?? "Shipping & Delivery Policy | Ahmed Ali Ansari",
    description: page?.meta_description ?? "Domestic and international courier delivery policies by Ahmed Ali Ansari.",
    path: "/shipping",
  });
}

export default async function ShippingPage() {
  const page = await getPageByKey("shipping");

  return (
    <PolicyPage
      title={page?.title ?? "Shipping & Delivery Policy"}
      subtitle="Timelines, complimentary delivery thresholds, and insured express dispatch across Pakistan and internationally."
      lastUpdated="January 2026"
      contentHtml={
        page?.content ??
        "<p>Ahmed Ali Ansari packages every piece with protective covers. Complimentary domestic delivery is provided on orders above PKR 15,000 across Pakistan.</p>"
      }
    />
  );
}
