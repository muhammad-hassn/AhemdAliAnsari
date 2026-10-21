import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { PolicyPage } from "@/components/content/PolicyPage";

export async function generateMetadata() {
  const page = await getPageByKey("privacy");
  return buildMetadata({
    title: page?.meta_title ?? "Privacy Policy",
    description: page?.meta_description ?? "Zahra Luxe privacy and patron protection policy.",
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const page = await getPageByKey("privacy");

  return (
    <PolicyPage
      title={page?.title ?? "Privacy Policy"}
      subtitle="How Zahra Luxe safeguards your personal information and bespoke ordering records."
      lastUpdated="January 2026"
      contentHtml={
        page?.content ??
        "<p>Your privacy is of utmost importance to our House. All information collected during inquiry or acquisition is kept strictly confidential.</p>"
      }
    />
  );
}
