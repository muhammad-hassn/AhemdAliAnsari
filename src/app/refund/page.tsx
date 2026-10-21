import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { PolicyPage } from "@/components/content/PolicyPage";

export async function generateMetadata() {
  const page = await getPageByKey("refund");
  return buildMetadata({
    title: page?.meta_title ?? "Refund & Exchange Policy",
    description: page?.meta_description ?? "Bespoke couture cancellation, fitting adjustments, and return policies.",
    path: "/refund",
  });
}

export default async function RefundPage() {
  const page = await getPageByKey("refund");

  return (
    <PolicyPage
      title={page?.title ?? "Refund & Exchange Policy"}
      subtitle="Guidelines on bespoke made-to-order couture, alterations, and salon exchanges."
      lastUpdated="January 2026"
      contentHtml={
        page?.content ??
        "<p>Because each garment is individually cut and embroidered by master artisans, bespoke orders cannot be cancelled once production commences.</p>"
      }
    />
  );
}
