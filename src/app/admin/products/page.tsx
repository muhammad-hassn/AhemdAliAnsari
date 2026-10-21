import Link from "next/link";
import { getAdminProducts } from "@/server/queries/admin";
import { ProductListTable } from "@/components/admin/ProductListTable";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
            Garments & Inventory
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Manage couture pieces, stock across universal sizes, and sales status.
          </p>
        </div>
        <Button asChild variant="solid" size="sm">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Garment
          </Link>
        </Button>
      </div>

      <ProductListTable products={products} />
    </div>
  );
}
