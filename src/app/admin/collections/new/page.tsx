import { CollectionForm } from "@/components/admin/CollectionForm";

export default function NewCollectionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-normal text-stone-900 tracking-wide">
          New Collection
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-0.5">
          Curate a new series of luxury formal ensembles.
        </p>
      </div>

      <CollectionForm />
    </div>
  );
}
