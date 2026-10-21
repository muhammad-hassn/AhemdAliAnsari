import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { PolicyPage } from "@/components/content/PolicyPage";

export async function generateMetadata() {
  const page = await getPageByKey("terms");
  return buildMetadata({
    title: page?.meta_title ?? "Terms of Service",
    description: page?.meta_description ?? "Terms governing orders, intellectual property, and atelier services.",
    path: "/terms",
  });
}

export default async function TermsPage() {
  const page = await getPageByKey("terms");

  return (
    <PolicyPage
      title={page?.title ?? "Terms of Service"}
      subtitle="Standard terms and conditions governing the acquisition of Zahra Luxe garments."
      lastUpdated="January 2026"
      contentHtml={
        page?.content ??
        "<p>By engaging with Zahra Luxe online or via our atelier concierges, you agree to these bespoke terms and conditions.</p>"
      }
    />
  );
}
