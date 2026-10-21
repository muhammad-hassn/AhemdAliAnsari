import { notFound } from "next/navigation";
import { getAdminCollectionById } from "@/server/queries/admin";
import { CollectionForm } from "@/components/admin/CollectionForm";

interface EditCollectionPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCollectionPage({
  params,
}: EditCollectionPageProps) {
  const { id } = await params;
  const collection = await getAdminCollectionById(id);

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          Edit {collection.name}
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Update editorial narrative, imagery, and SEO metadata.
        </p>
      </div>

      <CollectionForm initialCollection={collection} />
    </div>
  );
}
