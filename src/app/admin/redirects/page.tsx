import { getAdminRedirects } from "@/server/queries/admin";
import { RedirectsClient } from "@/components/admin/RedirectsClient";

export default async function AdminRedirectsPage() {
  const redirects = await getAdminRedirects();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Redirects Manager
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Configure 301 and 302 redirects served at the middleware layer.
        </p>
      </div>

      <RedirectsClient redirects={redirects} />
    </div>
  );
}
