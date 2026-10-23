"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";

interface SingleImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: "hero-images" | "promotions" | "product-images";
  label?: string;
  helperText?: string;
  aspectRatioClass?: string;
}

export function SingleImageUploader({
  value,
  onChange,
  bucket = "hero-images",
  label = "Upload Image",
  helperText = "Supports JPG, PNG, WebP up to 15MB. Stored persistently in cloud storage.",
  aspectRatioClass = "aspect-[16/9]",
}: SingleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    // Client-side validations
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("File exceeds 15MB limit. Please choose a smaller image.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image.");
      }

      onChange(data.url);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Error uploading file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider">
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" /> Remove Image
          </button>
        )}
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className="relative group rounded border border-stone-200 overflow-hidden bg-stone-100">
          <div className={`relative w-full ${aspectRatioClass} overflow-hidden`}>
            <Image
              src={value}
              alt="Uploaded visual preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Overlay button to replace image */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-white text-stone-900 text-xs font-medium uppercase tracking-wider hover:bg-stone-100 transition-colors shadow cursor-pointer flex items-center gap-1.5"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Replace Image
              </button>
            </div>
          </div>
          <div className="p-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-600 font-mono truncate">
            <span className="truncate pr-2">{value}</span>
            <span className="shrink-0 text-emerald-600 font-sans font-medium">Ready</span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? "border-stone-900 bg-stone-50"
              : "border-stone-300 hover:border-stone-400 bg-stone-50/50"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-7 h-7 text-stone-600 animate-spin" />
              <p className="text-xs text-stone-700 font-medium">Uploading image to cloud storage...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-stone-200/80 flex items-center justify-center text-stone-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-stone-800">
                  <span className="underline underline-offset-2">Click to select from computer</span> or drag & drop
                </p>
                <p className="text-[11px] text-stone-500">{helperText}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
