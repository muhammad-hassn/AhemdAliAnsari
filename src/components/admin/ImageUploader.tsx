"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
  Upload,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Plus,
  Star,
} from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 8,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);

    if (fileArray.length === 0) return;

    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setError(`Maximum limit of ${maxImages} images reached.`);
      return;
    }

    const filesToUpload = fileArray.slice(0, availableSlots);
    if (fileArray.length > availableSlots) {
      setError(
        `Only ${availableSlots} more image(s) could be added to stay within the limit of ${maxImages}.`,
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    const validFiles: File[] = [];

    for (const f of filesToUpload) {
      if (!validTypes.includes(f.type.toLowerCase())) {
        setError(`"${f.name}" is not a valid format. Please choose JPG, PNG, or WebP.`);
        return;
      }
      if (f.size > 15 * 1024 * 1024) {
        setError(`"${f.name}" exceeds 15MB limit. Please choose smaller images.`);
        return;
      }
      validFiles.push(f);
    }

    if (validFiles.length === 0) return;

    try {
      setIsUploading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${validFiles.length}: ${file.name}...`);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "product-images");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        newUrls.push(data.url);
      }

      onChange([...images, ...newUrls]);
      setError(null);
    } catch (err) {
      console.error("Multi-image upload error:", err);
      setError(err instanceof Error ? err.message : "Error uploading files.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input supporting mobile camera / photo roll and desktop explorer */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleInputChange}
        className="hidden"
        id="product-images-browser-input"
        disabled={isUploading || images.length >= maxImages}
      />

      {/* Upload Zone / Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isUploading && images.length < maxImages) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isUploading && images.length < maxImages) {
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed p-6 transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer select-none ${
          isDragging
            ? "border-stone-900 bg-stone-100"
            : images.length >= maxImages
            ? "border-stone-200 bg-stone-50 cursor-not-allowed opacity-60"
            : "border-stone-300 bg-stone-50/60 hover:bg-white hover:border-stone-600"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <Loader2 className="w-8 h-8 text-stone-900 animate-spin" />
            <p className="text-xs font-medium text-stone-800">{uploadProgress}</p>
            <p className="text-[11px] text-stone-500">
              Uploading directly to cloud storage...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-stone-900">
                {images.length >= maxImages
                  ? `Maximum ${maxImages} images reached`
                  : "Browse Images from Mobile or Laptop"}
              </p>
              <p className="text-xs text-stone-500 mt-1 max-w-sm">
                Tap or click to select one or multiple photos from your device storage or camera.
                JPG, PNG, WebP up to 15MB each.
              </p>
            </div>
            {images.length < maxImages && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 pointer-events-none text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Select Image Files ({images.length}/{maxImages})
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Gallery */}
      {images.length === 0 ? (
        <div className="p-4 border border-stone-200 bg-white text-center text-xs text-stone-500">
          No product visuals uploaded yet. Tap or browse images above to upload product photos.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600 px-0.5">
            <span className="font-medium">
              Uploaded Visuals ({images.length} of {maxImages})
            </span>
            <span className="text-[11px] text-stone-400">
              First image is the primary storefront cover
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="group relative border border-stone-200 bg-white p-2 flex flex-col shadow-xs hover:border-stone-400 transition-colors"
              >
                {/* Image Card */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-stone-100 mb-2">
                  <Image
                    src={url}
                    alt={`Product angle ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover"
                  />
                  {idx === 0 ? (
                    <span className="absolute top-2 left-2 bg-stone-900 text-white text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium shadow-sm">
                      Cover Image
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      title="Set as Primary Cover"
                      className="absolute top-2 left-2 bg-white/90 hover:bg-stone-900 hover:text-white text-stone-700 text-[10px] uppercase tracking-wider px-1.5 py-0.5 flex items-center gap-1 transition-colors backdrop-blur-xs cursor-pointer shadow-xs"
                    >
                      <Star className="w-2.5 h-2.5" />
                      Make Cover
                    </button>
                  )}
                </div>

                {/* Filename info */}
                <p className="text-[10px] text-stone-500 font-mono truncate mb-2">
                  {url.split("/").pop() || url}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="h-7 w-7 p-0 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                      title="Move Left / Earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="h-7 w-7 p-0 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                      title="Move Right / Later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(idx)}
                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Quick add card if space remains */}
            {images.length < maxImages && !isUploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[2/3] border-2 border-dashed border-stone-200 hover:border-stone-500 bg-stone-50 hover:bg-white flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-600 mb-2">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-stone-800">Add More</span>
                <span className="text-[10px] text-stone-400 mt-0.5">
                  {maxImages - images.length} remaining
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
