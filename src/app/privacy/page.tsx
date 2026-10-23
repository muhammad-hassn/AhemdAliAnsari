import { getPageByKey } from "@/server/queries/pages";
import { buildMetadata } from "@/lib/seo";
import { PolicyPage } from "@/components/content/PolicyPage";

export async function generateMetadata() {
  const page = await getPageByKey("privacy");
  return buildMetadata({
    title: page?.meta_title ?? "Privacy Policy | Ahmed Ali Ansari",
    description: page?.meta_description ?? "Ahmed Ali Ansari privacy and patron protection policy.",
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const page = await getPageByKey("privacy");

  return (
    <PolicyPage
      title={page?.title ?? "Privacy Policy"}
      subtitle="How Ahmed Ali Ansari safeguards your personal information and customer records."
      lastUpdated="January 2026"
      contentHtml={
        page?.content ??
        "<p>Your privacy is of utmost importance to Ahmed Ali Ansari. All information collected during inquiry or purchase is kept strictly confidential.</p>"
      }
    />
  );
}
