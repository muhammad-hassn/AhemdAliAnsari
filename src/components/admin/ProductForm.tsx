"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/admin/FormSection";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminSeoPanel } from "@/components/admin/AdminSeoPanel";
import { saveProductAction } from "@/server/actions/admin";
import { SIZE_ORDER } from "@/lib/constants";
import type { Product, Collection } from "@/types";

interface ProductFormProps {
  initialProduct?: Product | null;
  collections: Collection[];
}

export function ProductForm({
  initialProduct,
  collections,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialProduct?.name || "");
  const [slug, setSlug] = useState(initialProduct?.slug || "");
  const [collectionId, setCollectionId] = useState(initialProduct?.collection_id || "");
  const [pricePkr, setPricePkr] = useState(initialProduct?.price_pkr?.toString() || "");
  const [compareAtPricePkr, setCompareAtPricePkr] = useState(
    initialProduct?.compare_at_price_pkr?.toString() || "",
  );
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [fabric, setFabric] = useState(initialProduct?.details?.fabric || "Pure Raw Silk");
  const [trouser, setTrouser] = useState(initialProduct?.details?.trouser || "Silk Trouser");
  const [dupatta, setDupatta] = useState(initialProduct?.details?.dupatta || "Organza Dupatta");

  // Stock per universal size order
  const [stock, setStock] = useState<Record<string, number>>(() => {
    const initialStock: Record<string, number> = {};
    SIZE_ORDER.forEach((s) => {
      initialStock[s] = initialProduct?.stock?.[s] ?? 5;
    });
    return initialStock;
  });

  const [images, setImages] = useState<string[]>(
    initialProduct?.images?.length
      ? initialProduct.images
      : ["/images/products/placeholder.jpg"],
  );

  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured ?? false);

  // SEO State
  const [metaTitle, setMetaTitle] = useState(
    initialProduct?.name ? `${initialProduct.name} | Zahra Luxe` : "",
  );
  const [metaDescription, setMetaDescription] = useState(
    initialProduct?.description || "",
  );

  const generateSlugFromName = (val: string) => {
    setName(val);
    if (!initialProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  };

  const handleStockChange = (size: string, val: string) => {
    const num = parseInt(val, 10);
    setStock((prev) => ({
      ...prev,
      [size]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await saveProductAction({
      id: initialProduct?.id,
      name,
      slug,
      collection_id: collectionId || null,
      price_pkr: Number(pricePkr),
      compare_at_price_pkr: compareAtPricePkr ? Number(compareAtPricePkr) : null,
      description,
      fabric,
      trouser,
      dupatta,
      sizes: [...SIZE_ORDER],
      stock,
      images,
      is_active: isActive,
      is_featured: isFeatured,
      meta_title: metaTitle,
      meta_description: metaDescription,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Failed to save product");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}
      <FormSection
        title="Product Information"
        description="Core details of the couture garment."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Garment Title *
            </label>
            <Input
              required
              value={name}
              onChange={(e) => generateSlugFromName(e.target.value)}
              placeholder="e.g. Shehnai Zardozi Peshwas"
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
              placeholder="shehnai-zardozi-peshwas"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
            Collection
          </label>
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
          >
            <option value="">No Collection (Standalone)</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
            placeholder="Detailed description of craftsmanship, embroidery motifs, and silhouette..."
          />
        </div>
      </FormSection>

      {/* 2. Fabric & Ensemble Details */}
      <FormSection
        title="Ensemble Specifications"
        description="Fabric and component breakdown for customer transparency."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Fabric *
            </label>
            <Input
              required
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="e.g. Pure Tissue Silk"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Trouser / Bottom
            </label>
            <Input
              value={trouser}
              onChange={(e) => setTrouser(e.target.value)}
              placeholder="e.g. Brocade Churidar"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Dupatta / Veil
            </label>
            <Input
              value={dupatta}
              onChange={(e) => setDupatta(e.target.value)}
              placeholder="e.g. Net with Mukaish spray"
            />
          </div>
        </div>
      </FormSection>

      {/* 3. Pricing */}
      <FormSection
        title="Pricing (PKR)"
        description="Base currency pricing. Conversions are calculated automatically."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Retail Price (PKR) *
            </label>
            <Input
              required
              type="number"
              min="1"
              value={pricePkr}
              onChange={(e) => setPricePkr(e.target.value)}
              placeholder="125000"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Compare-at Price (PKR, Optional)
            </label>
            <Input
              type="number"
              min="1"
              value={compareAtPricePkr}
              onChange={(e) => setCompareAtPricePkr(e.target.value)}
              placeholder="145000"
            />
          </div>
        </div>
      </FormSection>

      {/* 4. Stock per Size */}
      <FormSection
        title="Inventory per Universal Size"
        description="Manage ready-to-ship inventory in canonical order (XXS to XXL)."
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {SIZE_ORDER.map((size) => (
            <div key={size} className="text-center p-2 border border-stone-200 bg-stone-50">
              <span className="block text-xs font-mono font-medium text-stone-800 mb-1">
                {size}
              </span>
              <Input
                type="number"
                min="0"
                value={stock[size] ?? 0}
                onChange={(e) => handleStockChange(size, e.target.value)}
                className="text-center h-8 font-mono text-xs px-1"
              />
            </div>
          ))}
        </div>
      </FormSection>

      {/* 5. Images */}
      <FormSection
        title="Imagery (2:3 Portrait)"
        description="Add multi-angle visual gallery. Drag or reorder cover image."
      >
        <ImageUploader images={images} onChange={setImages} />
      </FormSection>

      {/* 6. Visibility & Flags */}
      <FormSection
        title="Visibility"
        description="Publish status and homepage curation."
      >
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span className="text-xs font-sans text-stone-800 font-medium">
              Active in Storefront (Published)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <span className="text-xs font-sans text-stone-800 font-medium">
              Feature on Homepage Showcase
            </span>
          </label>
        </div>
      </FormSection>

      {/* 7. SEO Panel */}
      <AdminSeoPanel
        metaTitle={metaTitle}
        metaDescription={metaDescription}
        slug={`product/${slug}`}
        onMetaTitleChange={setMetaTitle}
        onMetaDescriptionChange={setMetaDescription}
      />

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-stone-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/products")}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="solid" size="default" disabled={loading}>
          {loading ? "Saving Product..." : initialProduct ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
