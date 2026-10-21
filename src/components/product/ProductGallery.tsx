"use client";

import { useState } from "react";
import Image from "next/image";
import { ZoomIn, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<{ x: number; y: number; isHovering: boolean }>({
    x: 50,
    y: 50,
    isHovering: false,
  });

  const activeImage = images[selectedIndex] ?? "/images/placeholder-product.jpg";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ x, y, isHovering: true });
  };

  const handleMouseLeave = () => {
    setZoomStyle((prev) => ({ ...prev, isHovering: false }));
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto shrink-0 pb-2 lg:pb-0 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                "relative aspect-[2/3] w-16 sm:w-20 shrink-0 border transition-all cursor-pointer bg-[#EFE9DF]",
                selectedIndex === idx
                  ? "border-ink ring-1 ring-ink"
                  : "border-hairline opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image container */}
      <div className="relative aspect-[2/3] w-full flex-1 bg-[#EFE9DF] overflow-hidden group cursor-crosshair">
        <div
          className="relative h-full w-full overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={activeImage}
            alt={productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-200"
            style={{
              transformOrigin: `${zoomStyle.x}% ${zoomStyle.y}%`,
              transform: zoomStyle.isHovering ? "scale(1.5)" : "scale(1)",
            }}
          />
        </div>

        {/* Lightbox Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Enlarge image"
          className="absolute bottom-4 right-4 h-10 w-10 flex items-center justify-center bg-ivory/80 backdrop-blur-xs border border-hairline text-ink hover:bg-ivory transition-colors cursor-pointer shadow-xs"
        >
          <ZoomIn className="h-4 w-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl p-2 bg-ink/95 border-none">
          <DialogTitle className="sr-only">{productName} Lightbox</DialogTitle>
          <DialogDescription className="sr-only">
            High resolution view of {productName}
          </DialogDescription>
          <div className="relative aspect-[2/3] w-full max-h-[85vh] mx-auto">
            <Image
              src={activeImage}
              alt={productName}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-ivory/80 hover:text-ivory p-2 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
