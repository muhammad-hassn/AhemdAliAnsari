import Link from "next/link";
import { getAdminCollections } from "@/server/queries/admin";
import { CollectionListTable } from "@/components/admin/CollectionListTable";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default async function AdminCollectionsPage() {
  const collections = await getAdminCollections();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
            Couture Collections
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Organize garments by thematic releases and seasonal campaigns.
          </p>
        </div>
        <Button asChild variant="solid" size="sm">
          <Link href="/admin/collections/new">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Collection
          </Link>
        </Button>
      </div>

      <CollectionListTable collections={collections} />
    </div>
  );
}
