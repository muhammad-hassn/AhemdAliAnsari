import { MediaLibraryClient, type MediaAsset } from "@/components/admin/MediaLibraryClient";

const DEFAULT_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: "media-1",
    name: "Gul-e-Noor Peshwas Front",
    url: "/images/products/gul-e-noor-1.jpg",
    alt: "Handcrafted crimson velvet peshwas with gold zardozi embroidery",
    size: "1.4 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "media-2",
    name: "Gul-e-Noor Back & Dupatta",
    url: "/images/products/gul-e-noor-2.jpg",
    alt: "Organza tissue dupatta with kiran border and gotta patti work",
    size: "1.2 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "media-3",
    name: "Shehrbano Angrakha",
    url: "/images/products/shehrbano-1.jpg",
    alt: "Ivory organza angrakha paired with crushed silk lehenga",
    size: "1.6 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "media-4",
    name: "Noor-e-Jahan Velvet Kurta",
    url: "/images/products/noor-e-jahan-1.jpg",
    alt: "Emerald green velvet kurta with antique tilla embroidery",
    size: "1.1 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "media-5",
    name: "Atelier Bridal Hero Banner",
    url: "/images/hero-1.jpg",
    alt: "Zahra Luxe Couture Bridal Campaign featuring royal embroidered silhouettes",
    size: "2.3 MB",
    created_at: new Date().toISOString(),
  },
  {
    id: "media-6",
    name: "Festive Velvet Campaign",
    url: "/images/hero-2.jpg",
    alt: "Model wearing regal plum velvet formal wear with hand embellishments",
    size: "2.1 MB",
    created_at: new Date().toISOString(),
  },
];

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Media Library
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Folder-less media repository with mandatory alt-text auditing and usage safety checks.
        </p>
      </div>

      <MediaLibraryClient initialAssets={DEFAULT_MEDIA_ASSETS} />
    </div>
  );
}
