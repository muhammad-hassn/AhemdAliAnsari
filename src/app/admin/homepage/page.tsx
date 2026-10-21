import { getAdminHeroSlides } from "@/server/queries/admin";
import { HomepageManagerClient } from "@/components/admin/HomepageManagerClient";

export default async function AdminHomepagePage() {
  const slides = await getAdminHeroSlides();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Homepage Manager
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Manage hero banners, promotional carousels, and landing showcases.
        </p>
      </div>

      <HomepageManagerClient initialSlides={slides} />
    </div>
  );
}
