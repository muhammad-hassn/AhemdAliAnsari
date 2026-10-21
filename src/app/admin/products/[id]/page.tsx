import { notFound } from "next/navigation";
import { getAdminProductById, getAdminCollections } from "@/server/queries/admin";
import { ProductForm } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, collections] = await Promise.all([
    getAdminProductById(id),
    getAdminCollections(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Edit {product.name}
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Update specifications, pricing, imagery, and inventory levels.
        </p>
      </div>

      <ProductForm initialProduct={product} collections={collections} />
    </div>
  );
}
