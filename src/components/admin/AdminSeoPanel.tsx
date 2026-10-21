"use client";

import React from "react";
import { Input } from "@/components/ui/Input";
import { FormSection } from "@/components/admin/FormSection";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface AdminSeoPanelProps {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  ogImage?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  onMetaTitleChange: (val: string) => void;
  onMetaDescriptionChange: (val: string) => void;
  onOgImageChange?: (val: string) => void;
  onCanonicalUrlChange?: (val: string) => void;
  onNoindexChange?: (val: boolean) => void;
  baseUrl?: string;
}

export function AdminSeoPanel({
  metaTitle,
  metaDescription,
  slug,
  ogImage,
  canonicalUrl,
  noindex = false,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onOgImageChange,
  onCanonicalUrlChange,
  onNoindexChange,
  baseUrl = "https://zahraluxe.com",
}: AdminSeoPanelProps) {
  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  const isTitleGood = titleLength >= 30 && titleLength <= 60;
  const isDescGood = descLength >= 70 && descLength <= 155;

  const previewUrl = `${baseUrl}/${slug || "preview-slug"}`;

  return (
    <FormSection
      title="Search Engine Optimization (SEO)"
      description="Manage search engine metadata and preview how this page appears in search results."
    >
      {/* Live Google Preview */}
      <div className="p-4 border border-stone-200 bg-stone-50 rounded mb-6">
        <p className="text-xs uppercase tracking-wider text-stone-500 font-sans mb-3 font-semibold">
          Google Search Preview
        </p>
        <div className="space-y-1">
          <p className="text-xs text-stone-500 font-mono truncate">{previewUrl}</p>
          <p className="text-base font-medium text-blue-700 hover:underline cursor-pointer truncate font-sans">
            {metaTitle || "Page Title — Zahra Luxe Embroidered Formal Wear"}
          </p>
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {metaDescription ||
              "Discover Pakistani luxury couture and hand-embroidered formal wear. Exquisite craftsmanship and timeless heritage by Zahra Luxe."}
          </p>
        </div>
      </div>

      {/* SEO Score Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-sans">
        <div className="flex items-center gap-2 p-2.5 border border-stone-200 bg-white">
          {isTitleGood ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span>
            Title length: <strong>{titleLength}</strong> / 60 chars
            {isTitleGood ? " (Optimal)" : " (Recommended 30-60 chars)"}
          </span>
        </div>
        <div className="flex items-center gap-2 p-2.5 border border-stone-200 bg-white">
          {isDescGood ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          )}
          <span>
            Description: <strong>{descLength}</strong> / 155 chars
            {isDescGood ? " (Optimal)" : " (Recommended 70-155 chars)"}
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs uppercase tracking-wider text-stone-700 font-medium font-sans">
              Meta Title
            </label>
            <span
              className={`text-xs ${
                titleLength > 60 ? "text-red-600 font-medium" : "text-stone-400"
              }`}
            >
              {titleLength}/60
            </span>
          </div>
          <Input
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="e.g. Ivory Zardozi Raw Silk Peshwas | Zahra Luxe"
            maxLength={70}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs uppercase tracking-wider text-stone-700 font-medium font-sans">
              Meta Description
            </label>
            <span
              className={`text-xs ${
                descLength > 155 ? "text-red-600 font-medium" : "text-stone-400"
              }`}
            >
              {descLength}/155
            </span>
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            rows={3}
            maxLength={180}
            className="w-full p-3 text-sm border border-stone-300 bg-white focus:outline-none focus:border-stone-900 transition-colors font-sans"
            placeholder="e.g. Handcrafted pure silk ensemble featuring intricate silver tilla, resham and pearl embellishments. Available made-to-measure with worldwide shipping."
          />
        </div>

        {onOgImageChange && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Custom OG Image URL (Optional)
            </label>
            <Input
              value={ogImage || ""}
              onChange={(e) => onOgImageChange(e.target.value)}
              placeholder="https://.../og-preview.jpg"
            />
          </div>
        )}

        {onCanonicalUrlChange && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Canonical URL (Optional)
            </label>
            <Input
              value={canonicalUrl || ""}
              onChange={(e) => onCanonicalUrlChange(e.target.value)}
              placeholder="https://zahraluxe.com/original-page"
            />
          </div>
        )}

        {onNoindexChange && (
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="noindex-toggle"
              checked={noindex}
              onChange={(e) => onNoindexChange(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            <label
              htmlFor="noindex-toggle"
              className="text-sm text-stone-700 font-sans cursor-pointer select-none"
            >
              Discourage search engines from indexing this page (noindex)
            </label>
          </div>
        )}
      </div>
    </FormSection>
  );
}
