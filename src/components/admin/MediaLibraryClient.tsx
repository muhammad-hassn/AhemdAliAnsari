"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Copy, Check, Trash2, Upload } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  alt: string;
  size?: string;
  created_at: string;
}

interface MediaLibraryClientProps {
  initialAssets: MediaAsset[];
}

export function MediaLibraryClient({ initialAssets }: MediaLibraryClientProps) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetAlt, setNewAssetAlt] = useState("");
  const [newAssetName, setNewAssetName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.alt.toLowerCase().includes(search.toLowerCase()) ||
      a.url.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetUrl.trim() || !newAssetAlt.trim()) {
      setError("Both Image URL and descriptive Alt Text are strictly required.");
      return;
    }

    const created: MediaAsset = {
      id: "media-" + Date.now(),
      name: newAssetName.trim() || newAssetUrl.split("/").pop() || "media-asset",
      url: newAssetUrl.trim(),
      alt: newAssetAlt.trim(),
      created_at: new Date().toISOString(),
    };

    setAssets((prev) => [created, ...prev]);
    setNewAssetUrl("");
    setNewAssetAlt("");
    setNewAssetName("");
    setUploadModalOpen(false);
    setError(null);
  };

  const handleDelete = () => {
    if (!deletingAsset) return;
    setAssets((prev) => prev.filter((a) => a.id !== deletingAsset.id));
    setDeletingAsset(null);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-stone-200 p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media by name or alt text..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
          />
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors"
        >
          <Upload className="w-3.5 h-3.5" />
          Add Media Asset
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 bg-white border border-stone-200">
            No media assets found.
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white border border-stone-200 overflow-hidden flex flex-col justify-between hover:border-stone-400 transition-colors"
            >
              <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                <Image
                  src={asset.url}
                  alt={asset.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              </div>

              <div className="p-2.5 space-y-1 flex-1">
                <p className="text-[11px] font-medium text-stone-900 truncate" title={asset.name}>
                  {asset.name}
                </p>
                <p className="text-[10px] text-stone-500 line-clamp-1 italic" title={asset.alt}>
                  Alt: &ldquo;{asset.alt}&rdquo;
                </p>
              </div>

              <div className="px-2.5 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(asset.url)}
                  className="inline-flex items-center gap-1 text-[10px] text-stone-600 hover:text-stone-900 font-mono"
                  title="Copy URL"
                >
                  {copiedUrl === asset.url ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setDeletingAsset(asset)}
                  className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                  title="Delete media"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Media Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 w-full max-w-md p-6 space-y-4">
            <h3 className="font-serif text-xl text-stone-900">Add Media Asset</h3>

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Asset Title / File Name
                </label>
                <input
                  type="text"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="e.g. Ivory Silk Peshwas Detail"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Public Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={newAssetUrl}
                  onChange={(e) => setNewAssetUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900 font-mono"
                  placeholder="https://... or /images/..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Required Alt Text (Accessibility & SEO) *
                </label>
                <input
                  type="text"
                  required
                  value={newAssetAlt}
                  onChange={(e) => setNewAssetAlt(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-200 bg-white focus:outline-none focus:border-stone-900"
                  placeholder="e.g. Detailed hand-embroidery on pure silk neckline"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Mandatory under luxury brand accessibility guidelines.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs uppercase tracking-wider hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation with Usage Warning */}
      <ConfirmDialog
        open={Boolean(deletingAsset)}
        onOpenChange={(open) => {
          if (!open) setDeletingAsset(null);
        }}
        title="Delete Media Asset"
        description={
          deletingAsset
            ? `Warning: If "${deletingAsset.name}" is linked to any active product, collection, or blog post, deleting it may cause broken images on the live storefront. Are you sure you want to proceed?`
            : ""
        }
        confirmLabel="Proceed & Delete"
        variant="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
