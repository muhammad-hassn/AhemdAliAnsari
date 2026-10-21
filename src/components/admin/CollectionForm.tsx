"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/admin/FormSection";
import { AdminSeoPanel } from "@/components/admin/AdminSeoPanel";
import { saveCollectionAction } from "@/server/actions/admin";
import type { Collection } from "@/types";

interface CollectionFormProps {
  initialCollection?: Collection | null;
}

export function CollectionForm({ initialCollection }: CollectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initialCollection?.name || "");
  const [slug, setSlug] = useState(initialCollection?.slug || "");
  const [description, setDescription] = useState(initialCollection?.description || "");
  const [imageUrl, setImageUrl] = useState(initialCollection?.image_url || "/images/collections/placeholder.jpg");
  const [sortOrder, setSortOrder] = useState(initialCollection?.sort_order?.toString() || "0");

  const [metaTitle, setMetaTitle] = useState(
    initialCollection?.name ? `${initialCollection.name} Collection | Zahra Luxe` : "",
  );
  const [metaDescription, setMetaDescription] = useState(
    initialCollection?.description || "",
  );

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialCollection) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await saveCollectionAction({
      id: initialCollection?.id,
      name,
      slug,
      description,
      image_url: imageUrl,
      sort_order: parseInt(sortOrder, 10) || 0,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to save collection");
      return;
    }

    router.push("/admin/collections");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
          {error}
        </div>
      )}

      <FormSection
        title="Collection Details"
        description="Editorial series or seasonal release branding."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Collection Name *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Noor-e-Kashmir"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              URL Slug *
            </label>
            <Input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="noor-e-kashmir"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
            Description *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
            placeholder="Poetic editorial narrative introducing the collection motifs and heritage..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Cover Image URL (2:3 Portrait) *
            </label>
            <Input
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="/images/collections/noor.jpg"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Display Sort Order
            </label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </FormSection>

      <AdminSeoPanel
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        slug={`collections/${slug}`}
        onMetaTitleChange={setMetaTitle}
        onMetaDescriptionChange={setMetaDescription}
      />

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/collections")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="solid" size="default" disabled={loading}>
          {loading ? "Saving Collection..." : initialCollection ? "Update Collection" : "Create Collection"}
        </Button>
      </div>
    </form>
  );
}
