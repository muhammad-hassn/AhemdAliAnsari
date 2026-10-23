import { getAdminHeroSlides } from "@/server/queries/admin";
import { getAdminPromotionalPopup } from "@/server/queries/settings";
import { HomepageManagerClient } from "@/components/admin/HomepageManagerClient";
import { PromotionalPopupManager } from "@/components/admin/PromotionalPopupManager";

export default async function AdminHomepagePage() {
  const [slides, popup] = await Promise.all([
    getAdminHeroSlides(),
    getAdminPromotionalPopup(),
  ]);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Homepage & Offer Manager
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Manage responsive hero banners, carousel images, and promotional offer popups for Ahmed Ali Ansari.
        </p>
      </div>

      {/* 1. Hero Carousel Section */}
      <section className="space-y-4">
        <HomepageManagerClient initialSlides={slides} />
      </section>

      {/* 2. Homepage Promotional Popup & Offers Section */}
      <section className="space-y-4 pt-6 border-t border-stone-200">
        <PromotionalPopupManager initialPopup={popup} />
      </section>
    </div>
  );
}
