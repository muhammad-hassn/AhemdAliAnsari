import { getAdminCollections } from "@/server/queries/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const collections = await getAdminCollections();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Add New Garment
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Create a new embroidered luxury formal piece with multi-size stock.
        </p>
      </div>

      <ProductForm collections={collections} />
    </div>
  );
}
