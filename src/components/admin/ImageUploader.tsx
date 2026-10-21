"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon } from "lucide-react";

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
  const [newUrl, setNewUrl] = useState("");

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    if (images.length >= maxImages) return;
    onChange([...images, newUrl.trim()]);
    setNewUrl("");
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
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
      {/* Add New Image Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Enter image URL (e.g. /images/products/rose-1.jpg or Supabase URL)"
            className="pl-9 h-9 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          disabled={!newUrl.trim() || images.length >= maxImages}
          className="h-9"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Image
        </Button>
      </div>

      {/* Grid of uploaded images */}
      {images.length === 0 ? (
        <div className="p-8 border border-dashed border-stone-200 text-center text-xs text-stone-500 font-sans">
          No images added yet. Add image URLs above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="group relative border border-stone-200 bg-stone-50 p-2 flex flex-col"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-stone-100 mb-2">
                <Image
                  src={url}
                  alt={`Product visual ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 bg-stone-900 text-white text-[10px] uppercase tracking-wider px-1.5 py-0.5">
                    Cover
                  </span>
                )}
              </div>
              <p className="text-[10px] text-stone-500 font-mono truncate mb-2">
                {url}
              </p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-200">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="h-6 w-6 p-0 text-stone-500"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="h-6 w-6 p-0 text-stone-500"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(idx)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
