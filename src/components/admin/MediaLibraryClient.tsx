"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, Copy, Check, Trash2, Upload, Loader2, AlertCircle, Plus } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { SingleImageUploader } from "./SingleImageUploader";

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

const STORAGE_KEY = "ahmed_ali_ansari_media_library_v1";

export function MediaLibraryClient({ initialAssets }: MediaLibraryClientProps) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newAssetUrl, setNewAssetUrl] = useState("");
  const [newAssetAlt, setNewAssetAlt] = useState("");
  const [newAssetName, setNewAssetName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Direct batch upload state
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState("");
  const directInputRef = useRef<HTMLInputElement>(null);

  // Load any previously uploaded assets saved locally
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: MediaAsset[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge avoiding duplicates by id or url
          setAssets((prev) => {
            const existingUrls = new Set(prev.map((a) => a.url));
            const fresh = parsed.filter((a) => !existingUrls.has(a.url));
            return [...fresh, ...prev];
          });
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const persistAssets = (newAssets: MediaAsset[]) => {
    setAssets(newAssets);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
    } catch {
      // Ignore
    }
  };

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

  // Direct file batch upload from top bar button
  const handleDirectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsBatchUploading(true);

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const addedAssets: MediaAsset[] = [];

    /** Safely parse JSON — returns null for non-JSON responses */
    const safeJson = async (res: Response): Promise<Record<string, unknown> | null> => {
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return null;
      try { return await res.json(); } catch { return null; }
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!validTypes.includes(file.type.toLowerCase())) {
          throw new Error(`"${file.name}" is not a valid format. Only JPG, PNG, or WebP are supported.`);
        }
        // product-images bucket limit is 10 MB
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 10MB limit.`);
        }

        setBatchProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);

        // Step 1: Get a signed upload URL (JSON only — no binary passes through Next.js)
        const urlRes = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket: "product-images",
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        });

        const urlData = await safeJson(urlRes);
        if (!urlRes.ok || !urlData?.success) {
          throw new Error(
            (urlData?.error as string) ||
              `Server error ${urlRes.status}: could not start upload for ${file.name}`,
          );
        }

        // Step 2: PUT file directly to Supabase Storage
        const putRes = await fetch(urlData.signedUrl as string, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!putRes.ok) {
          const errText = await putRes.text().catch(() => "");
          throw new Error(errText || `Upload failed for ${file.name} (status ${putRes.status}).`);
        }

        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        addedAssets.push({
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: cleanName,
          url: urlData.publicUrl as string,
          alt: `${cleanName} - Ahmed Ali Ansari Couture`,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          created_at: new Date().toISOString(),
        });
      }

      persistAssets([...addedAssets, ...assets]);
      setError(null);
    } catch (err) {
      console.error("Media upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setIsBatchUploading(false);
      setBatchProgress("");
      if (directInputRef.current) {
        directInputRef.current.value = "";
      }
    }
  };

  // Add asset from modal (with custom title and alt)
  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetUrl.trim()) {
      setError("Please browse and upload an image file first.");
      return;
    }
    if (!newAssetAlt.trim()) {
      setError("Descriptive alt text is required for accessibility and SEO.");
      return;
    }

    const created: MediaAsset = {
      id: "media-" + Date.now(),
      name: newAssetName.trim() || newAssetUrl.split("/").pop() || "media-asset",
      url: newAssetUrl.trim(),
      alt: newAssetAlt.trim(),
      created_at: new Date().toISOString(),
    };

    persistAssets([created, ...assets]);
    setNewAssetUrl("");
    setNewAssetAlt("");
    setNewAssetName("");
    setUploadModalOpen(false);
    setError(null);
  };

  const handleDelete = () => {
    if (!deletingAsset) return;
    persistAssets(assets.filter((a) => a.id !== deletingAsset.id));
    setDeletingAsset(null);
  };

  return (
    <div className="space-y-6">
      {/* Hidden browser file input for fast 1-tap/1-click upload */}
      <input
        ref={directInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleDirectFiles}
        className="hidden"
        id="media-library-browser-input"
        disabled={isBatchUploading}
      />

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploading progress notification */}
      {isBatchUploading && (
        <div className="p-3 bg-stone-900 text-white text-xs flex items-center gap-3 shadow-md animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-stone-200" />
          <span>{batchProgress}</span>
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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Direct browser file upload button */}
          <button
            type="button"
            disabled={isBatchUploading}
            onClick={() => directInputRef.current?.click()}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isBatchUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload from Device
              </>
            )}
          </button>

          {/* Add with details button */}
          <button
            type="button"
            onClick={() => {
              setNewAssetUrl("");
              setNewAssetName("");
              setNewAssetAlt("");
              setError(null);
              setUploadModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-stone-300 text-stone-700 hover:text-stone-900 hover:border-stone-900 text-xs uppercase tracking-wider transition-colors cursor-pointer"
            title="Upload with custom Alt Text & Title"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">With Details</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAssets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-400 bg-white border border-stone-200">
            No media assets found. Tap &ldquo;Upload from Device&rdquo; above to browse images from your mobile or laptop.
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
                  className="p-1 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete media"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Media Modal with Browser File Uploader (ZERO URL typing) */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="font-serif text-xl text-stone-900">Upload Media Asset</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Select an image file from your computer or mobile storage.
              </p>
            </div>

            <form onSubmit={handleModalSave} className="space-y-4">
              {/* Browser File Upload Component */}
              <div>
                <SingleImageUploader
                  value={newAssetUrl}
                  onChange={(url) => {
                    setNewAssetUrl(url);
                    if (url && !newAssetName) {
                      const fileName = url.split("/").pop() || "image";
                      const clean = fileName
                        .replace(/\.[^/.]+$/, "")
                        .replace(/[-_]+/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      setNewAssetName(clean);
                    }
                    if (url && !newAssetAlt) {
                      setNewAssetAlt("Ahmed Ali Ansari luxury couture garment detail");
                    }
                  }}
                  bucket="product-images"
                  label="Select Image File *"
                  helperText="Tap or click to browse image from mobile camera, gallery, or laptop. JPG, PNG, WebP up to 15MB."
                  aspectRatioClass="aspect-[4/3] max-w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Asset Title
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
                  className="px-4 py-2 border border-stone-200 text-stone-700 text-xs uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newAssetUrl}
                  className="px-5 py-2 bg-stone-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-stone-800 disabled:opacity-40 cursor-pointer"
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
