import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { PolicyPage } from "@/components/content/PolicyPage";

export async function generateMetadata() {
  const page = await getPageByKey("terms");
  return buildMetadata({
    title: page?.meta_title ?? "Terms and Conditions | Ahmed Ali Ansari",
    description: page?.meta_description ?? "Terms governing orders, intellectual property, and services at Ahmed Ali Ansari.",
    path: "/terms",
  });
}

export default async function TermsPage() {
  const page = await getPageByKey("terms");

  return (
    <PolicyPage
      title={page?.title ?? "Terms of Service"}
      subtitle="Standard terms and conditions governing the purchase of Ahmed Ali Ansari garments."
      lastUpdated="January 2026"
      contentHtml={
        page?.content ??
        "<p>By engaging with Ahmed Ali Ansari online or via our concierges, you agree to these terms and conditions.</p>"
      }
    />
  );
}
