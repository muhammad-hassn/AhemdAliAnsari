"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormSection } from "@/components/admin/FormSection";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { AdminSeoPanel } from "@/components/admin/AdminSeoPanel";
import { savePageAction } from "@/server/actions/admin";

const PAGE_LABELS: Record<string, string> = {
  about: "About Us",
  privacy: "Privacy Policy",
  refund: "Refund Policy",
  terms: "Terms of Service",
  shipping: "Shipping Policy",
};

interface Page {
  key: string;
  title: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  hero_image_url?: string | null;
}

interface PageState {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  heroImageUrl: string;
}

interface PagesFormClientProps {
  pages: Page[];
}

export function PagesFormClient({ pages }: PagesFormClientProps) {
  const [activeKey, setActiveKey] = useState(pages[0]?.key || "about");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pageStates, setPageStates] = useState<Record<string, PageState>>(() => {
    const init: Record<string, PageState> = {};
    pages.forEach((p) => {
      init[p.key] = {
        title: p.title,
        content: p.content,
        metaTitle: p.meta_title || "",
        metaDescription: p.meta_description || "",
        heroImageUrl: p.hero_image_url || "",
      };
    });
    return init;
  });

  const current = pageStates[activeKey];
  if (!current) return null;

  const update = (field: keyof typeof current, val: string) => {
    setPageStates((prev) => ({
      ...prev,
      [activeKey]: { ...prev[activeKey], [field]: val },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await savePageAction({
      key: activeKey,
      title: current.title,
      content: current.content,
      meta_title: current.metaTitle,
      meta_description: current.metaDescription,
      hero_image_url: current.heroImageUrl,
    });

    setSaving(false);

    if (!res.success) {
      setErrorMsg(res.error || "Failed to save page");
    } else {
      setSuccessMsg(`${PAGE_LABELS[activeKey] || activeKey} page saved successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Page Selector */}
      <div className="lg:w-52 shrink-0">
        <div className="border border-stone-200 bg-white overflow-hidden">
          <p className="text-[10px] uppercase tracking-widest font-mono text-stone-500 px-4 py-3 border-b border-stone-100 font-semibold">
            Select Page
          </p>
          {Object.entries(PAGE_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveKey(key)}
              className={`w-full text-left px-4 py-3 text-xs font-sans transition-colors border-b border-stone-100 last:border-0 ${
                activeKey === key
                  ? "bg-stone-900 text-white font-medium"
                  : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 space-y-6">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-sans">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
            {errorMsg}
          </div>
        )}

        <FormSection
          title={PAGE_LABELS[activeKey] || activeKey}
          description="Edit the rich content for this page using the editor below."
          action={
            <Button
              type="button"
              variant="solid"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Page"}
            </Button>
          }
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-1">
              Page Title *
            </label>
            <input
              required
              value={current.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full h-10 px-3 border border-stone-300 bg-white text-sm text-stone-900 font-sans focus:outline-none focus:border-stone-900"
              placeholder="e.g. Our Story"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium font-sans mb-2">
              Page Content *
            </label>
            <RichTextEditor
              value={current.content}
              onChange={(val) => update("content", val)}
              placeholder="Write rich HTML content for this policy or about page..."
              minHeight="300px"
            />
          </div>
        </FormSection>

        <AdminSeoPanel
          metaTitle={current.metaTitle}
          metaDescription={current.metaDescription}
          slug={activeKey}
          onMetaTitleChange={(val) => update("metaTitle", val)}
          onMetaDescriptionChange={(val) => update("metaDescription", val)}
        />
      </div>
    </div>
  );
}
