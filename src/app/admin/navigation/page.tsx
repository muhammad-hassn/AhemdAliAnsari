import { getAdminNavigationItems } from "@/server/queries/admin";
import { NavigationManagerClient } from "@/components/admin/NavigationManagerClient";

export default async function AdminNavigationPage() {
  const items = await getAdminNavigationItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Navigation Manager
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Configure storefront header menus, mobile drawer items, and footer navigation links.
        </p>
      </div>

      <NavigationManagerClient initialItems={items} />
    </div>
  );
}
